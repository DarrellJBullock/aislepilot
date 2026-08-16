const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("node:path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Monorepo support: watch the workspace root (so changes in packages/* are
// picked up) and resolve node_modules from both the app and the workspace
// root (where npm workspaces hoists @aislepilot/* and shared deps).
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
// The workspace packages are plain TypeScript source (no build step) — treat
// their .ts/.tsx files as first-class sources rather than external packages.
config.resolver.disableHierarchicalLookup = false;

module.exports = withNativeWind(config, { input: "./src/global.css" });
