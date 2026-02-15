export class CodeFilesCollection extends Set<string> {
  constructor(codeFiles: string[] = []) {
    super(codeFiles);
  }

  toArray() {
    return Array.from(this);
  }

  isCodeFileImport(file: string) {
    return this.has(`${file}.ts`) || this.has(`${file}.js`);
  }
}
