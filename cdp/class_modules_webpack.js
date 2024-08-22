let initReq;
const webpackCache = {};
window.webpackChunksteamui.push([
	[Math.random()],
	{},
	(r) => {
		initReq = r;
	},
]);
for (const i of Object.keys(initReq.m)) {
	webpackCache[i] = initReq(i);
}

// Leave only the relevant modules
const allModules = Object.values(webpackCache).filter((e) => {
	if (!e || typeof e !== "object" || e.__esModule) {
		return false;
	}

	const keys = Object.keys(e);
	const first = keys[0];
	return (
		first &&
		first.length >= 2 &&
		!(
			keys.length === 1 &&
			(first === "duration-app-launch" ||
				first === "version" ||
				first.match(/^str[A-Z]/))
		) &&
		keys.every((k) => typeof e[k] === "string")
	);
});

const findModule = (filter) => allModules.find(filter);
const findAllModules = (filter) => allModules.filter(filter);

function findFirstModule(filter, component) {
	const modules = findAllModules(filter);
	const printError = (msg) => {
		console.error("[%s] %s", component, msg);
	};

	if (modules.length === 0) {
		printError("found no modules");
	}
	if (modules.length > 1) {
		printError("found more than 1 module, returning first found");
	}

	return modules[0];
}

/**
 * Find a unique class name from multiple similiar class modules.
 *
 * @param key Class name.
 * @param index Array index.
 */
const findUniqueKey = (key, index = 0) =>
	Object.keys(findAllModules((mod) => mod[key])[index]).find(
		(mod) => findAllModules((mod2) => mod2[mod]).length === 1,
	);
