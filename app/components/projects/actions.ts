"use server";

import { db } from "../../../src/lib/db/dbattestations";
import { user_addresses } from "../../../src/lib/schema";
import { eq } from "drizzle-orm";
import { NEXT_PUBLIC_URL } from "@/src/config/config";

export async function getFIDbyAddress(address: string) {
  const result = await db
    .select()
    .from(user_addresses)
    .limit(1)
    .where(eq(user_addresses.ethaddress, address.toLowerCase()));

  const dbUserID = result?.[0]?.userfid;
  if (dbUserID) return dbUserID;

  try {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        "x-neynar-experimental": "false",
        "x-api-key": process.env.NEYNAR_API_KEY as string,
      },
    };

    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}&address_types=verified_address`,
      options
    );

    const data = await response.json();
    console.debug({ data });

    const apiData = Object.values(data)?.[0] as [{ fid: number }];
    const apiFID = apiData?.[0]?.fid;

    console.debug({ apiData, apiFID });

    if (apiFID) {
      await fetch(`${NEXT_PUBLIC_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fid: apiFID }),
      });
    }
  } catch (_) {}

  // if (fid) return fid;

  // If the user doesn't exist, insert the user into the database
  // Create a unique identifier for the user (fid)
  return null;
}
