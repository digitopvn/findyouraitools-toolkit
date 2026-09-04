import { describe, it, expect } from 'vitest';
import { formatOutput } from '../src/ui/formatters';

describe('CLI JSON Formatting', () => {
  it('formatOutput with isJson=true emits stringified JSON without terminal styling', () => {
    const data = { status: 'ok', keys: [1, 2, 3] };
    const output = formatOutput(data, { isJson: true });
    expect(JSON.parse(output)).toEqual(data);
    expect(output).not.toContain('\u001b'); // No ANSI escape codes
  });

  it('formatOutput with isJson=false formats readable output', () => {
    const data = { message: 'Success' };
    const output = formatOutput(data, { isJson: false });
    expect(typeof output).toBe('string');
  });
});
