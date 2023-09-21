const CopyPlugin = require('copy-webpack-plugin')
const path = require('node:path')
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: process.env['NODE_ENV'],
  entry:  {
   'main' : './src/main.ts',
   'bundle': './src/TLDraw-folder/index.tsx'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
   },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/TLDraw-folder/index.html", // to import index.html file inside index.js
    }),
    new CopyPlugin({
      patterns: [
        { from: 'src/icons', to: 'icons' },
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'public/assets', to: 'public/assets' },
        // { from: 'src/TLDraw-folder/static', to:'TLDraw-folder/static'}
      ],
    }),
  ],
  devServer: {
    port: 3030, // you can change the port
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      },
      {
        test: /\.(js|jsx)$/, // .js and .jsx files
        exclude: /node_modules/, // excluding the node_modules folder
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(sa|sc|c)ss$/, // styles files
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/, // to import images and fonts
        loader: "url-loader",
        options: { limit: false },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
}
