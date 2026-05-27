"use server";

import { revalidatePath } from "next/cache";
import { getWriteClient } from "@/lib/sanity-write";

export type EventType = "goal" | "yellow" | "red" | "sub";
export type Side = "home" | "away";

export interface CreateEventInput {
  matchId: string;
  type: EventType;
  minute: number;
  forTeam: Side;
  // Основной игрок: для goal/yellow/red — автор/получатель;
  // для sub — выходящий на поле (playerOn).
  playerRef?: string;
  playerName?: string;
  // Goal-only: ассистент
  assistRef?: string;
  assistName?: string;
  ownGoal?: boolean;
  // Sub-only: уходящий с поля
  playerOffRef?: string;
  playerOffName?: string;
}

function randomKey() {
  return Math.random().toString(36).slice(2, 14);
}

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
  if (input.type === "sub") {
    if (
      !input.playerOffRef &&
      !(input.playerOffName && input.playerOffName.trim())
    ) {
      throw new Error("Sub event requires playerOff (ref or name)");
    }
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

  if (input.type === "sub") {
    if (input.playerOffRef) {
      event.playerOff = { _type: "reference", _ref: input.playerOffRef };
    } else {
      event.playerOffName = input.playerOffName!.trim();
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

/* ============================================================
   LINEUPS
   ============================================================ */

export interface SaveLineupEntry {
  playerRef?: string;
  playerName?: string;
  playerNumber?: number;
  position?: string;
  isStarter: boolean;
  isCaptain: boolean;
  positionSlot?: number;
}

export interface SaveLineupInput {
  matchId: string;
  side: Side;
  formation?: string;
  tokenColor?: string;
  entries: SaveLineupEntry[];
}

export async function saveLineupAction(input: SaveLineupInput) {
  if (!input.matchId) throw new Error("matchId is required");
  if (input.side !== "home" && input.side !== "away") {
    throw new Error("side must be 'home' or 'away'");
  }

  const cleaned = input.entries
    .filter(
      (e) =>
        e.playerRef ||
        (e.playerName && e.playerName.trim()),
    )
    .map((e) => {
      const obj: Record<string, unknown> = {
        _type: "lineupEntry",
        _key: randomKey(),
        isStarter: !!e.isStarter,
        isCaptain: !!e.isCaptain,
      };
      if (e.positionSlot != null) obj.positionSlot = e.positionSlot;
      if (e.playerRef) {
        obj.player = { _type: "reference", _ref: e.playerRef };
      } else {
        obj.playerName = e.playerName!.trim();
        if (e.playerNumber != null) obj.playerNumber = e.playerNumber;
        if (e.position) obj.position = e.position;
      }
      return obj;
    });

  const lineupField = input.side === "home" ? "lineupHome" : "lineupAway";
  const colorField = input.side === "home" ? "tokenColorHome" : "tokenColorAway";

  const setObj: Record<string, unknown> = { [lineupField]: cleaned };
  if (input.formation) setObj.formation = input.formation;
  if (input.tokenColor) setObj[colorField] = input.tokenColor;

  const client = getWriteClient();
  await client.patch(input.matchId).set(setObj).commit();

  revalidatePath(`/match-admin/${input.matchId}`);
  revalidatePath("/");
}

/* ============================================================
   STATS
   ============================================================ */

export interface SaveStatsInput {
  matchId: string;
  shotsHome?: number;
  shotsAway?: number;
  shotsOnGoalHome?: number;
  shotsOnGoalAway?: number;
  possessionHome?: number;
  possessionAway?: number;
  cornersHome?: number;
  cornersAway?: number;
  offsidesHome?: number;
  offsidesAway?: number;
}

export async function saveStatsAction(input: SaveStatsInput) {
  if (!input.matchId) throw new Error("matchId is required");

  const stats: Record<string, number> = {};
  const keys: Array<keyof SaveStatsInput> = [
    "shotsHome",
    "shotsAway",
    "shotsOnGoalHome",
    "shotsOnGoalAway",
    "possessionHome",
    "possessionAway",
    "cornersHome",
    "cornersAway",
    "offsidesHome",
    "offsidesAway",
  ];
  for (const k of keys) {
    const v = input[k];
    if (typeof v === "number" && Number.isFinite(v)) {
      stats[k] = v;
    }
  }

  const client = getWriteClient();
  await client.patch(input.matchId).set({ stats }).commit();

  revalidatePath(`/match-admin/${input.matchId}`);
  revalidatePath("/");
}
