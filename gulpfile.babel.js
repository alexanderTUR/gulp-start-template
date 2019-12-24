import gulp from 'gulp';
import config from './gulp/config';

const getTaskBuild = task => require('./gulp/tasks/' + task).build(gulp);
const getTaskWatch = task => require('./gulp/tasks/' + task).watch(gulp);

gulp.task('pug', getTaskBuild('pug'));
gulp.task('pug:watch', getTaskWatch('pug'));

gulp.task('js', getTaskBuild('js'));
gulp.task('js:watch', getTaskWatch('js'));

gulp.task('sass', getTaskBuild('sass'));
gulp.task('sass:watch', getTaskWatch('sass'));

gulp.task('sprite', () => getTaskBuild('sprite'));
gulp.task('sprite:watch', getTaskWatch('sprite'));

gulp.task('copy', getTaskBuild('copy'));
gulp.task('copy:watch', getTaskWatch('copy'));

gulp.task('clean', getTaskBuild('clean'));

gulp.task('server', getTaskBuild('server'));

const setmodeProd = done => {
  config.setEnv('production');
  config.logEnv();
  done();
};

const setmodeDev = done => {
  config.setEnv('development');
  config.logEnv();
  done();
};

gulp.task(
  'build',
  gulp.series(
    setmodeProd,
    'clean',
    'sass',
    'js',
    'pug',
    'sprite',
    'copy'
  )
);

gulp.task(
  'build:dev',
  gulp.series(
    setmodeDev,
    'clean',
    'sass',
    'js',
    'pug',
    'sprite',
    'copy'
  )
);

gulp.task(
  'watch',
  gulp.parallel(
    'copy:watch',
    'pug:watch',
    'sass:watch',
    'js:watch',
    'sprite:watch'
  )
);

gulp.task('default', gulp.series(['build:dev', 'server', 'watch']));






// const gulp = require('gulp');
// const pug = require('gulp-pug');
// const prettyHtml = require('gulp-pretty-html');
// const sass = require('gulp-sass');
// const postcss = require('gulp-postcss');
// const autoprefixer = require('autoprefixer');
// const mqpacker = require('css-mqpacker');
// const sortCSSmq = require('sort-css-media-queries');
// const listSelectorsPlugin = require('list-selectors').plugin;
// const cssnano = require('cssnano');
// const cssbyebye = require('css-byebye');
// const flexFix = require('postcss-flexbugs-fixes');
// const pxtorem = require('postcss-pxtorem');
// const sourcemaps = require('gulp-sourcemaps');
// const smoothScroll = require('postcss-momentum-scrolling');
// const doiuse = require('doiuse');
// const colors = require('colors');
// const postcssWillChange = require('postcss-will-change');
// const postcssWillChangeTransition = require('postcss-will-change-transition');
// const postcssAspectRatio = require('postcss-aspect-ratio');
// const postcssPseudoClassEnter = require('postcss-pseudo-class-enter');
// const postcssAnimation = require('postcss-animation');
// const postcssCriticalSplit = require('postcss-critical-split');
// const colorFunction = require('postcss-color-function');
// const cssDeclarationSorter = require('css-declaration-sorter');
// const notify = require('gulp-notify');
// const concat = require('gulp-concat');
// const uglify = require('gulp-uglify-es').default;
// const htmlmin = require('gulp-htmlmin');
// const imagemin = require('gulp-imagemin');
// const rename = require('gulp-rename');
// const svgSprite = require('gulp-svg-sprite');
// const svgmin = require('gulp-svgmin');
// const cheerio = require('gulp-cheerio');
// const replace = require('gulp-replace');
// const del = require('del');
// const rev = require('gulp-rev');
// const revRewrite = require('gulp-rev-rewrite');
// const inlinesource = require('gulp-inline-source');
// const browserSync = require('browser-sync').create();
// const reload = browserSync.reload;
//
// // Build CSS files with reversion
// gulp.task('build:css', () => {
//   // const cssbyebyeOptions = ['.remove-test'];
//   // postCSS plugins for build optimizations
//   const processors = [
//
//     // pack all media queries
//     mqpacker({
//       sort: sortCSSmq //mobile-first
//       // replace with 'sort: sortCSSmq.desktopFirst' for desktop-first
//     }),
//
//     // check CSS for support in browsers from browserlist with outputs to console
//     doiuse({
//       browserslist: 'package.json',
//       ignore: [
//         'will-change',
//         'object-fit',
//         'flexbox',
//         'css-appearance'
//       ],
//       onFeatureUsage: function (info) {
//         const selector = info.usage.parent.selector;
//         const property = `${info.usage.prop}: ${info.usage.value}`;
//
//         let status = info.featureData.caniuseData.status.toUpperCase();
//
//         if (info.featureData.missing) {
//           status = `NOT SUPPORTED IN ${info.featureData.missing}`.red;
//         } else if (info.featureData.partial) {
//           status = `PARTIAL SUPPORT ${info.featureData.partial}`.yellow;
//         }
//
//         console.log(`\n${status}:\n\n    ${selector} {\n        ${property};\n    }\n`);
//       }
//     }),
//
//     // remove the CSS rules that you don't want
//     // pass a list of selectors that you want to exclude and it will remove them and the associated rules from your CSS.
//     // cssbyebye({
//     // rulesToRemove: ['.remove-test'] // array of selectors, that will be not included to result CSS file
//     // }),
//
//     // generate a nicely organized list of all the selectors used in your CSS
//     listSelectorsPlugin((list) => {
//       const inspect = require('util').inspect;
//
//       console.log('SELECTORS:'.blue);
//       console.log(inspect(list.selectors, { maxArrayLength: null }).blue);
//       console.log('IDS:'.red);
//       console.log(inspect(list.simpleSelectors.ids, { maxArrayLength: null }).red);
//     }),
//     // minify css
//     cssnano()
//   ];
//
//   // minify, analise and copy CSS
//   return gulp.src([scrPath + 'css/*.css'])
//     .pipe(postcss(processors))
//     .pipe(rev())
//     .pipe(gulp.dest(buildPath + 'css'))
//     .pipe(rev.manifest('./' + 'rev-manifest.json', {
//       base: './',
//       merge: true // merge with the existing manifest (if one exists)
//     }))
//     .pipe(gulp.dest('./'));
// });
//
// // Build JS files with reversion
// gulp.task('build:js', () => {
//   // minify and copy JS with revision
//   return gulp.src([scrPath + 'js/**/*.min.js', '!' + scrPath + 'js/libs/**/*.*', '!' + scrPath + 'js/vendor/**/*.*'])
//     .pipe(uglify())
//     .pipe(rev())
//     .pipe(gulp.dest(buildPath + 'js'))
//     .pipe(rev.manifest('./' + 'rev-manifest.json', {
//       base: './',
//       merge: true // merge with the existing manifest (if one exists)
//     }))
//     .pipe(gulp.dest('./'));
// });
//
// // Build HTML files with reversion
// gulp.task('build:html', () => {
//   const manifest = gulp.src('./' + 'rev-manifest.json');
//   // copy HTML and replace CSS/JS includes after reversion
//   return gulp.src([scrPath + '*.html'])
//     .pipe(revRewrite({ manifest }))
//     // minify html if needed
//     // .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
//     .pipe(gulp.dest(buildPath));
// });
//
// gulp.task('build:html-inline', () => {
//   return gulp.src([buildPath + '*.html'])
//     .pipe(inlinesource())
//     .pipe(replace('url(../', 'url('))
//     .pipe(gulp.dest(buildPath));
// });
//
