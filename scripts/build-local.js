import {
  _p,
  isWindows,
  pathJoin,
  readFileToJsonSync,
  runOtherCode,
} from '@vvi/node';
import { copyTextToClipboard } from '@vvi/copy-text';
import { brightBlackPen, cyanPen, randomPen } from 'color-pen';

/**  本地打包并将本地地址复制到剪切板 */

await runOtherCode('pnpm exec jja clear');

try {
  const deleteOldFile = await runOtherCode({
    code: 'pnpm exec jja rm dist *.tgz && pnpm run build',
    printLog: true,
  });
  if (!deleteOldFile.success) throw new Error();
} catch (error) {
  console.error(error);
  throw error;
}

_p(cyanPen('执行打包完毕'));
await runOtherCode({ code: 'cd dist && pnpm pack', printLog: true });
const info = readFileToJsonSync('./dist/package.json');
const pack = info.name + '-' + info.version + '.tgz';
const pwd = await runOtherCode({
  code: isWindows ? 'echo %cd%' : 'pwd',
  printLog: false,
});

const noLineBreak = str => str.replace(/\r?\n/g, '');
if (pwd.success) {
  const result = pathJoin(noLineBreak(pwd.data), 'dist', noLineBreak(pack));
  _p(randomPen('pnpm add '), false);
  _p(randomPen(result));
  copyTextToClipboard(`pnpm add ${result}`);
  console.log(brightBlackPen('已复制到剪切板'));
}
