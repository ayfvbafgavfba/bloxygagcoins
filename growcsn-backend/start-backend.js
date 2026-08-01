const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const backendDir = path.join(repoRoot, "Backend");
const backendPackageJson = path.join(backendDir, "package.json");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

if (!fs.existsSync(backendPackageJson)) {
  console.error(`Backend package.json not found at ${backendPackageJson}`);
  process.exit(1);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

const needsBackendInstall = !fs.existsSync(path.join(backendDir, "node_modules"));
if (needsBackendInstall) {
  console.log("Installing backend dependencies...");
  run(npmCommand, ["ci"], backendDir);
}

const frontendDistExists = fs.existsSync(path.join(backendDir, "public", "index.html"));
if (!frontendDistExists) {
  console.log("Building frontend bundle for backend...");
  run(npmCommand, ["run", "build:frontend"], backendDir);
}

console.log("Starting backend server...");
run(process.execPath, [path.join(backendDir, "bin", "www")], backendDir);
