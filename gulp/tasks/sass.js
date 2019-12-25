import gulp from 'gulp';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import mqpacker from 'css-mqpacker';
import sortCSSmq from 'sort-css-media-queries';
import postcssAnimation from 'postcss-animation';
import postcssWillChangeTransition from 'postcss-will-change-transition';
import postcssWillChange from 'postcss-will-change';
import flexFix from 'postcss-flexbugs-fixes';
import pxtorem from 'postcss-pxtorem';
import smoothScroll from 'postcss-momentum-scrolling';
import postcssAspectRatio from 'postcss-aspect-ratio';
import colorFunction from 'postcss-color-function';
import postcssPseudoClassEnter from 'postcss-pseudo-class-enter';
import cssDeclarationSorter from 'css-declaration-sorter';
import postcssCriticalSplit from 'postcss-critical-split';
import cssnano from 'cssnano';
import gulpif from 'gulp-if';
import rename from 'gulp-rename';
import lazypipe from 'lazypipe';
import rev from 'gulp-rev';
import config from '../config';

// Post-CSS plugins array
const processors = [
  // adds @keyframes from animate.css
  postcssAnimation(),
  // auto adds will-change property after transition property to speed up animations
  postcssWillChangeTransition(),
  // auto insert 3D hack before will-change property
  postcssWillChange(),
  // auto fix some flex-box issues
  flexFix(),
  // auto replace px to rem in all fonts rules
  pxtorem(),
  // auto adds -webkit-overflow-scrolling: touch to all stylechangeds with overflow: scroll for smooth scroll on iOS
  smoothScroll(),
  // adds aspect ratio to elements (example - aspect-ratio: '16:9')
  postcssAspectRatio(),
  // adds color functions (example - color(red a(90%))
  colorFunction(),
  // adds :hover and :focus states with one declaration (example - :enter)
  postcssPseudoClassEnter(),
  // auto sort css rules in 'concentric-css' order
  cssDeclarationSorter({order: 'concentric-css'}),
  // auto adds vendor prefixes
  autoprefixer(),
  // pack all media queries
  mqpacker({
    sort: sortCSSmq //default - mobile-first
    // replace with 'sort: sortCSSmq.desktopFirst' for desktop-first
  }),
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
  return gulp
    // take all SASS/SCSS files
    .src(config.src.sass + '/*.{sass,scss}')
    // if development: init sourcemaps
    .pipe(gulpif(!config.production,
      sourcemaps.init()
    ))
    // compile SASS
    .pipe(sass({
      outputStyle: config.production ? 'compact' : 'expanded', // nested, expanded, compact, compressed
      precision: 5
    }))
    // error handler
    .on('error', config.errorHandler)
    // apply postcss plugins
    .pipe(postcss(processors))
    // if critical CSS part: rename
    .pipe(gulpif(critical,
      rename({'prefix': config.splitOptions.prefix})
    ))
    // split CSS to critical/rest
    .pipe(postcss([postcssCriticalSplit(getSplitOptions(critical))]))
    .pipe(rename({'suffix': '-min'}))
    // if production: run production pipes
    .pipe(gulpif(config.production,
      prodPipes()
    ))
    // if development: write sourcemaps
    .pipe(gulpif(!config.production,
      sourcemaps.write('./')
    ))
    // put result to destination folder
    .pipe(gulp.dest(config.dest.css))
    // if revision == true: write old and new files names to manifest.json
    .pipe(rev.manifest(config.revManifest, {
      base: './',
      merge: true // merge with the existing manifest (if one exists)
    }))
    .pipe(gulp.dest('./'))
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

const build = gulp => gulp.series('sass:critical', 'sass:rest');
const watch = gulp => () => gulp.watch(config.src.sass + '/**/*.{sass,scss}', gulp.series('sass:critical', 'sass:rest'));

module.exports.build = build;
module.exports.watch = watch;
