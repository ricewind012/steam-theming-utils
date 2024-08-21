import fs from "node:fs";
import cp from "node:child_process";
import path from "node:path";
import { run, runCdpFile, runWithResult } from "../src/api.js";
import { CLASS_MAP_FILE } from "../src/constants.js";
import { readFile } from "../src/shared.js";

export async function execute() {
	const dflRan = await runWithResult("!!webpackCache");
	const forceDflRerun = await runWithResult("forceDflRerun");
	if (!dflRan || forceDflRerun) {
		// No need to directly use DFL
		await run(
			readFile(
				path.join("node_modules", "decky-frontend-lib", "dist", "webpack.js"),
			)
				.replace(/export /g, "")
				.replace("const allModules", "let allModules"),
		).catch((e) => {
			// Fails on first launch sometimes
		});

		// Leave only the relevant modules
		await runCdpFile("class_modules_filter.js");
	}
	await runCdpFile("class_modules_db.js");

	const filePath = path.join(process.cwd(), CLASS_MAP_FILE);
	const output = await runCdpFile("class_modules.js");
	const [classModules, allModules] = await runWithResult(
		"[Object.keys(classModules).length, allModules.length]",
	);

	fs.writeFileSync(filePath, JSON.stringify(output));
	cp.spawnSync("npx", ["@biomejs/biome", "format", "--write", filePath]);
	console.log("Wrote %s/%s modules to %o", classModules, allModules, filePath);
}
