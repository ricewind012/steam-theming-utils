import path from "node:path";
import { lilconfig } from "lilconfig";
import { CDP_FILES_PATH, DEFAULT_CONFIG, SCRIPT_PATH } from "./constants.js";
import { createConnection, readFile } from "./shared.js";

export const connection = await createConnection((e) =>
	e.find((e) => e.title === "SharedJSContext"),
).catch((e) => {
	console.log(
		"%s\nTry running Steam with %o",
		e.message,
		"-cef-enable-debugging",
	);
	process.exit(1);
});

export const getConfig = async () =>
	(await lilconfig("steam-theming-utils").search())?.config || DEFAULT_CONFIG;
export const readScript = (name) =>
	import(`file://${path.join(SCRIPT_PATH, `${name}.js`)}`);

export const run = (expression, conn = connection) =>
	conn.Runtime.evaluate({
		expression,
		awaitPromise: true,
		returnByValue: true,
	});
export const runCdpFile = (file, conn = connection) =>
	runWithResult(readFile(path.join(CDP_FILES_PATH, file)), conn);
export const runWithResult = async (expression, conn = connection) =>
	(await run(expression, conn)).result.value;

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
