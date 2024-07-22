# steam-theming-utils

A collection of scripts for easier Steam theming.

## Usage

```sh
$ npm i
$ npx steam-theming-utils <script>
```

Note that running any script requires Steam running with `-cef-enable-debugging`.

## Script list

| Name                  | Description                                                                       |
| --------------------- | --------------------------------------------------------------------------------- |
| build_class_modules   | Generates a `class_map.json` file for usage with other scripts.                   |
| build_theme           | Builds the theme. Requires a [specific directory structure][template].            |
| make_readable_classes | Adds readable versions of classes to the focused window.                          |
| replace_old_classes   | Replaces old classes with new ones for themes not using the [template][template]. |

[template]: https://github.com/ricewind012/more-advanced-theme-template
