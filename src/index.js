#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { connection, readScript } from "./api.js";
import { SCRIPT_PATH } from "./constants.js";

const files = fs.readdirSync(SCRIPT_PATH).map((e) => e.replace(".js", ""));
if (!files.some((e) => process.argv[2] === e)) {
	console.error("Usage: %s <script>", path.basename(process.argv[1]));
	console.error("Where <script>:\n%s", files.map((e) => `- ${e}`).join("\n"));
	connection.close();
	process.exit(2);
}

const script = await readScript(process.argv[2]);
await script.execute(process.argv[3]);
connection.close();
