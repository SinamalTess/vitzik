const path = require("path");

module.exports = {
  entry: ["./src/index.ts"],
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "babel-loader",
        },
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    library: "vitzikUi",
    libraryTarget: "umd",
    filename: "index.js",
    path: path.resolve(__dirname, "lib"),
  },
  plugins: [],
  externals: {
    react: "react",
    reactDOM: "react-dom",
  },
};
