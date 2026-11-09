import { mkdir, writeFile } from "node:fs/promises";

const base = (process.env.OTA_BASE_URL || "https://ota.tatalvpai.vip").replace(/\/+$/, "");
const target = new URL("../docs/public/", import.meta.url);

await mkdir(target, { recursive: true });

for (const name of ["ota.json", "history.json"]) {
  const url = `${base}/${name}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`);
  }
  const data = await response.json();
  await writeFile(new URL(name, target), `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`synced ${name}`);
}
