import Table from 'cli-table3';

export interface FormatOptions {
  isJson?: boolean;
}

export function formatOutput(data: unknown, options: FormatOptions = {}): string {
  if (options.isJson) {
    return JSON.stringify(data, null, 2);
  }

  if (typeof data === 'string') {
    return data;
  }

  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
    const keys = Object.keys(data[0]);
    const table = new Table({
      head: keys.map((k) => k.toUpperCase()),
      style: { head: ['cyan'] },
    });

    for (const item of data) {
      table.push(keys.map((k) => String(item[k] ?? '')));
    }

    return table.toString();
  }

  return JSON.stringify(data, null, 2);
}
