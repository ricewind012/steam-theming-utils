import { connection, readScript, runCdpFile } from "../src/api.js";
import { createWebConnection } from "../src/shared.js";

export async function execute(page = "client") {
	const isClient = page === "client";
	const webConn = isClient ? null : await createWebConnection(page);
	const conn = isClient ? connection : webConn;

	const script = await readScript("build_class_modules");
	await script.execute(page);

	if (isClient) {
		console.log("Waiting for focus...");
	}
	await runCdpFile("make_readable_classes.js", conn);
}
