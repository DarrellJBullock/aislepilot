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
// npm installed separate nested copies of several singleton-sensitive
// packages under nativewind/node_modules (react, react-native,
// react-native-reanimated, react-native-css-interop) despite matching
// versions with the copies hoisted to apps/mobile/. Files inside
// nativewind's own package resolve to its nested copies while app code
// resolves to the hoisted ones, so nativewind's runtime (hooks, style
// registration, worklet/native-module registration) ends up talking to a
// different module instance than the app — silently breaking className
// styling and risking reanimated's "not initialized" native-mismatch class
// of bugs. extraNodeModules only kicks in when normal resolution *fails*,
// and every copy here resolves fine independently, so force-redirect via
// resolveRequest instead.
const SINGLETON_PACKAGES = ["react", "react-native", "react-native-reanimated", "react-native-css-interop"];
const singletonPaths = Object.fromEntries(
  SINGLETON_PACKAGES.map((name) => [name, path.resolve(projectRoot, "node_modules", name)]),
);
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  for (const name of SINGLETON_PACKAGES) {
    if (moduleName === name || moduleName.startsWith(`${name}/`)) {
      const rest = moduleName.slice(name.length);
      return context.resolveRequest(context, singletonPaths[name] + rest, platform);
    }
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./src/global.css" });
