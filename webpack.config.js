const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

const outputDirectory = './src/api/dist';

module.exports = {
  entry: ['babel-polyfill', './src/webapp/index.js'],
  output: {
    path: path.join(__dirname, outputDirectory),
    filename: 'bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [{
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      /*{
        test: /\.png$/,
        use: 'public/'
      },*/
      {
        test: /\.css$/,
        use: [
            'style-loader',
            {
                loader: 'css-loader',
                options: {
                    importLoaders: 1,
                }
            },
            {
                loader: `postcss-loader`,
                options: {
                    postcssOptions: {
                        plugins: [
                            require('tailwindcss'),
                            require('autoprefixer')
                        ] 
                    }
                }
            },
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|)$/,
        loader: 'url-loader',
        options: {
          limit: 100000
        }
      },
      {           
        test: /\.(png|svg|jpg|jpeg|gif|ogg|mp3|wav)$/,
        type: 'asset/resource',         
      }, 
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  devServer: {
    port: 3000,
    open: true,
    historyApiFallback: true,
    proxy: [{
        context: ['/api'],
        target: 'http://localhost:8080',
        secure: false,
        pathRewrite: { '^/api': '' },
    }]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico'
    })
  ]
};