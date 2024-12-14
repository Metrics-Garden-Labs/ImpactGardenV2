"use server";

import { db } from "../../../src/lib/db/dbattestations";
import { user_addresses, users, op_delegates } from "../../../src/lib/schema";

import { eq } from "drizzle-orm";

export async function getFIDbyAddress(address: string) {
  const result = await db
    .select()
    .from(user_addresses)
    .limit(1)
    .where(eq(user_addresses.ethaddress, address.toLowerCase()));

  return result[0].userfid || null;
}
