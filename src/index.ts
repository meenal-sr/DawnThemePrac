import { greet } from './lib/utils';

export function run(): string {
  return greet('moduleUpdate');
}

export { greet } from './lib/utils';
export type { GreetOptions } from './lib/utils';
