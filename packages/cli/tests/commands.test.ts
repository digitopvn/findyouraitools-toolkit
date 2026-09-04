import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProgram } from '../src/index';

describe('CLI Command Execution', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('creates program with name fyai and registered commands', () => {
    const program = createProgram();
    expect(program.name()).toBe('fyai');

    const commandNames = program.commands.map((c) => c.name());
    expect(commandNames).toContain('login');
    expect(commandNames).toContain('logout');
    expect(commandNames).toContain('whoami');
    expect(commandNames).toContain('balance');
    expect(commandNames).toContain('doctor');
    expect(commandNames).toContain('mcp');
    expect(commandNames).toContain('keys');
    expect(commandNames).toContain('mcps');
    expect(commandNames).toContain('products');
    expect(commandNames).toContain('blog');
    expect(commandNames).toContain('ask');
    expect(commandNames).toContain('admin');
  });
});
