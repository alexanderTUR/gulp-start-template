import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import gulpif from 'gulp-if';
import terser from 'gulp-terser';
import lazypipe from 'lazypipe';
import rename from 'gulp-rename';
import rev from 'gulp-rev';
import config from '../config';

// production pipes
const prodPipes = lazypipe()
  // minify JS
  .pipe(terser)
  // if revision == true: add hash number to your JS files names
  .pipe(function () {
    return gulpif(config.revision, rev());
  });

gulp.task('js:bundle', () =>
  gulp
    // take JS libraries files you need
    .src([
      //  - uncomment what you need or add you own libraries
      //  - SVG-sprites fallback for IE (include, if you use SVG-sprites)
      config.nodeModules + '/svg4everybody/dist/svg4everybody.js',
      //  - Object.assign and Array.from polyfills for IE (needed for Micro Modal plugin)
      // config.src.jsPolyfills + '/Object.assign.js',
      // config.src.jsPolyfills + '/Array.from.js',
      //  - Micromodal plugin (lightweight modal - https://micromodal.now.sh/)
      // config.nodeModules + '/micromodal/dist/micromodal.js',
      //  - Slick slider (best carousel - https://kenwheeler.github.io/slick/)
      // config.nodeModules + '/slick-carousel/slick/slick.js',
      //  - Scroll to ID plugin (navigation on page - http://manos.malihu.gr/page-scroll-to-id/)
      // config.nodeModules + '/page-scroll-to-id/jquery.malihu.PageScroll2id.js',
    ])
    // error handler
    .on('error', config.errorHandler)
    // if development: init sourcemaps
    .pipe(gulpif(!config.production, sourcemaps.init()))
    // concatenate library JS files in one bundle JS file, and rename it to bundle.js
    .pipe(concat('bundle.js'))
    // rename file with .min suffix
    .pipe(rename({ suffix: '.min' }))
    // if production: run production pipes
    .pipe(gulpif(config.production, prodPipes()))
    // if development: write sourcemaps
    .pipe(gulpif(!config.production, sourcemaps.write()))
    // put result to destination folder
    .pipe(gulp.dest(config.dest.js))
    // if revision == true: write old and new files names to manifest.json
    .pipe(
      rev.manifest(config.revManifest, {
        base: './',
        merge: true, // merge with the existing manifest (if one exists)
      })
    )
    .pipe(gulp.dest('./'))
);

gulp.task('js:main', () =>
  gulp
    // take you custom JS files
    .src(config.src.js + '/*.js')
    // if development: init sourcemaps
    .pipe(gulpif(!config.production, sourcemaps.init()))
    // rename file with .min suffix
    .pipe(rename({ suffix: '.min' }))
    // convert modern JS syntax to older
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    // if production: run production pipes
    .pipe(gulpif(config.production, prodPipes()))
    // if development: write sourcemaps
    .pipe(gulpif(!config.production, sourcemaps.write()))
    // put result to destination folder
    .pipe(gulp.dest(config.dest.js))
    // if revision == true: write old and new files names to manifest.json
    .pipe(
      rev.manifest(config.revManifest, {
        base: './',
        merge: true, // merge with the existing manifest (if one exists)
      })
    )
    .pipe(gulp.dest('./'))
);

const build = (gulp) => gulp.series('js:bundle', 'js:main');
const watch = (gulp) => () =>
  gulp.watch(config.src.js + '/**/*.js', gulp.series('js:bundle', 'js:main'));

module.exports.build = build;
module.exports.watch = watch;
