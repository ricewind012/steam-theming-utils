import type CDP from "chrome-remote-interface";
import type Protocol from "devtools-protocol";

interface Script {
	execute(arg?: string): Promise<void>;
}

/**
 * Existing scripts.
 */
type ScriptFile =
	| "build_class_modules"
	| "build_theme"
	| "make_readable_classes"
	| "replace_old_classes";

/**
 * @param file The script to read.
 */
export function readScript(name: ScriptFile): Promise<Script>;

/**
 * @param expression JS to run.
 */
export function run(
	expression: string,
	conn?: CDP.Client,
): Promise<Protocol.Runtime.EvaluateResponse>;

/**
 * @param file The script to run.
 */
export function runCdpFile(
	file: ScriptFile,
	conn?: CDP.Client,
): Promise<Protocol.Runtime.EvaluateResponse>;

/**
 * Like {@link run}, but gets the result immediately.
 * Only use if certain the expression never errors.
 *
 * @param expression JS to run.
 */
export function runWithResult(
	expression: string,
	conn?: CDP.Client,
): Promise<any>;

export function sleep(ms: number): Promise<void>;
