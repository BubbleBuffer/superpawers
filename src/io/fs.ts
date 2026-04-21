import * as fs from "fs";
import * as path from "path";

/**
 * Create a directory recursive. No redundant existence check —
 * mkdirSync with recursive:true handles that.
 */
export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Copy a directory recursively using fs.cpSync.
 */
export function copyDir(source: string, target: string): void {
  fs.cpSync(source, target, { recursive: true });
}

/**
 * Remove a directory recursively. Force:true means no error if missing.
 */
export function removeDir(dirPath: string): void {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

/**
 * Remove files in a directory that match a predicate.
 * Only removes files, not subdirectories.
 */
export function removeMatchingFiles(
  dir: string,
  predicate: (filename: string) => boolean
): void {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    if (predicate(entry)) {
      fs.rmSync(path.join(dir, entry), { force: true });
    }
  }
}