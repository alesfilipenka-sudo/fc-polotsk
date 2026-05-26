"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MATCH_ADMIN_SESSION_COOKIE } from "@/lib/match-admin-auth";

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(MATCH_ADMIN_SESSION_COOKIE);
  redirect("/match-admin/login");
}
