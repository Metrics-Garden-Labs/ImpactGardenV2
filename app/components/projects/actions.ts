"use server";

import { db } from "../../../src/lib/db/dbattestations";
import { user_addresses, users } from "../../../src/lib/schema";
import { eq } from "drizzle-orm";
import { NEXT_PUBLIC_URL } from "@/src/config/config";

const existAddressData = async (address: string) => {
  const result = await db
    .select()
    .from(user_addresses)
    .limit(1)
    .where(eq(user_addresses.ethaddress, address.toLowerCase()));

  return (result?.[0] || null) as (typeof result)[0] | null;
};

import { createHash } from "crypto";

function generateCode(address: string): string {
  const hash = createHash("sha256").update(address).digest("hex");
  const code = parseInt(hash.slice(0, 8), 16) % 100000000;
  return code.toString().padEnd(8, "0");
}

export async function getFIDbyAddress(address: string) {
  const result = await existAddressData(address);
  // Check if the user already exists in the database

  const dbUserID = result?.userfid;
  if (dbUserID) return dbUserID;

  try {
    // If the user doesn't exist, insert the user into the database
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
    const apiData = Object.values(data)?.[0] as [{ fid: number }];
    const apiFID = apiData?.[0]?.fid;

    if (apiFID) {
      await fetch(`${NEXT_PUBLIC_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fid: apiFID }),
      });

      return apiFID;
    }
  } catch (_) {}

  // We check again if the user exists in the database
  const dataExists = await existAddressData(address);
  if (dataExists) return dataExists.userfid;

  // If the user doesn't exist, insert the user into the database
  // Create a unique identifier for the user (fid)
  const addressFID = generateCode(address);

  const newUser = {
    fid: addressFID,
    username: address,
    pfp_url: "/pfp.png",
  };

  console.log("New User, ", newUser);
  await db.insert(users).values(newUser);

  return addressFID;
}
