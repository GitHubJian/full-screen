const root = process.cwd()
const path = require('path')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const pathConfig = {
  root: root,
  static: path.resolve(root, 'static'),
  templatePath: path.resolve(__dirname, 'template.ejs')
}

module.exports = {
  target: 'web',
  mode: 'development',
  entry: {
    fullscreen: [
      'webpack-dev-server/client?http://local.sogou.com:8424/',
      path.resolve(root, 'lib/index.js')
    ],
    h5player: [
      'webpack-dev-server/client?http://local.sogou.com:8424/',
      path.resolve(root, 'lib/h5player.js')
    ]
  },
  output: {
    filename: 'js/[name].js',
    path: pathConfig.static,
    publicPath: '/'
  },
  resolve: {
    alias: {},
    extensions: ['.js', '.jsx', '.json']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env']],
              plugins: [['@babel/plugin-proposal-optional-chaining']]
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)(\?.*)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'images/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.VUE_ENV': '"client"',
      'process.env.buildTime': JSON.stringify(Date.now())
    }),
    new webpack.EnvironmentPlugin({ NODE_ENV: 'development' }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.optimize.ModuleConcatenationPlugin(),

    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: pathConfig.templatePath,
      chunks: ['fullscreen', 'h5player'],
      title: 'Full Screen Test',
      inject: 'head'
    })
  ],
  devServer: {
    host: 'local.sogou.com',
    contentBase: pathConfig.root,
    compress: false,
    port: 8424,
    hot: true,
    inline: true
  }
}
