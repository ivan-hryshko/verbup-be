import path from "path";

export class TsNavigator {
  static fromRoot(pathTarget: string) {
    return path.resolve(process.cwd(), pathTarget)
  }
}