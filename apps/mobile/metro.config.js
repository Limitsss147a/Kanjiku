const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add .db as an asset extension for SQLite database
config.resolver.assetExts.push('db');

// Prevent Metro from parsing .db files as JavaScript
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: false,
  },
});

// Exclude database from file watching to prevent parsing attempts
config.watchFolders = config.watchFolders || [];
config.resolver.blockList = config.resolver.blockList || [];
config.resolver.blockList.push(/assets\/database\/.*\.db$/);

module.exports = config;