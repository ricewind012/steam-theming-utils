# steam-theming-utils

A collection of scripts for easier (and future-proof) Steam theming.

## Usage

```sh
$ npm i steam-theming-utils
$ npx steam-theming-utils <script> <page>
```

Note that running any script requires Steam running with `-cef-enable-debugging`.

## Scripts

| Name                  | Description                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| build_class_modules   | Generates a class map file for usage with other scripts.                                               |
| make_readable_classes | Adds readable versions of classes to the focused window/page. ![Preview][classes-preview]              |
| migrate               | _Try to_ migrate to using readable class names. Other rules that can't be sorted go in `_UNSORTED.css` |
| replace_old_classes   | Replaces old classes with new ones for themes not using the [template][template].                      |

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

## Errors

| Name                      | Description                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| #ClassName is undefined   | Typo or that class either got renamed or removed, and so you will have to update it yourself.     |
| [mod_name] no such module | Typo or that module either got renamed or removed, see diffs [here][diffs] depending on the page. |
| [map_name] no such map    | Use `npx steam-theming-utils build_class_modules map_name` to create it.                          |

## Config

Configured through a `steam-theming-utils.config.js` (or the one from [here][config-files]) file that must `export default` an [object][config-docs]. It's optional and has defaults listed [here][config-defaults].

[classes-preview]: ./img/readable_classes.png
[config-defaults]: https://github.com/ricewind012/steam-theming-utils/blob/master/src/constants.js#L7-L11
[config-docs]: https://github.com/ricewind012/steam-theming-utils/blob/master/src/api.d.ts#L4-L16
[config-files]: https://github.com/cosmiconfig/cosmiconfig#usage-for-end-users
[diffs]: https://github.com/ricewind012/steam-theming-utils/tree/master/cdp/db
[template]: https://github.com/ricewind012/more-advanced-theme-template
