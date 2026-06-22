# @vvi/rollup-external

[![version](<https://img.shields.io/npm/v/@vvi/rollup-external.svg?logo=npm&logoColor=rgb(0,0,0)&label=版本号&labelColor=rgb(73,73,228)&color=rgb(0,0,0)>)](https://www.npmjs.com/package/@vvi/rollup-external) [![issues submit](<https://img.shields.io/badge/issues-submit-rgb(255,0,63)?logo=github>)](https://github.com/MrMudBean/rollup-external/issues) [![English](<https://img.shields.io/badge/English-rgb(125,125,125)?logo=readme>)](.)  [![中文](<https://img.shields.io/badge/中文-rgb(30,255,200)?logo=readme>)](./README.md)

A simple function in rollup to exclude external dependencies when building (mostly used for building npm packages)

## 📦 install

```bash
npm install  --save-dev @vvi/rollup-external
```

## 🔧 use

Set it up in the `rollup.config.js` file:

```js
.... Other references
import { external } from '@vvi/rollup-external';
.... Other code logic

export default {
  ... Other settings,
  external: external({
    // By default, exclude dependencies from package.json
    // Exclude dependencies starting with `node:`, `a-`, `color-pen`, or `@qqi`
    exclude: ["node:", "a-" ,"color-pen", "@qqi/"],
    // Ignore dependencies starting with `node:` that are not declared in package.json
    // If this option is not set, and the project contains `node:`
    ignore: ["node:"],
    // Dependencies that must be included will be packed into the build folder
    // Using paths like `src/` will cause an error: "Dependency not excluded, build closed"
    include: ['@qqi/copy-text','src/utils', 'src/dog']
  }),
  ... Other settings,

}

```

- By default, it reads the dependencies in `package.json` from `dependencies` and `peerDependencies` as the value for `exclude`, so usually you don’t need to configure it.  
- `include` does a full comparison and has much higher priority than `exclude` and `ignore`. If a dependency is listed in `dependencies` but you still want it included in the bundle, you can use `include` (but note the package will be in the 'node_modules' folder, so make sure the `files` field includes it).  
- `ignore` is used to skip dependencies that aren’t listed in `package.json` dependencies but still need to be excluded, like `node:` or `src/` paths. During validation, it checks using `startWith` on the input string.  
- You can also just skip using parameters if you only want to exclude the dependencies listed in `package.json`.

### second parameter

The second parameter can control showing simple logs on the console when used.

The second parameter's acceptable types

- `boolean`: If `true`, a simple log will be printed for each import
- `string`: It will use `id.includes(str)` to determine whether to print that simple log
- `string[]`: It will use `id.includes(str)` for each item in the array to determine
