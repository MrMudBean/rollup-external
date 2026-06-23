/**
 * @module @vvi/rollup-external/main
 * @file external.ts
 * @description _
 * @author Mr.MudBean <Mr.MudBean@outlook.com>
 * @copyright 2026 ©️ Mr.MudBean
 * @since 2026-06-19 20:24
 * @version 1.1.2
 * @lastModified 2026-06-23 15:30
 */

import {
  isArray,
  isBoolean,
  isEmptyArray,
  isNull,
  isString,
  isTrue,
  isType,
} from '@vvi/is';
import { _p, fileExist, getPackageJsonSync, pathJoin } from '@vvi/node';
import {
  bgBlackPen,
  brightYellowPen,
  cyanPen,
  magentaPen,
  reversedPen,
} from '@vvi/pen';
import { copy } from './copy';
import { parseParameter } from './parseParameter';
import { pen } from './pen';
import type { CustomCb, ExternalOption, LogInfo } from './types';

const testStartRegExp = /^(\/)|^(\w:[\\|/])|^\./gim;

/**
 *
 */
export class External {
  /** 是否允许执行打印 */
  canLog: boolean = false;
  /** 打印消息 */
  logInfo: LogInfo = false;
  /** 工作目录 */
  cwd: string = process.cwd();
  /** 排除的正则表达式 */
  excludedRegExp: RegExp;
  /** 依赖中的包 */
  dependencies: string[];
  /** 忽略的包 （本质也是排除的包，但是为了显示 `node:xxx` 的特殊而添加的该项 ） */
  ignorePkg: string[];
  /** 包含的包 */
  include: string[];
  /** 包含的包且含特定后缀，用于降低构建 */
  includeArray: string[];
  /** 自定义执行方案 */
  custom?: CustomCb;
  /**
   *
   */
  constructor(
    options?: ExternalOption | LogInfo,
    /** 打印消息 */
    logInfo: LogInfo = false,
  ) {
    if (
      isType<LogInfo>(options, e => isString(e) || isArray(e) || isBoolean(e))
    ) {
      logInfo = options;
      options = undefined;
    }
    if (isString(logInfo)) {
      logInfo = [logInfo];
    }
    this.canLog = isTrue(logInfo) || (isArray(logInfo) && logInfo.length > 0);
    this.logInfo = logInfo;
    const { exclude, ignore, include, custom } = parseParameter(options);
    if (this.canLog) {
      console.log('当前的工作路径：', reversedPen(this.cwd));
    }
    const packageContent = getPackageJsonSync();
    if (isNull(packageContent) || !packageContent?.content?.name) {
      throw new RangeError('未找到 package.json 文件');
    }
    const packInfo = packageContent.content;
    /** 已配置的显示依赖，将直接被 external  */
    const dependencies = Object.keys(
      Object.assign({}, packInfo.dependencies, packInfo.peerDependencies),
    );
    /** 包含于依赖包的数组 */
    const includeArray = include.map((currentValue: string) =>
      currentValue.concat('/'),
    );
    const ignorePkg = isEmptyArray(ignore)
      ? dependencies
      : ([] as string[]).concat(ignore, dependencies);
    /** 配置需要排除的依赖配资 */
    const excludedPkg = isEmptyArray(exclude) ? ['node'] : exclude;
    /** 排除的依赖项正则 */
    const excludedRegExp = new RegExp(
      '^'.concat(([] as string[]).concat(ignorePkg, excludedPkg).join('|^')),
    );
    if (this.canLog) {
      console.log('排除的包：', excludedPkg);
      console.log('执行校验的数组：', excludedRegExp);
      console.log('执行包含包：', include);
      console.log('执行包含的包子内容：', includeArray);
    }
    this.excludedRegExp = excludedRegExp;
    this.dependencies = dependencies;
    this.ignorePkg = ignorePkg;
    this.include = include;
    this.includeArray = includeArray;
    this.custom = custom;
    // 锁定 this
    this.external = this.external.bind(this);
  }

  /** 排除方法 */
  external = (
    id: string,
    parentId: string | undefined,
    isResolved: boolean,
  ): boolean => {
    const isLog =
      isTrue(this.canLog) ||
      (isArray(this.logInfo) && this.logInfo.some(e => id?.includes(e)));

    if (this.custom && typeof this.custom === 'function') {
      const result = this.custom(id, parentId, isResolved);
      if (isBoolean(result)) {
        return result;
      }
    }
    testStartRegExp.lastIndex = 0;
    // 所有以 `.`、`/`、`X:/` 开头的都视为内部使用的方法
    if (testStartRegExp.test(id)) {
      return this.putPocket(
        { id, message: `当前 id 「${id}」为相对路径`, isLog },
        false,
      );
    }
    /** 并不影响实际效果（现在这种情况已经被包含于上面的内连） */
    if (isResolved) {
      return this.putPocket(
        {
          id,
          message: '解析的路径（重复项）',
          isLog,
        },
        false,
      );
    }

    if (isLog) {
      console.log();
      console.groupCollapsed('本次检测的 id：', magentaPen(id));
      console.log(
        `该 id（${cyanPen(id)}）是否为文件：${fileExist(pathJoin(this.cwd, id)) ? '✅' : '❌'}`,
      );
      parentId &&
        console.log(
          `该 id（${cyanPen(id)}）调用父级：${brightYellowPen(parentId)}`,
        );
      console.log(
        `该 id（${cyanPen(id)}）是否已处理：${bgBlackPen(isResolved)}`,
      );
    }

    if (
      this.include.includes(id) ||
      this.includeArray.some(e => id.startsWith(e))
    ) {
      return this.putPocket(
        {
          id,
          message: `${cyanPen(id)} 被显示打包`,
          isLog,
        },
        false,
      );
    }

    // 如果调用者是三方包，说明可能想内嵌
    // 否者不会进入到包
    // 当然，有可能调用者希望被内嵌，而调用者引用的三方包希望被排除
    // 但，这里返回 `false`  并不直接影响结果（不影响在其他位置进行排除）
    if (
      parentId &&
      id?.includes('node_modules') &&
      parentId?.includes('node_modules')
    ) {
      return this.putPocket(
        { id, isLog, message: `调用父级为必须依赖的包「${parentId}」` },
        false,
      );
    }

    this.excludedRegExp.lastIndex = 0; // 重置识别位置
    /** 是否在设定排除之外（包含忽略的包） */
    const result = this.excludedRegExp.test(id);

    if (isTrue(result)) {
      /** 被显式排除的包必须纯在于依赖，否者禁止被排除 */
      if (
        this.ignorePkg.every(e => !id.startsWith(e)) &&
        this.dependencies.every(e => id !== e && !e.concat('/').startsWith(id))
      ) {
        const msg = `${pen(id)} ${copy(id)} 依赖包被排除打包却未在 package.json 中配置`;
        if (isLog) {
          console.error(msg);
        }
        _p(msg);
        process.exit(1);
      }
    } else {
      const msg = `${pen(id)} ${copy(id)} 依赖未被排除，打包关闭`;
      if (isLog) {
        console.error(msg);
      }
      _p(msg);
      process.exit(1);
    }

    return this.putPocket({ id, message: '', isLog }, result);
  };

  /** 返回值 */
  putPocket(
    {
      id: _id,
      message,
      isLog,
    }: {
      id: string;
      message: string;
      isLog: boolean;
    },
    res: boolean,
  ): boolean {
    if (isLog) {
      console.log(message);
      console.log();
      console.groupEnd();
    }
    return res;
  }
}
