import { Try } from "../try";

export class Config {
  getTryString(name: string): Try<string> {
    return new Try(name, process.env[name], Try.String);
  }

  getTryNumber(name: string): Try<number> {
    return new Try(name, parseInt(process.env[name] ?? ""), Try.Number);
  }

  getTryBoolean(name: string): Try<boolean> {
    const v = process.env[name];
    return new Try(
      name,
      v === "true" ? true : v === "false" ? false : undefined,
      Try.Boolean
    );
  }

  getString(name: string, def = ""): string {
    return this.getTryString(name).orElse(def);
  }

  getNumber(name: string, def = 0): number {
    return this.getTryNumber(name).orElse(def);
  }

  getBoolean(name: string, def = false): boolean {
    return this.getTryBoolean(name).orElse(def);
  }
}
