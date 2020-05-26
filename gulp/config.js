import log from 'fancy-log';
import ansiColors from 'ansi-colors';

const production =
  process.env.NODE_ENV === 'production' || process.argv.indexOf('build') !== -1 || false;

// main paths
const srcPath = 'src';
const destPath = 'build';

const config = {
  env: 'development',
  production: production,
  revision: false, // set to true if CSS and JS files revision needed
  minifyHtml: false, // set to true if HTML minification needed
  revManifest: 'rev-manifest.json',
  nodeModules: 'node_modules',

  // src paths
  src: {
    root: srcPath,
    pug: `${srcPath}/pug`,
    sass: `${srcPath}/sass`,
    sassGen: `${srcPath}//sass/generated`,
    js: `${srcPath}/js`,
    jsLibs: `${srcPath}/js/libs`,
    jsVendor: `${srcPath}/js/vendor`,
    jsPolyfills: `${srcPath}/js/libs/polyfills`,
    img: `${srcPath}/img`,
    icons: `${srcPath}/img/icons`,
    iconsMono: `${srcPath}/img/icons/mono`,
    iconsMulti: `${srcPath}/img/icons/multi`,
    fonts: `${srcPath}/fonts`,
    favicons: `${srcPath}/favicons`,
  },

  // destination paths
  dest: {
    root: destPath,
    html: destPath,
    css: `${destPath}/css`,
    js: `${destPath}/js`,
    jsVendor: `${destPath}/js/vendor`,
    img: `${destPath}/img`,
    fonts: `${destPath}/fonts`,
  },

  // CSS split options
  splitOptions: {
    start: 'critical:start',
    stop: 'critical:end',
    prefix: 'critical-',
  },

  setEnv: function (env) {
    if (typeof env !== 'string') return;
    this.env = env;
    this.production = env === 'production';
    process.env.NODE_ENV = env;
  },

  logEnv: function () {
    log(ansiColors.black.bgYellow(`Environment: ${process.env.NODE_ENV}`));
  },

  errorHandler: require('./util/handle-errors'),
};

config.setEnv(production ? 'production' : 'development');

module.exports = config;
