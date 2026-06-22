/**
 * @module @vvi/rollup-external/copy
 * @file copy.ts
 * @description _
 * @author Mr.MudBean <Mr.MudBean@outlook.com>
 * @copyright 2026 ©️ Mr.MudBean
 * @since 2026-06-19 18:03
 * @version 1.1.2
 * @lastModified 2026-06-19 20:16
 */

import { copyTextToClipboard } from '@vvi/copy-text';
import { isWindows } from '@vvi/node';
import { hexPen } from '@vvi/pen';

/**
 *  复制
 * @param str 待赋复制的文本
 */
export function copy(str: string) {
  str = isWindows ? str.replace(/[\\]/gm, '\\\\') : str;
  return copyTextToClipboard(str) === str ? hexPen('#666')`已复制` : '';
}
