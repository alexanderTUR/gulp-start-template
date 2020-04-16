import gulp from 'gulp';
import config from '../config.js';

// copy static images files to destination folder
gulp.task('copy:img', () =>
  gulp
    .src([config.src.img + '/**/*.{jpg,png,jpeg,svg,gif}', '!' + config.src.icons + '/**/*.*'])
    .pipe(gulp.dest(config.dest.img))
);

// copy fonts files to destination folder
gulp.task('copy:fonts', () =>
  gulp.src(config.src.fonts + '/*.{ttf,eot,woff,woff2}').pipe(gulp.dest(config.dest.fonts))
);

// copy JS vendor files to destination folder
gulp.task('copy:vendor', () =>
  gulp.src(config.src.jsVendor + '/*.js').pipe(gulp.dest(config.dest.jsVendor))
);

const build = (gulp) => gulp.parallel('copy:img', 'copy:fonts', 'copy:vendor');
const watch = (gulp) => () => {
  gulp.watch([config.src.img + '/*'], gulp.parallel('copy:img'));

  gulp.watch([config.src.fonts + '/*'], gulp.parallel('copy:fonts'));

  gulp.watch([config.src.jsVendor + '/*'], gulp.parallel('copy:vendor'));
};

module.exports.build = build;
module.exports.watch = watch;
