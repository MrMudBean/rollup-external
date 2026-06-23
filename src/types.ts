/**
 * @module @vvi/rollup-external/types
 * @file types.ts
 * @description _
 * @author Mr.MudBean <Mr.MudBean@outlook.com>
 * @copyright 2026 ©️ Mr.MudBean
 * @since 2026-06-20 17:31
 * @version 1.1.2
 * @lastModified 2026-06-23 08:26
 */

/** 排除设定选项 */
export type ExternalOption = {
  /**  排除且在依赖项中的包（在构建发布后，不会因为依赖项缺失而导致包版本失效）  */
  exclude?: string[] | string;
  /**  在排除的包却不需要在 dependencies  中的包，如： node:stream 等  */
  ignore?: string[] | string;
  /**
   * 包含的包（打包入结果的包）。优先级最高（譬如：src/ 这种需要 rollup 处理的）。
   *
   * 但是该项不像 ignore 和 exclude 是 `startsWith` 匹配，该项是完整权等匹配  */
  include?: string[] | string;
  /**
   * ## 自定义处理方法
   * 如果该方法返回的是布尔值，则以该返回值为判定是否排除依赖的依据，否则将执行默认判定
   * @param id 当前判定的被引入路径/链接
   * @param parentId 引入 id 的文件路径
   * @param isResolved 当前是否已被插件处理解析为绝对路径
   */
  custom?: CustomCb;
};

export type CustomCb = typeof customCb;

/**
 * @param id 当前判定的被引入路径/链接
 * @param parentId 引入 id 的文件路径
 * @param isResolved 当前是否已被插件处理解析为绝对路径
 */
function customCb /**  */(
  id: string | undefined,
  parentId?: string,
  isResolved?: boolean,
): boolean | any {}

/** 打印消息 */
export type LogInfo = boolean | string | string[];
