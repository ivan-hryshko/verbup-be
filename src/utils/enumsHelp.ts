export function enumValues<T extends object>(enumObj: T): string[] {
  return Object.values(enumObj);
}
