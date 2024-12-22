import type CDP from "chrome-remote-interface";
import type Protocol from "devtools-protocol";
import type sass from "sass";

export interface Config {
	paths: {
		/**
		 * Path of built class maps.
		 */
		classMaps: string;

		/**
		 * Path of built CSS you can point your theme to.
		 */
		dist: string;

		/**
		 * Various paths of the theme's source code.
		 *
		 * All paths here are going to be the same in the `dist` key,
		 * i.e. `src/client/rootmenu.css` -> `dist/client/rootmenu.css`.
		 */
		src: {
			client: string;
			profileedit: string;
		};

		/**
		 * An array of dirs to ignore.
		 *
		 * For example:
		 * `{ client: ["shared"] }` will ignore `src/client/shared`,
		 * assuming the `src.client` key is set to `src/client`.
		 */
		ignore: {
			[page: string]: string[];
		};
	};
	sass: {
		/**
		 * Whether to use sass.
		 */
		use: boolean;

		/**
		 * Sass options.
		 *
		 * Note that PostCSS is still the one controlling source maps,
		 * so enable it there instead.
		 *
		 * @todo Change `LegacyOptions` to `Options` when
		 *       `@csstools/postcss-sass` changes to the normal API.
		 */
		options: sass.LegacyOptions<"async">;
	};
}

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

export function getConfig(): Promise<Config>;

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
