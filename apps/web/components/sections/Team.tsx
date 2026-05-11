import { sanityFetch } from "@/lib/sanity";
import { SQUAD_QUERY } from "@/lib/queries";
import type { Player } from "@/lib/types";
import { TeamClient } from "./TeamClient";

const PLACEHOLDER_SQUAD: Player[] = [
  { num: 1, name: "Игрок один", pos: "GK", age: 28, country: "BLR" },
  { num: 2, name: "Игрок два", pos: "DF", age: 24, country: "BLR" },
  { num: 5, name: "Игрок пять", pos: "DF", age: 26, country: "BLR" },
  { num: 8, name: "Игрок восемь", pos: "MF", age: 22, country: "BLR" },
  { num: 10, name: "Игрок десять", pos: "MF", age: 27, country: "BLR" },
  { num: 17, name: "Игрок семнадцать", pos: "FW", age: 21, country: "BLR" },
  { num: 9, name: "Игрок девять", pos: "FW", age: 25, country: "BLR" },
  { num: 4, name: "Игрок четыре", pos: "DF", age: 30, country: "BLR" },
];

export async function Team() {
  const squad = await sanityFetch<Player[]>(SQUAD_QUERY).catch(
    () => null,
  );
  const data = squad && squad.length > 0 ? squad : PLACEHOLDER_SQUAD;
  return <TeamClient squad={data} />;
}
