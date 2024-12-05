# steam-theming-utils

A collection of scripts for easier (and futureproof) Steam theming.

## Usage

```sh
$ npm i steam-theming-utils
$ npx steam-theming-utils <script> <page>
```

Note that running any script requires Steam running with `-cef-enable-debugging`.

## Scripts

| Name                  | Description                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------- |
| build_class_modules   | Generates a class map file for usage with other scripts.                                  |
| build_theme           | Builds the theme to be usable by Steam.                                                   |
| make_readable_classes | Adds readable versions of classes to the focused window/page. ![Preview][classes-preview] |
| replace_old_classes   | Replaces old classes with new ones for themes not using the [template][template].         |

## Pages

| Name        | Description                    |
| ----------- | ------------------------------ |
| client      | The Steam client. The default. |
| profileedit | Your profile edit page.        |

## Config

Configured through a `steam-theming-utils.config.js` (or the one from [here][config-files]) file that must `export default` an [object][config-docs]. It's optional and has defaults listed [here][config-defaults].

[classes-preview]: ./img/readable_classes.png
[config-defaults]: https://github.com/ricewind012/steam-theming-utils/blob/master/src/constants.js#L9-L22
[config-docs]: https://github.com/ricewind012/steam-theming-utils/blob/master/src/api.d.ts#L5-L45
[config-files]: https://github.com/cosmiconfig/cosmiconfig#usage-for-end-users
[template]: https://github.com/ricewind012/more-advanced-theme-template
