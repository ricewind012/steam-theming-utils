#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { connection, packagePath } from "./shared.js";

const scriptPath = path.join(packagePath, "lib");
const files = fs
	.readdirSync(scriptPath)
	.filter((e) => e !== "shared.js")
	.map((e) => e.replace(".js", ""));
if (!files.some((e) => process.argv[2] === e)) {
	console.error(
		"Usage: %s [%s]",
		path.basename(process.argv[1]),
		files.join("|"),
	);
	process.exit(2);
}

await connection.Runtime.enable();
connection.Runtime.on("consoleAPICalled", (ev) => {
	if (ev.type !== "error") {
		return;
	}

	console.error(...ev.args.map((e) => e.description || e.value));
});

const script = await import(path.join(scriptPath, `${process.argv[2]}.js`));
await script.execute();
connection.close();
