allModules = findAllModules((e) => {
	if (!e || typeof e !== "object" || e.__esModule) {
		return;
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
