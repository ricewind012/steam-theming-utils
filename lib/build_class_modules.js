import fs from "node:fs";
import cp from "node:child_process";
import path from "node:path";
import { runCdpFile, runWithResult } from "../src/api.js";
import { CLASS_MAP_FILE } from "../src/constants.js";

export async function execute() {
	const webpackRan = await runWithResult("!!webpackCache");
	const forceWebpackRerun = await runWithResult("forceDflRerun");
	if (!webpackRan || forceWebpackRerun) {
		await runCdpFile("class_modules_webpack.js");
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
