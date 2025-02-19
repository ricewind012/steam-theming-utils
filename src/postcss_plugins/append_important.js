/**
 * @typedef {object} PluginOptions
 *
 * @property {RegExp[]} filter
 *   List of paths to ignore.
 */

/** @type {PluginOptions} */
const DEFAULT_OPTIONS = {
	filter: [],
};

/**
 * Appends `!important` to all declarations. Filter paths with
 * {@link PluginOptions.filter}.
 */
export const appendImportantPlugin =
	(opts = DEFAULT_OPTIONS) =>
	(css) => {
		css.walkRules((rule) => {
			const nodes = rule.nodes.filter(
				(node) => !opts.filter.some((e) => e.test(node.parent.selector)),
			);
			for (const node of nodes) {
				node.important = true;
			}
		});
	};
appendImportantPlugin.postcss = true;
