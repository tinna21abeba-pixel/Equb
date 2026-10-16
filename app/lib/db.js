import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const file = path.join(process.cwd(), "data", "db.json");

export async function readDb() {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return { users: [], equbs: [] };
  }
}

async function writeDb(db) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(db, null, 2));
}

let queue = Promise.resolve();

export function mutate(change) {
  const run = queue.then(async () => {
    const db = await readDb();
    const result = await change(db);
    await writeDb(db);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

export const newId = (prefix) => `${prefix}_${randomUUID().slice(0, 8)}`;