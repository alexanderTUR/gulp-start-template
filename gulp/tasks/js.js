import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import concat from 'gulp-concat';
import gulpif from 'gulp-if';
import uglify from 'gulp-uglify-es';
// import rename from 'gulp-rename';
import config from '../config';

gulp.task('js:bundle', () => gulp
  .src([
    //  - uncomment what you need
    //  - SVG-sprites fallback for IE (include, if you use SVG-sprites)
    config.src.jsLibs + '/svg4everybody_2.1.9/svg4everybody.js',
    //  - GSAP (animations - https://greensock.com/gsap)
    // config.src.jsLibs + '/gsap_3.0.4/gsap.js',
    //  - ScrollMagic (do magic on scroll - http://scrollmagic.io/)
    // config.src.jsLibs + '/scrollmagic_2.0.7/ScrollMagic.js',
    // config.src.jsLibs + '/scrollmagic_2.0.7/jquery.ScrollMagic.js',
    // config.src.jsLibs + '/scrollmagic_2.0.7/animation.gsap.js',
    // config.src.jsLibs + '/scrollmagic_2.0.7/debug.addIndicators.js',
    //  - Slick slider (best carousel - https://kenwheeler.github.io/slick/)
    // config.src.jsLibs + '/slick_1.8.1/slick.js',
    //  - Scroll to ID plugin (navigation on page - http://manos.malihu.gr/page-scroll-to-id/)
    // config.src.jsLibs + '/scrolltoid_1.6.3/jquery.malihu.PageScroll2id.js',
  ])
  .pipe(gulpif(!config.production,
    sourcemaps.init()
  ))
  .pipe(concat('bundle.js'))
  .pipe(gulpif(config.production,
    uglify()
  ))
  .pipe(gulpif(!config.production,
    sourcemaps.write('/')
  ))
  .pipe(gulp.dest(config.dest.js))
);

gulp.task('js:main', () => gulp
  .src(config.src.js + '/*.js')
  .pipe(gulpif(!config.production,
    sourcemaps.init()
  ))
  .pipe(gulpif(config.production,
    uglify()
  ))
  .pipe(gulpif(!config.production,
    sourcemaps.write('/')
  ))
  .pipe(gulp.dest(config.dest.js))
);

const build = gulp => gulp.parallel('js:bundle', 'js:main');
const watch = gulp => () => gulp.watch(config.src.js + '/**/*.js', gulp.parallel('js:bundle', 'js:main'));

module.exports.build = build;
module.exports.watch = watch;
