exportedModules = [
	["notificationspage", (e) => e.NotificationPageCtn],
	[
		"notification",
		(e) =>
			e.StandardTemplateContainer &&
			!e.AllNotificationsCommentPlus &&
			!e.ShortTemplate,
	],
	// TODO: has DesktopToastTemplate, BottomBar, etc., wtf?
	["notificationcontainer", (e) => e.SteamNotificationWrapper],
];
