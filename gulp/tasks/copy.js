import gulp from 'gulp';
import config from '../config.js';

gulp.task('copy:img', () => gulp
  .src([
    config.src.img + '/**/*.{jpg,png,jpeg,svg,gif}',
    '!' + config.src.icons + '/**/*.*'
	])
  .pipe(gulp.dest(config.dest.img))
);

gulp.task('copy:fonts', () => gulp
  .src(config.src.fonts + '/*.{ttf,eot,woff,woff2}')
  .pipe(gulp.dest(config.dest.fonts))
);

gulp.task('copy:vendor', () => gulp
  .src(config.src.jsVendor + '/*.js')
  .pipe(gulp.dest(config.dest.jsVendor))
);

const build = gulp => gulp.parallel('copy:img', 'copy:fonts', 'copy:vendor');
const watch = gulp => () => gulp.watch(config.src.img + '/*', gulp.parallel('copy:img', 'copy:fonts', 'copy:vendor'));

module.exports.build = build;
module.exports.watch = watch;
