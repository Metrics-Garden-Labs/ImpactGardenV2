import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import { projects } from "../../../lib/schema";
import dotenv from "dotenv";
import { eq } from "drizzle-orm";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";

// Load environment variables from .env file
dotenv.config();

const POSTGRES_URL = process.env.POSTGRES_URL;

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

if (!POSTGRES_URL) {
  console.error("POSTGRES_URL environment variable is not set.");
  process.exit(1); // Exit with failure
}

if (!NEYNAR_API_KEY) {
  console.error("NEYNAR_API_KEY environment variable is not set.");
  process.exit(1); // Exit with failure
}

process.env.POSTGRES_URL = POSTGRES_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = drizzle(sql);
const client = new NeynarAPIClient(NEYNAR_API_KEY);

export const updateProjectsInDB = async () => {
  try {
    const filePath = path.join(__dirname, "Round6Projects.json");
    const jsonData = fs.readFileSync(filePath, "utf-8");

    // Ensure jsonData is parsed correctly
    let projectsData;
    try {
      const parsedData = JSON.parse(jsonData);
      console.log("Parsed JSON data:", parsedData);
      projectsData = parsedData;

      // Access the projects array
      // projectsData = parsedData.projects;
      // if (!Array.isArray(projectsData)) {
      //   throw new Error("Parsed data is not an array");
      // }
    } catch (parseError) {
      console.error("Error parsing JSON data:", parseError);
      return;
    }

    console.log(`Number of projects parsed: ${projectsData.length}`);

    // Fetch existing projects from the database
    const existingProjects = await db.select().from(projects);
    console.log(
      `Number of existing projects in DB: ${existingProjects.length}`
    );

    // Create a map of project names to userFid
    const projectNameToUserFid = new Map();
    for (const project of projectsData) {
      const userFid =
        project.team && project.team.length > 0 ? project.team[0] : null;
      if (userFid) {
        projectNameToUserFid.set(project.name, userFid);
      }
    }

    // Update the userFid and ethAddress for existing projects that match by name
    for (const existingProject of existingProjects) {
      const userFid = projectNameToUserFid.get(existingProject.projectName);
      if (userFid) {
        console.log(`Fetching data for userFid: ${userFid}`);
        const fidData = await client.fetchBulkUsers([parseInt(userFid)]);
        const userData = fidData.users[0];

        const ethAddress =
          userData?.verified_addresses?.eth_addresses?.[0] ||
          "0x0000000000000000000000000000000000000000";

        console.log(
          `Updating project: ${existingProject.projectName} with userFid: ${userFid} and ethAddress: ${ethAddress}`
        );

        await db
          .update(projects)
          .set({ userFid, ethAddress })
          .where(eq(projects.projectName, existingProject.projectName));
      }
    }

    console.log("Projects updated in the database successfully.");
  } catch (error) {
    console.error("Error updating projects in the database:", error);
  }
};

updateProjectsInDB().catch((error) => {
  console.error("Unexpected error:", error);
});