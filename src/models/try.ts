export type DataChecker<T> = (t: T | undefined | null) => t is T;

export class Try<T> {
  static String<T>(t: T | undefined | null): t is T {
    return typeof t === "string" && t !== "";
  }

  static Number<T>(t: T | undefined | null): t is T {
    return typeof t === "number" && isFinite(t);
  }

  static Boolean<T>(t: T | undefined | null): t is T {
    return typeof t === "boolean";
  }

  constructor(
    private name: string,
    private value: T | undefined | null,
    private checker: DataChecker<T>
  ) {}

  orElse(def: T): T {
    return this.checker(this.value) ? this.value : def;
  }

  throw(): T {
    if (!this.checker(this.value)) {
      throw new Error(`Input data (${this.name}) is invalid`);
    }

    return this.value;
  }
}
