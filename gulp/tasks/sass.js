import gulp from 'gulp';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import postcssSortMediaQueries from 'postcss-sort-media-queries';
import postcssAnimation from 'postcss-animation';
import postcssMagicAnimation from 'postcss-magic-animations';
import postcssWillChangeTransition from 'postcss-will-change-transition';
import postcssWillChange from 'postcss-will-change';
import flexFix from 'postcss-flexbugs-fixes';
import pxtorem from 'postcss-pxtorem';
import lineHeightToUnitless from 'postcss-line-height-px-to-unitless';
import smoothScroll from 'postcss-momentum-scrolling';
import postcssAspectRatio from 'postcss-aspect-ratio';
import postcssColorMod from 'postcss-color-mod-function';
import rgb from 'postcss-rgb';
import postcssPseudoClassEnter from 'postcss-pseudo-class-enter';
import cssDeclarationSorter from 'css-declaration-sorter';
import postcssCriticalSplit from 'postcss-critical-split';
import easingGradients from 'postcss-easing-gradients';
import borderAlign from 'postcss-border-align';
import scrollbar from 'postcss-scrollbar';
import postcssNormalize from 'postcss-normalize';
import postcssTriangle from 'postcss-triangle';
import postcssEasings from 'postcss-easings';
import postcssViewportHeight from 'postcss-viewport-height-correction';
import cssnano from 'cssnano';
import lost from 'lost';
import gulpif from 'gulp-if';
import rename from 'gulp-rename';
import lazypipe from 'lazypipe';
import rev from 'gulp-rev';
import config from '../config';

// Post-CSS plugins array
const processors = [
  // use the parts of normalize.css or sanitize.css that you need from your browserslist
  postcssNormalize(),
  // solve the popular problem when 100vh doesn’t fit the mobile browser screen
  postcssViewportHeight(),
  // lostgrid grid system (look for documentation at http://lostgrid.org/docs.html)
  lost(),
  // create three different types of CSS-triangles
  postcssTriangle(),
  // adds @keyframes from animate.css
  postcssAnimation(),
  // adds @keyframes from Magic Animations
  postcssMagicAnimation(),
  // replace easing name from easings.net to cubic-bezier()
  postcssEasings(),
  // auto adds will-change property after transition property to speed up animations
  postcssWillChangeTransition(),
  // auto insert 3D hack before will-change property
  postcssWillChange(),
  // auto fix some flex-box issues
  flexFix(),
  // auto convert a line-height value with px to a unitless value
  lineHeightToUnitless(),
  // auto replace px to rem in all fonts rules
  pxtorem(),
  // auto adds -webkit-overflow-scrolling: touch to all stylechangeds with overflow: scroll for smooth scroll on iOS
  smoothScroll(),
  // adds aspect ratio to elements (example - aspect-ratio: '16:9')
  postcssAspectRatio(),
  // adds color functions (example - color(red a(90%))
  postcssColorMod(),
  // use rgb and rgba with hex values
  rgb(),
  // enabling custom scrollbars
  scrollbar(),
  // allows you to create borders which do not affect the layout of the document
  borderAlign(),
  // create smooth linear-gradients that approximate easing functions
  easingGradients(),
  // adds :hover and :focus states with one declaration (example - :enter)
  postcssPseudoClassEnter(),
  // auto sort css rules in 'concentric-css' order
  // cssDeclarationSorter({ order: 'smacss' }),
  // auto adds vendor prefixes
  autoprefixer(),
];

// production pipes
const prodPipes = lazypipe()
  // minify CSS
  .pipe(postcss, [cssnano()])
  // if revision == true: add hash number to your CSS files names
  .pipe(function () {
    return gulpif(config.revision, rev());
  });

const renderCss = (critical) => {
  return (
    gulp
      // take all SASS/SCSS files
      .src(`${config.src.sass}/*.{sass,scss}`)
      // if development: init sourcemaps
      .pipe(gulpif(!config.production, sourcemaps.init({ loadMaps: true })))
      // compile SASS
      .pipe(
        sass({
          outputStyle: config.production ? 'compact' : 'expanded', // nested, expanded, compact, compressed
          precision: 5,
        })
      )
      // error handler
      .on('error', config.errorHandler)
      // apply postcss plugins
      .pipe(postcss(processors))
      // if critical CSS part: rename
      .pipe(gulpif(critical, rename({ prefix: config.splitOptions.prefix })))
      // split CSS to critical/rest
      .pipe(postcss([postcssCriticalSplit(getSplitOptions(critical))]))
      // pack/sort all media queries
      .pipe(
        postcss([
          postcssSortMediaQueries({
            // sort: 'mobile-first' default value
            // sort: 'desktop-first'
          }),
        ])
      )
      // rename file with .min suffix
      .pipe(rename({ suffix: '.min' }))
      // if production: run production pipes
      .pipe(gulpif(config.production, prodPipes()))
      // if development: write sourcemaps
      .pipe(gulpif(!config.production, sourcemaps.write()))
      // put result to destination folder
      .pipe(gulp.dest(config.dest.css))
      // if revision == true: write old and new files names to manifest.json
      .pipe(
        rev.manifest(config.revManifest, {
          base: './',
          merge: true, // merge with the existing manifest (if one exists)
        })
      )
      .pipe(gulp.dest('./'))
  );
};

// CSS split output function
function getSplitOptions(isCritical) {
  if (isCritical === true) {
    config.splitOptions.output = postcssCriticalSplit.output_types.CRITICAL_CSS;
  } else {
    config.splitOptions.output = postcssCriticalSplit.output_types.REST_CSS;
  }

  return config.splitOptions;
}

gulp.task('sass:critical', () => renderCss(true));
gulp.task('sass:rest', () => renderCss(false));

const build = (gulp) => gulp.series('sass:critical', 'sass:rest');
const watch = (gulp) => () =>
  gulp.watch(`${config.src.sass}/**/*.{sass,scss}`, gulp.series('sass:critical', 'sass:rest'));

module.exports.build = build;
module.exports.watch = watch;
