# steam-theming-utils

A collection of scripts for easier (and future-proof) Steam theming.

## Usage

```sh
$ npm i steam-theming-utils
$ npx steam-theming-utils <script> <page>
```

Note that running any script requires Steam running with `-cef-enable-debugging`.

## Examples

You may encounter a `#ClassName is undefined` error - this means that class either got renamed or removed, and so you will have to update it yourself.

### #1

Generate a class map file for the client whenever it updates & build the theme:

```sh
$ npx steam-theming-utils build_class_modules
$ npx steam-theming-utils build_theme
```

### #2

Add readable classes on the shopping cart page:

```sh
$ npx steam-theming-utils make_readable_classes shoppingcart
```

Write something and build the theme:

```sh
$ npx steam-theming-utils build_theme shoppingcart
```

## Scripts

| Name                  | Description                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------- |
| build_class_modules   | Generates a class map file for usage with other scripts.                                  |
| build_theme           | Builds the theme to be usable by Steam.                                                   |
| make_readable_classes | Adds readable versions of classes to the focused window/page. ![Preview][classes-preview] |
| replace_old_classes   | Replaces old classes with new ones for themes not using the [template][template].         |

## Pages

| Name               | Description                                                                  |
| ------------------ | ---------------------------------------------------------------------------- |
| apppage            | Related items & controller info in https://store.steampowered.com/app/666220 |
| accountpreferences | https://store.steampowered.com/account                                       |
| client             | The Steam client. The default.                                               |
| gameslist          | https://steamcommunity.com/my/games                                          |
| notificationspage  | https://steamcommunity.com/my/notifications                                  |
| profileedit        | https://steamcommunity.com/my/edit                                           |
| shoppingcart       | https://store.steampowered.com/cart                                          |

## Config

Configured through a `steam-theming-utils.config.js` (or the one from [here][config-files]) file that must `export default` an [object][config-docs]. It's optional and has defaults listed [here][config-defaults].

[classes-preview]: ./img/readable_classes.png
[config-defaults]: https://github.com/ricewind012/steam-theming-utils/blob/master/src/constants.js#L9-L23
[config-docs]: https://github.com/ricewind012/steam-theming-utils/blob/master/src/api.d.ts#L5-L55
[config-files]: https://github.com/cosmiconfig/cosmiconfig#usage-for-end-users
[template]: https://github.com/ricewind012/more-advanced-theme-template
