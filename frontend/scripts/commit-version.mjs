import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const frontendDir = resolve(scriptDir, "..");
const repoDir = resolve(frontendDir, "..");
const packagePath = resolve(frontendDir, "package.json");
const packageGitPath = "frontend/package.json";

const runGit = (args, options = {}) =>
  execFileSync("git", args, {
    cwd: repoDir,
    encoding: "utf8",
    stdio: options.stdio || "pipe",
  }).trim();

const hasPackageChanges = () => {
  try {
    runGit(["diff", "--quiet", "--", packageGitPath]);
    runGit(["diff", "--cached", "--quiet", "--", packageGitPath]);
    return false;
  } catch {
    return true;
  }
};

if (!hasPackageChanges()) {
  console.log("No package version changes to commit.");
  process.exit(0);
}

const { version } = JSON.parse(readFileSync(packagePath, "utf8"));
const message = `Bump frontend version to ${version}`;

runGit(["add", packageGitPath], { stdio: "inherit" });
runGit(["commit", "-m", message, "--", packageGitPath], { stdio: "inherit" });
runGit(["push"], { stdio: "inherit" });
