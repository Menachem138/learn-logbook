module.exports = {
  resolver: {
    sourceExts: ["js", "jsx", "json", "ts", "tsx"],
    platforms: ["ios", "android", "native"]
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
