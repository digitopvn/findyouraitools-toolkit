import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

export interface FyaiConfig {
  apiKey?: string;
  baseUrl?: string;
}

export class ConfigStore {
  private readonly configDir: string;
  private readonly configFile: string;

  constructor(customDir?: string) {
    this.configDir = customDir || process.env.FYAI_CONFIG_DIR || path.join(os.homedir(), '.fyai');
    this.configFile = path.join(this.configDir, 'config.json');
  }

  read(): FyaiConfig {
    try {
      if (!fs.existsSync(this.configFile)) {
        return {};
      }
      const raw = fs.readFileSync(this.configFile, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  write(config: FyaiConfig): void {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true, mode: 0o700 });
    }
    fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2), {
      mode: 0o600,
    });
  }

  clear(): void {
    try {
      if (fs.existsSync(this.configFile)) {
        fs.unlinkSync(this.configFile);
      }
    } catch {
      // Ignore
    }
  }
}
