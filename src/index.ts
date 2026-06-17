import { copyTextToClipboard } from '@vvi/copy-text';
import {
  getPackageJsonSync,
  _p,
  isWindows,
  pathJoin,
  fileExist,
} from '@vvi/node';
import {
  isNull,
  isString,
  isBusinessEmptyString,
  isTrue,
  isFalse,
  isEmptyArray,
  isArray,
  isBoolean,
} from '@vvi/is';
import {
  bgBlackPen,
  bgRedPen,
  brightYellowPen,
  cyanPen,
  hexPen,
  magentaPen,
  reversedPen,
} from '@vvi/pen';

/**  一个展示 🖊️  */
const pen = bgRedPen.blink.bold.yellow;

/**
 * ## 依赖配置
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
 */
export function external(
  options?: {
    /**  排除且在依赖项中的包（在构建发布后，不会因为依赖项缺失而导致包版本失效）  */
    exclude?: string[] | string;
    /**  在排除的包却不需要在 dependencies  中的包，如： node:stream 等  */
    ignore?: string[] | string;
    /**
     * 包含的包（打包入结果的包）。优先级最高（譬如：src/ 这种需要 rollup 处理的）。
     *
     * 但是该项不像 ignore 和 exclude 是 `startsWith` 匹配，该项是完整权等匹配  */
    include?: string[] | string;
  },
  /** 打印消息 */
  logInfo: boolean | string | string[] = false,
) {
  /** 是否打印消息 */
  let logGlobal = false;
  if (isString(logInfo)) logInfo = [logInfo];
  if (logInfo === true || (isArray(logInfo) && logInfo.length > 0)) {
    logGlobal = true;
  }
  const { exclude, ignore, include: _include } = parseParameter(options);
  const cwd = process.cwd();
  if (logGlobal) {
    console.log('当前的工作路径：', reversedPen(cwd));
  }

  /**
   * ## 当前的状态值
   *
   * 该状态是值依赖是否将被排除
   *
   * - false 当前依赖被包含 （返回值为 `false` ）
   * - true 当前依赖被（返回值为  `true` ）
   */
  const currentState: Record<string, boolean> = {};
  /**
   * # 装进到返回值中
   */
  const putPocket = (
    { id, message, isLog }: { id: string; message: string; isLog: boolean },
    res: boolean,
  ) => {
    if (isLog) {
      console.log(message);
    }
    currentState[id] = res;
    beforeEnd(isLog);
    return res;
  };

  /** 当前设定 */
  const packageContent = getPackageJsonSync();
  if (isNull(packageContent) || !packageContent?.content?.name)
    throw new RangeError('package.json 文件不存在');

  const packInfo = packageContent.content;
  /**  已配置的依赖  */
  const dependencies = Object.keys({
    ...(packInfo.dependencies || {}),
    ...(packInfo.peerDependencies || {}),
  });

  /** 包含于的依赖包的数组 */
  const includeArray = _include.map((currentValue: string) => {
    return currentValue.concat('/');
  });

  const ignorePkg = isEmptyArray(ignore)
    ? dependencies
    : [...ignore, ...dependencies];
  /** 配置需要不打包进生产包的包名配置 （这就保证了 excludedRegExp 非空 ） */
  const excludedPkg = isEmptyArray(exclude) ? ['node:'] : exclude;
  /** 排除的依赖项的正则，仅检测是否包含为头 */
  const excludedRegExp = new RegExp(
    '^'.concat([...ignorePkg, ...excludedPkg].join('|^')),
  );
  if (logGlobal) {
    console.log('排除的包', excludedPkg);
    console.log('执行校验的数组', excludedRegExp);
    console.log('执行包含包', _include);
    console.log('执行包含的包子内容', includeArray);
  }

  const beforeEnd = (isLog: boolean) =>
    isLog && (console.log(), console.groupEnd());
  /**
   * 实际执行的文件
   */
  return (
    id: string,
    parentId: string | undefined,
    isHandle: boolean,
  ): boolean => {
    /** 是否可打印 */
    const isLog =
      logInfo === true ||
      (isArray(logInfo) && logInfo.some(e => id?.includes(e)));

    if (isLog) {
      console.log();
      console.groupCollapsed('本次检测的 id：', magentaPen(id));
      console.log(
        '当前提供的 id 是否为文件',
        fileExist(pathJoin(cwd, id)) ? '✅' : '❌',
      );
      console.log(
        `该 id（${cyanPen(id)}）是否为文件：${fileExist(pathJoin(cwd, id)) ? '✅' : '❌'}`,
      );
      parentId &&
        console.log(
          `该 id（${cyanPen(id)}）调用父级：${brightYellowPen(parentId)}`,
        );
      console.log(`该 id（${cyanPen(id)}）是否已处理：${bgBlackPen(isHandle)}`);
    }

    /** 有父级设定的值 */
    if (parentId && isBoolean(currentState[parentId])) {
      const res = currentState[parentId];
      return putPocket(
        {
          id,
          message: `跟随父级 「${parentId}」 的设定值 {${res}}`,
          isLog,
        },
        res,
      );
    }

    if (id.startsWith(cwd) && fileExist(id)) {
      return putPocket({ id, message: '是存在的绝对路径的文件', isLog }, false);
    } else if (fileExist(pathJoin(cwd, id))) {
      return putPocket({ id, message: '是存在的相对路径的文件', isLog }, false);
    }

    if (_include.includes(id) || includeArray.some(e => id.startsWith(e))) {
      // 包存在于 included 中，直接交给 rollup 处理
      return putPocket(
        {
          id,
          message: `${cyanPen(id)} 被显式声明打（进）包`,
          isLog,
        },
        false,
      );
    }
    // 重制识别位置
    excludedRegExp.lastIndex = 0;
    /**  是否在设定排除之外（包含要忽略的包）  */
    const result = excludedRegExp.test(id);
    /// 保证排除的包纯在于
    if (isTrue(result)) {
      if (
        // 检测到了包名存在于配置中
        isFalse(dependencies.includes(id)) &&
        ignorePkg.every(e => !id.startsWith(e))
      ) {
        const msg = `${pen(id)} ${copy(id)} 依赖被排除打包却未在 package.json 中配置`;
        if (isLog) {
          console.error(msg);
        }
        _p(msg);
        process.exit(1);
      }
    }
    // 包不存在于配置中，但是却是非本地包
    else if (/^[^./]/g.test(id)) {
      const msg = `${pen(id)}  ${copy(id)}  依赖未被排除，打包关闭`;
      if (isLog) {
        console.error(msg);
      }
      _p(msg);
      process.exit(1);
    }
    return putPocket({ id, message: '', isLog }, result);
  };
}

/**
 *  复制
 * @param str 待赋复制的文本
 */
function copy(str: string) {
  str = isWindows ? str.replace(/[\\]/gm, '\\\\') : str;
  return copyTextToClipboard(str) === str ? hexPen('#666')`已复制` : '';
}

/**
 * 校验是否是字符串数组并返回格式化后标准的数组
 * @param arr 待转化的数组
 */
function isStrArr(arr: undefined | string | string[]): string[] {
  if (!isArray(arr)) return [];
  if (isString(arr)) return [arr];
  return arr.filter(e => isString(e) && !isBusinessEmptyString(e));
}

/**
 * 解析参数
 * @param options 参数项
 * @param options.exclude 排除项
 * @param options.ignore 忽略项
 * @param options.include 包含项
 */
function parseParameter(options?: {
  exclude?: string | string[];
  ignore?: string | string[];
  include?: string | string[];
}) {
  return {
    exclude: isStrArr(options?.exclude),
    ignore: isStrArr(options?.ignore),
    include: isStrArr(options?.include),
  };
}
