import { external } from '../src/index';

const testList: [string, string | undefined, boolean][] = [
  ['color', 'qqi', false],
  ['color-pen', '', false],
];

const _e = external(
  {
    ignore: ['ignore', 'color'],
    include: ['node'],
  },
  true,
);

testList.forEach(e => _e(...e));
