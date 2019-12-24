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
import config from '../config';

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
    sort: sortCSSmq //mobile-first
    // replace with 'sort: sortCSSmq.desktopFirst' for desktop-first
  }),
];

const renderCss = (critical) => {
  return gulp
    .src(config.src.sass + '/*.{sass,scss}')
    .pipe(gulpif(!config.production,
      sourcemaps.init()
    ))
    // .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: config.production ? 'compact' : 'expanded', // nested, expanded, compact, compressed
      precision: 5
    }))
    .on('error', config.errorHandler)
    .pipe(postcss(processors))
    .pipe(gulpif(critical,
      rename({'prefix': config.splitOptions.prefix})
    ))
    .pipe(postcss([postcssCriticalSplit(getSplitOptions(critical))]))
    .pipe(gulpif(config.production,
      postcss([cssnano()])
    ))
    .pipe(gulpif(!config.production,
      sourcemaps.write('./')
    ))
    // .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.dest.css))
};

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
