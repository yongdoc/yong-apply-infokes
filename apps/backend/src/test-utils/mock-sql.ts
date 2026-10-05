export interface SqlCall {
  kind: 'template' | 'fragment';
  args: unknown[];
}

export interface MockSql {
  (strings: TemplateStringsArray, ...values: unknown[]): Promise<unknown[]>;
  (fragment: Record<string, unknown>): unknown;
  calls: SqlCall[];
  pushResult(result: unknown): void;
  clear(): void;
}

export function createMockSql(): MockSql {
  const calls: SqlCall[] = [];
  const results: unknown[] = [];

  function sql(
    first: TemplateStringsArray | Record<string, unknown>,
    ...rest: unknown[]
  ): Promise<unknown[]> | unknown {
    if (Array.isArray(first)) {
      calls.push({ kind: 'template', args: [first, ...rest] });
      const result = results.length > 0 ? results.shift() : [];
      return Promise.resolve(result as unknown[]);
    }

    calls.push({ kind: 'fragment', args: [first] });
    return first;
  }

  const mockSql = sql as MockSql;
  mockSql.calls = calls;
  mockSql.pushResult = (result: unknown) => {
    results.push(result);
  };
  mockSql.clear = () => {
    calls.length = 0;
    results.length = 0;
  };

  return mockSql;
}
