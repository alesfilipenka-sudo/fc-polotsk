"use server";

import { revalidatePath } from "next/cache";
import { getWriteClient } from "@/lib/sanity-write";

export type EventType = "goal" | "yellow" | "red";
export type Side = "home" | "away";

export interface CreateEventInput {
  matchId: string;
  type: EventType;
  minute: number;
  forTeam: Side;
  playerRef?: string;
  playerName?: string;
  assistRef?: string;
  assistName?: string;
  ownGoal?: boolean;
}

function randomKey() {
  return Math.random().toString(36).slice(2, 14);
}

/**
 * Добавляет событие в match.events[]. Для гола инкрементирует hs/as.
 */
export async function createEventAction(input: CreateEventInput) {
  if (!input.matchId) throw new Error("matchId is required");
  if (!input.type) throw new Error("type is required");
  if (!Number.isFinite(input.minute) || input.minute < 1 || input.minute > 130) {
    throw new Error("minute must be 1..130");
  }
  if (input.forTeam !== "home" && input.forTeam !== "away") {
    throw new Error("forTeam must be 'home' or 'away'");
  }
  if (!input.playerRef && !(input.playerName && input.playerName.trim())) {
    throw new Error("playerRef or playerName is required");
  }

  const event: Record<string, unknown> = {
    _type: "event",
    _key: randomKey(),
    type: input.type,
    minute: input.minute,
    forTeam: input.forTeam,
  };

  if (input.playerRef) {
    event.player = { _type: "reference", _ref: input.playerRef };
  } else {
    event.playerName = input.playerName!.trim();
  }

  if (input.type === "goal") {
    event.ownGoal = !!input.ownGoal;
    if (input.assistRef) {
      event.assist = { _type: "reference", _ref: input.assistRef };
    } else if (input.assistName && input.assistName.trim()) {
      event.assistName = input.assistName.trim();
    }
  }

  const client = getWriteClient();

  let patch = client
    .patch(input.matchId)
    .setIfMissing({ events: [] })
    .insert("after", "events[-1]", [event]);

  if (input.type === "goal") {
    patch = patch.setIfMissing({ hs: 0, as: 0 });
    const field = input.forTeam === "home" ? "hs" : "as";
    patch = patch.inc({ [field]: 1 });
  }

  await patch.commit({ autoGenerateArrayKeys: true });

  revalidatePath(`/match-admin/${input.matchId}`);
  revalidatePath("/");
}

/**
 * Удаляет последнее событие из match.events[]. Если это был гол —
 * декрементирует счёт.
 */
export async function undoEventAction(matchId: string) {
  if (!matchId) throw new Error("matchId is required");
  const client = getWriteClient();

  const match = await client.fetch<{
    events?: { _key: string; type?: string; forTeam?: string }[];
  } | null>(
    `*[_id == $matchId][0]{ "events": events[]{_key, type, forTeam} }`,
    { matchId },
  );
  const events = match?.events ?? [];
  if (events.length === 0) return;
  const last = events[events.length - 1];

  let patch = client.patch(matchId).unset([`events[_key=="${last._key}"]`]);

  if (last.type === "goal") {
    const field = last.forTeam === "home" ? "hs" : "as";
    patch = patch.dec({ [field]: 1 });
  }

  await patch.commit();

  revalidatePath(`/match-admin/${matchId}`);
  revalidatePath("/");
}

/**
 * Перевод матча в новый статус scheduled ↔ live.
 */
export async function setMatchStatusAction(
  matchId: string,
  status: "scheduled" | "live",
) {
  if (!matchId) throw new Error("matchId is required");
  const client = getWriteClient();
  await client.patch(matchId).set({ status }).commit();
  revalidatePath(`/match-admin/${matchId}`);
  revalidatePath("/");
}

interface RawGoalEvent {
  type?: string;
  minute?: number;
  forTeam?: "home" | "away";
  ownGoal?: boolean;
  player?: { _ref?: string };
  playerName?: string;
}

/**
 * Финализирует матч:
 *   1. Читает events[] и фильтрует type="goal"
 *   2. Маппит голы в формат scorers[] (тот же, что используется в пост-матч карточке)
 *   3. Одной транзакцией: status="finished", finishedAt=now, scorers=synced
 *
 * После этого матч уходит из LIVE_MATCH_QUERY и появляется в
 * LAST_FINISHED_MATCH_QUERY, пост-матч карточка показывает голы.
 */
export async function finalizeMatchAction(matchId: string) {
  if (!matchId) throw new Error("matchId is required");
  const client = getWriteClient();

  const match = await client.fetch<{ events?: RawGoalEvent[] } | null>(
    `*[_id == $matchId][0]{
      "events": events[]{ type, minute, forTeam, ownGoal, player, playerName }
    }`,
    { matchId },
  );

  const events = match?.events ?? [];
  const scorers = events
    .filter(
      (e) =>
        e.type === "goal" &&
        Number.isFinite(e.minute) &&
        (e.forTeam === "home" || e.forTeam === "away"),
    )
    .map((e) => {
      const goal: Record<string, unknown> = {
        _type: "goal",
        _key: randomKey(),
        minute: e.minute,
        forTeam: e.forTeam,
        ownGoal: !!e.ownGoal,
      };
      if (e.player?._ref) {
        goal.player = { _type: "reference", _ref: e.player._ref };
      } else if (e.playerName && e.playerName.trim()) {
        goal.playerName = e.playerName.trim();
      }
      return goal;
    });

  await client
    .patch(matchId)
    .set({
      status: "finished",
      finishedAt: new Date().toISOString(),
      scorers,
    })
    .commit();

  revalidatePath(`/match-admin/${matchId}`);
  revalidatePath("/");
}
