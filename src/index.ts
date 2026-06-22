import type { ExternalOption, LogInfo } from './types';
import { External } from './external';

/**
 * # 依赖配置
 *
 * - `include` 包含的包（想打包入结果的包）。优先级最高（譬如：src/ 这种需要 rollup 处理的）
 * - `ignore`  在排除的包却不需要在 dependencies 中的包，如: `node:stream` 等
 * - `exclude`  排除且在依赖项中的包（在构建发布后，不会因为依赖项缺失而导致包版本失效）
 *
 * 注： `exclude` 是使用完全（<span style="color:#ff0;">Object.is()</span>）匹配模式
 *
 * @param options 配置项参数
 * @param options.exclude 排除项，该项将默认包含 "package.json" 文件中的 `dependencies` 及 `peerDependencies` 的依赖包（包在忽略时使用 `Object.is` 比较）
 * @param options.ignore 忽略项，该项与 `exclude` 类似，但是
 * @param options.include
 * @param logInfo 第二参数，可传入 `boolean`、`string`、`string[]` 类型，用户查看简单日志
 *        - 当传入为 `true` 时，所有的引入项都将打印日志
 *        - 当传入为单个字符串时，会打印包含该字符串的引入的日志（模糊匹配）
 *        - 当传入为字符串数组时，会分别打印包含对应字符串的引入的日志（模糊匹配）
 *
 * 该方法默认返回一个
 */
export function external(
  options?: ExternalOption | LogInfo,
  /** 打印消息 */
  logInfo: LogInfo = false,
) {
  return new External(options, logInfo).external;
}
