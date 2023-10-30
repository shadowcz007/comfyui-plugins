import { Configuration } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CopyPlugin from 'copy-webpack-plugin'
import path from 'path'

const isDev = !!(process.env?.NODE_ENV !== "production");
console.log('isDev',path.resolve(__dirname, "dist"))
const common: Configuration = {
  mode: isDev ? "development" : "production",//TODO 待修复的bug：production打不出electron-main出来，dev可以。
  externals: ["fsevents"],
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".json"]
  },
  output: {
    publicPath: "./",
    assetModuleFilename: "assets/[name][ext]",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(ico|png|svg|eot|ttf|woff?2?)$/,
        type: "asset/resource",
      },
      {
        test: /\.node$/,
        loader: "native-ext-loader", //搞定.node文件的打包
        options: {
          rewritePath: path.resolve(__dirname, "dist")
        }
      },
    ],
  },
  watch: isDev,
  devtool: isDev ? "source-map" : undefined,
};

const main: Configuration = {
  ...common,
  target: "electron-main",
  entry: {
    main: "./src/main.ts",
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "build/dev-app-update.yml", to: "dev-app-update.yml" },
      ],
    }),
  ],
  mode: "development",//TODO 待修复的bug：production打不出electron-main出来，dev可以。
  watch: isDev,
  devtool: isDev ? "source-map" : undefined,
};

const preload: Configuration = {
  ...common,
  target: "electron-preload",
  entry: {
    preload: "./src/preload.ts",
  },
  plugins: [
    new MiniCssExtractPlugin()
  ]
};

const renderer: Configuration = {
  ...common,
  target: "electron-renderer",
  entry: {
    home: "./src/pages/home/index.tsx"
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      inject: "body",
      template: "./src/pages/home/index.html",
      filename: "home.html",
      chunks: ["home"],
    }),
  ],
};

export default [main, preload, renderer];
