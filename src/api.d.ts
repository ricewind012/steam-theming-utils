import type CDP from "chrome-remote-interface";
import type Protocol from "devtools-protocol";

export interface Config {
	/**
	 * Path of built class maps.
	 */
	classMaps: string;

	/**
	 * Directories for the postcss plugin to ignore.
	 *
	 * For example: `["client/shared", "web/vars"]` will ignore
	 * `src/client/shared` and `src/web/vars`, assuming the base dir is `src`.
	 */
	ignore: string[];
}

interface Script {
	execute(arg?: string): Promise<void>;
}

/**
 * Existing scripts.
 */
type ScriptFile =
	| "build_class_modules"
	| "make_readable_classes"
	| "migrate"
	| "replace_old_classes";

/**
 * Pages that have an existing class map, excluding `client`.
 */
export type Page =
	| "accountpreferences"
	| "apppage"
	| "gameslist"
	| "notificationspage"
	| "profileedit"
	| "shoppingcart";

export declare const connection: CDP.Client;
export declare const config: Config;

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
