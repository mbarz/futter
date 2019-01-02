const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

const extractSass = new ExtractTextPlugin({
  filename: "style.css",
  disable: process.env.NODE_ENV === "development"
});

module.exports = {
  entry: {
    app: "./src/index.ts"
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    extractSass,
    new HtmlWebpackPlugin({
      title: "futter@siemens",
      favicon: "favicon.ico",
      template: "src/index.html"
    })
  ],
  optimization: {
    splitChunks: {
      chunks: "all"
    }
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: { loader: "ts-loader" }
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({
          use: [{ loader: "css-loader" }, { loader: "sass-loader" }],
          fallback: "style-loader"
        })
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: "file-loader",
            options: { name: "../[path][name].[ext]" }
          }
        ]
      },
      {
        test: /\.htaccess$/,
        use: [
          {
            loader: "file-loader",
            options: { name: "[name]" }
          }
        ]
      },
      {
        type: "javascript/auto",
        test: /multiLangPlan\.json$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]"
            }
          }
        ]
      }
    ]
  }
};
