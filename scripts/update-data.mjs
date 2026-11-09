import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const publicDir = resolve(root, "docs/public");

function fail(message) {
  console.error(`update-data: ${message}`);
  process.exit(1);
}

const eventPath = process.env.GITHUB_EVENT_PATH;
if (!eventPath) fail("GITHUB_EVENT_PATH is not set");

const event = JSON.parse(await readFile(eventPath, "utf8"));
const payload = event.client_payload;
if (!payload || !payload.entry || !payload.entry.device) {
  fail("repository_dispatch payload has no firmware entry");
}

const entry = payload.entry;
const keys = Array.isArray(payload.device_keys) && payload.device_keys.length
  ? payload.device_keys
  : [entry.device];

const indexPath = resolve(publicDir, "ota.json");
const historyPath = resolve(publicDir, "history.json");
const index = JSON.parse(await readFile(indexPath, "utf8"));
const history = JSON.parse(await readFile(historyPath, "utf8"));

index.schema ??= 2;
index.generator = "Zerowrt-Website";
index.generated = Math.floor(Date.now() / 1000);
index.dist = payload.dist || index.dist || "ZeroWrt";
index.devices ??= {};
for (const key of keys) index.devices[key] = { ...entry };

const releases = Array.isArray(history.releases) ? history.releases : [];
const record = Object.fromEntries(
  ["version", "build_date", "url", "sha256", "size", "file", "target", "device", "label", "changelog"]
    .filter((key) => entry[key] !== undefined)
    .map((key) => [key, entry[key]]),
);
const exists = releases.some(
  (item) => item.device === record.device && Number(item.build_date) === Number(record.build_date),
);
if (!exists) releases.push(record);
releases.sort(
  (left, right) =>
    Number(right.build_date || 0) - Number(left.build_date || 0) ||
    String(left.device || "").localeCompare(String(right.device || "")),
);

const historyData = {
  schema: 1,
  generated: Math.floor(Date.now() / 1000),
  dist: index.dist,
  releases: releases.slice(0, 500),
};

await writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
await writeFile(historyPath, `${JSON.stringify(historyData, null, 2)}\n`, "utf8");
console.log(`updated ${entry.device} ${entry.version}; ${historyData.releases.length} history records`);
