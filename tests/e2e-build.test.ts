import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Monorepo Packaging & CI/CD Integrity', () => {
  const rootDir = path.resolve(__dirname, '..');

  it('Core SDK build artifacts exist', () => {
    expect(fs.existsSync(path.join(rootDir, 'packages/core/dist/index.js'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'packages/core/dist/index.cjs'))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, 'packages/core/dist/index.d.ts'))).toBe(true);
  });

  it('CLI executable artifact exists with shebang', () => {
    const binPath = path.join(rootDir, 'packages/cli/dist/bin/fyai.js');
    expect(fs.existsSync(binPath)).toBe(true);

    const binContent = fs.readFileSync(binPath, 'utf-8');
    expect(binContent.startsWith('#!/usr/bin/env node')).toBe(true);
  });

  it('MCP Server executable artifact exists with shebang', () => {
    const binPath = path.join(rootDir, 'packages/mcp/dist/bin/mcp-server.js');
    expect(fs.existsSync(binPath)).toBe(true);

    const binContent = fs.readFileSync(binPath, 'utf-8');
    expect(binContent.startsWith('#!/usr/bin/env node')).toBe(true);
  });

  it('GitHub CI and Release workflows exist and are non-empty', () => {
    const ciPath = path.join(rootDir, '.github/workflows/ci.yml');
    const releasePath = path.join(rootDir, '.github/workflows/release.yml');

    expect(fs.existsSync(ciPath)).toBe(true);
    expect(fs.existsSync(releasePath)).toBe(true);
    const releaseContent = fs.readFileSync(releasePath, 'utf-8');
    expect(releaseContent).toContain('id-token: write');
    expect(releaseContent).toContain('--provenance');
    expect(releaseContent).not.toContain('secrets.NPM_TOKEN');

    const ciContent = fs.readFileSync(ciPath, 'utf-8');
    expect(ciContent).toContain('pnpm install');
    expect(ciContent).toContain('pnpm test');
    expect(ciContent).toContain('node-version: [22.x, 24.x]');
  });
});
