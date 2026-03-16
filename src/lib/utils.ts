export interface GreetOptions {
  prefix?: string;
}

export function greet(name: string, options?: GreetOptions): string {
  const prefix = options?.prefix ?? 'Hello';
  return `${prefix}, ${name}`;
}

export function unusedExport(): void {
  // Tree-shaking: this should be dropped in production bundle if never imported
}
