module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-typescript',
      ['@babel/preset-react', { runtime: 'automatic' }]
    ],
    plugins: [
      ['@babel/plugin-transform-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        },
      ],
    ]
  };
};
