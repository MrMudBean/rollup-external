/**
 * @module @vvi/rollup-external/isIncluded
 * @file isIncluded.ts
 * @description 检查 id 是否命中 include 规则
 * @author Mr.MudBean <Mr.MudBean@outlook.com>
 * @copyright 2026 ©️ Mr.MudBean
 * @since 2026-06-19 20:40
 * @version 1.1.2
 * @lastModified 2026-06-19 20:44
 */

/** 校验 id 是否存在于指定数组 */
export const isIncluded = (
  id: string,
  includeList: string[],
  includeArray: string[],
) =>
  includeList.includes(id) ||
  includeArray.some((prefix: string) => id.startsWith(prefix));

export const isExcludedByRegExp = (id: string, excludedRegExp: RegExp) => {
  excludedRegExp.lastIndex = 0; // 重置正则状态
  return excludedRegExp.test(id);
};
