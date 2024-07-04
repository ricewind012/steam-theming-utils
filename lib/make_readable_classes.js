import { readScript, runCdpFile, runWithResult, sleep } from "../shared.js";

const DELAY = 2;

export async function execute() {
	const scriptRan = await runWithResult("!!classModules");
	if (!scriptRan) {
		const script = await readScript("build_class_modules");
		await script.execute();
	}

	console.log("Waiting for focus in %s seconds...", DELAY);
	await sleep(DELAY * 1_000);
	await runCdpFile("make_readable_classes.js");

	const focusedPopupName = await runWithResult("focusedPopup.m_strName");
	console.log("Got target %o", focusedPopupName);
}
