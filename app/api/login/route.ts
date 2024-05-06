import { NextRequest, NextResponse } from "next/server";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { db } from "../../../src/lib/db";
import { user_addresses, users } from "../../../src/lib/schema";
import { getAttestationsByCoinbaseVerified } from "../../..//src/utils/coinbaseVerified";
import { checkOpBadgeholder } from "../../..//src/utils/opBadgeholder";
import { eq } from "drizzle-orm";
import { NewUserAddress } from "../../../src/types";
import {
  NetworkType,
  networkEndpoints,
} from "../../components/graphqlEndpoints";
import { getAddress } from "viem";

// Neynar API Client
const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY as string);

// Addresses for verification checks
const coinbaseAddress = "0x357458739F90461b99789350868CD7CF330Dd7EE";
const optimismAddress = "0x621477dBA416E12df7FF0d48E14c4D20DC85D7D9";
const selectedNetwork: NetworkType = "Base";
const endpoint = networkEndpoints[selectedNetwork];
const selectedNetwork1: NetworkType = "Optimism";
const endpoint1 = networkEndpoints[selectedNetwork1];

export async function POST(request: NextRequest) {
  const { fid } = await request.json();

  try {
    // Fetch user data via Neynar API
    const fidData = await client.fetchBulkUsers([parseInt(fid)]);
    const userData = fidData.users[0];
    console.log("User Data from neynar", userData);
    const ethAddresses = userData.verified_addresses.eth_addresses.slice(0, 3); // Get first three addresses
    const pfp_url = userData.pfp_url;
    const numberOfAddresses = Math.min(ethAddresses.length, 3);
    const addressesToInsert = ethAddresses.slice(0, numberOfAddresses);
    console.log("Number of Addresses to Insert:", numberOfAddresses);
    console.log("pfp_url", pfp_url);
    console.log("ethAddresses", ethAddresses);

    // Check if the user already exists in the database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.fid, fid))
      .limit(1)
      .then((result) => result[0]);

    console.log("Existing User:", existingUser);

    if (!existingUser) {
      // If the user doesn't exist, insert the user into the database
      const newUser = {
        fid: fid.toString(),
        username: userData.username,
        pfp_url: userData.pfp_url || "",
      };
      console.log("New User, ", newUser);
      await db.insert(users).values(newUser);
    }

    // Check if the user's addresses are already stored in the database
    const storedAddresses = await db
      .select()
      .from(user_addresses)
      .where(eq(user_addresses.userfid, fid))
      .then((result) => result.map((row) => row.ethaddress));

    // Filter out the addresses that are already stored
    const newAddresses = ethAddresses.filter(
      (address) => !storedAddresses.includes(address)
    );

    // Orders for the addresses
    const addressOrders = ["first", "second", "third"];

    // Verify each new address concurrently and prepare the results
    const addressInserts = await Promise.all(
      newAddresses.map(async (ethaddress, index) => {
        const checkAddress = getAddress(ethaddress);
        console.log(`Processing Ethereum Address #${index + 1}:`, ethaddress);

        // Coinbase Verification
        const isCoinbaseVerified = await (async () => {
          console.log(
            `Starting Coinbase Verification for Address: ${checkAddress}
            ${coinbaseAddress}
            ${endpoint}`
          );
          const coinbaseAttestations = await getAttestationsByCoinbaseVerified(
            coinbaseAddress,
            checkAddress,
            endpoint
          );
          console.log("coinbaseAttestations", coinbaseAttestations);
          return coinbaseAttestations && coinbaseAttestations.length > 0;
        })();
        console.log("isCoinbaseVerified", isCoinbaseVerified);

        // Optimism Badgeholder Check
        const isOpBadgeholder = await (async () => {
          console.log(`Starting Optimism Badgeholder Check for ${ethaddress}`);
          const opAttestations = await checkOpBadgeholder(
            optimismAddress,
            checkAddress,
            endpoint1
          );
          console.log("opAttestations", opAttestations);
          return opAttestations && opAttestations.length > 0;
        })();
        console.log("isOpBadgeholder", isOpBadgeholder);

        // Warpcast Power Badge (from Neynar API)
        const isPowerBadgeholder = !!userData.power_badge;
        console.log("isPowerBadgeholder", isPowerBadgeholder);

        // Return an object matching the `NewUserAddress` structure
        return {
          userfid: fid.toString(),
          ethaddress,
          addressorder: addressOrders[index],
          coinbaseverified: isCoinbaseVerified,
          opbadgeholder: isOpBadgeholder,
          powerbadgeholder: isPowerBadgeholder,
        };
      })
    );

    // Insert the new addresses into the `user_addresses` table
    if (addressInserts.length > 0) {
      await db.insert(user_addresses).values(addressInserts);
    }

    // Return a successful response
    const response = {
      username: userData.username,
      ethAddress: ethAddresses[0] || "",
      pfp_url: pfp_url || "",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching data", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
