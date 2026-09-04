import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Companion Agent Skills & Manifests Validation', () => {
  const rootDir = path.resolve(__dirname, '..');

  it('SKILL.md exists, has frontmatter and required trigger sections', () => {
    const skillPath = path.join(rootDir, 'claude/skills/findyourai/SKILL.md');
    expect(fs.existsSync(skillPath)).toBe(true);

    const content = fs.readFileSync(skillPath, 'utf-8');
    expect(content).toMatch(/^---\s*\n([\s\S]*?)\n---/);
    expect(content).toContain('name: findyourai');
    expect(content).toContain('fyai_get_my_profile');
    expect(content).toContain('fyai_find_products');
    expect(content).toContain('fyai_create_api_key');
  });

  it('plugin.json exists and contains valid JSON metadata', () => {
    const pluginPath = path.join(rootDir, '.claude-plugin/plugin.json');
    expect(fs.existsSync(pluginPath)).toBe(true);

    const content = fs.readFileSync(pluginPath, 'utf-8');
    const json = JSON.parse(content);
    expect(json.name).toBe('findyourai');
    expect(json.version).toBeDefined();
    expect(json.description).toBeDefined();
  });

  it('gpt/openapi.yaml exists and contains valid OpenAPI 3.1 action spec without OAuth2', () => {
    const yamlPath = path.join(rootDir, 'gpt/openapi.yaml');
    expect(fs.existsSync(yamlPath)).toBe(true);

    const content = fs.readFileSync(yamlPath, 'utf-8');
    expect(content).toContain('openapi: 3.1');
    expect(content).toContain('https://findyourai.tools/api/v1');
    expect(content).toContain('apiKey');
    expect(content).toContain('bearerAuth');
    expect(content).not.toContain('oauth2');
  });
});
