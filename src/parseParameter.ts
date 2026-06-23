/**
 * @module @vvi/rollup-external/parseParameter
 * @file parseParameter.ts
 * @description _
 * @author Mr.MudBean <Mr.MudBean@outlook.com>
 * @copyright 2026 ©️ Mr.MudBean
 * @since 2026-06-20 17:07
 * @version 1.1.2
 * @lastModified 2026-06-23 08:28
 */

import { isStrArr } from './isStrArr';
import { CustomCb } from './types';

/**
 * 解析参数
 * @param options 参数项
 * @param options.exclude 排除项
 * @param options.ignore 忽略项
 * @param options.include 包含项
 * @param options.custom 自定义执行
 */
export function parseParameter(options?: {
  exclude?: string | string[];
  ignore?: string | string[];
  include?: string | string[];
  custom?: CustomCb;
}) {
  return {
    exclude: isStrArr(options?.exclude),
    ignore: isStrArr(options?.ignore),
    include: isStrArr(options?.include),
    custom: options?.custom ?? undefined,
  };
}
