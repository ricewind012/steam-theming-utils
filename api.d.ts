import type Protocol from "devtools-protocol";

interface Script {
	execute(): Promise<void>;
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
): Promise<Protocol.Runtime.EvaluateResponse>;

/**
 * @param file The script to run.
 */
export function runCdpFile(
	file: ScriptFile,
): Promise<Protocol.Runtime.EvaluateResponse>;

/**
 * Like {@link run}, but gets the result immediately.
 * Only use if certain the expression never errors.
 *
 * @param expression JS to run.
 */
export function runWithResult(expression: string): Promise<any>;

export function sleep(ms: number): Promise<void>;
