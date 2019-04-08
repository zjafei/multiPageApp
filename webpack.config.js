const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // css分离打包
const UglifyJsPlugin = require('uglifyjs-webpack-plugin'); // js压缩
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // css压缩
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 生成html文件
// const getEntry = require('./config/getEntry');
// const entry = getEntry('./src/pages');

function createHtml(pagesPath) {
  const htmlArr = [];
  getPath(pagesPath).forEach(item => {
    htmlArr.push(
      new HtmlWebpackPlugin({
        chunks: ['vender.chunk', 'components.chunk', 'styles', item], // 引入的js
        template: `./src/pages/${item}/index.html`,
        filename: `${item}.html`, // html位置
        // minify:{//压缩html
        // 	collapseWhitespace: true,
        // 	preserveLineBreaks: true
        // },
      })
    );
  });
  return htmlArr;
}

function getPath(paths) {
  const arr = [];
  if (fs.existsSync(paths)) {
    const readdirSync = fs.readdirSync(paths);
    readdirSync.forEach(item => {
      const currentPath = `${paths}/${item}`;
      const isDirector = fs.statSync(currentPath).isDirectory();
      if (isDirector) {
        arr.push(item);
      }
    });
    return arr;
  }
}

function createEntry(pageName) {
  return {
    [pageName]: ['babel-polyfill', path.join(__dirname, 'src/pages', pageName, 'index.js')],
  };
}

function getEntry(pageName) {
  let entryList = {};
  if (pageName) {
    entryList = createEntry(pageName);
  } else {
    const pagesPath = path.join(__dirname, 'src/pages');
    if (fs.existsSync(pagesPath)) {
      fs.readdirSync(pagesPath).forEach(page => {
        const entry = createEntry(page);
        entryList = { ...entryList, ...entry };
      });
    }
  }
  return entryList;
}

const htmlArr = createHtml('./src/pages');

// //主配置
module.exports = (env, argv) => {
  return {
    entry: getEntry(),
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'js/[name].min.js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader?cacheDirectory=true',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                { plugins: ['@babel/plugin-proposal-class-properties'] },
              ],
              plugins: [
                '@babel/plugin-transform-runtime',
                [
                  'import',
                  {
                    libraryName: 'antd',
                    style: 'css',
                  },
                ],
              ],
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
        {
          test: /\.less$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                // modules: true,
                // localIdentName: '[hash:base64:5]',
                sourceMap: true,
              },
            },
            { loader: 'less-loader', options: { sourceMap: true } },
          ],
        },
        {
          test: /\.(sa|sc)ss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                // modules: true,
                // localIdentName: '[hash:base64:5]',
                sourceMap: true,
              },
            },
            { loader: 'sass-loader', options: { sourceMap: true } },
          ],
        },
        {
          test: /\.(png|jpe?g|gif)$/,
          loader: 'url-loader',
          options: {
            publicPath: '../',
            limit: 5120,
            name(file) {
              if (file.indexOf('common/assets') === -1) {
                return 'images/[hash:8].[ext]';
              } else {
                return 'images/[name].[ext]';
              }
            },
          },
        },
      ],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/'),
      },
    },
    plugins: [
      ...htmlArr,
      new MiniCssExtractPlugin({
        filename: 'css/[name].min.css',
      }),
      new webpack.DefinePlugin({ ENV: JSON.stringify(process.env.NODE_ENV) }),
    ],
    optimization: {
      minimizer: [
        // 压缩js
        argv.mode === 'production'
          ? new UglifyJsPlugin({
              cache: true,
              parallel: true,
              sourceMap: false,
            })
          : () => {},
        new OptimizeCSSAssetsPlugin({}),
      ],
      splitChunks: {
        cacheGroups: {
          styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true,
          },
          components: {
            name: 'components.chunk',
            test: /components|layout/,
            chunks: 'all',
            enforce: true,
          },
          nodeModules: {
            name: 'vender.chunk',
            test: /node_modules/,
            chunks: 'all',
            enforce: true,
          },
        },
      },
    },
  };
};
