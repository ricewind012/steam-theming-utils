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
