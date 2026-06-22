/**
 * @module @vvi/rollup-external/isStrArr
 * @file isStrArr.ts
 * @description _
 * @author Mr.MudBean <Mr.MudBean@outlook.com>
 * @copyright 2026 ©️ Mr.MudBean
 * @since 2026-06-19 20:17
 * @version 1.1.2
 * @lastModified 2026-06-19 20:17
 */

import { isArray, isBusinessEmptyString, isString } from '@vvi/is';

/**
 * 校验是否是字符串数组并返回格式化后标准的数组
 * @param arr 待转化的数组
 */
export function isStrArr(arr: undefined | string | string[]): string[] {
  if (!isArray(arr)) return [];
  if (isString(arr)) return [arr];
  return arr.filter(e => isString(e) && !isBusinessEmptyString(e));
}
