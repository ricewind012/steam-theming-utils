import cp from "node:child_process";
import path from "node:path";
import {
	CDP_FILES_PATH,
	readFile,
	run,
	runWithResult,
	sleep,
} from "../shared.js";

const DELAY = 2;

export async function execute() {
	const scriptRan = await runWithResult("!!classModules");
	if (!scriptRan) {
		cp.spawnSync("npx", ["steam-theming-utils", "build_class_modules"]);
	}

	console.log("Waiting for focus in %s seconds...", DELAY);
	await sleep(DELAY * 1_000);
	await run(readFile(path.join(CDP_FILES_PATH, "make_readable_classes.js")));

	const focusedPopupName = await runWithResult("focusedPopup.m_strName");
	console.log("Got target %o", focusedPopupName);
}
