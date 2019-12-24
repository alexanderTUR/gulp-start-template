import gulp from 'gulp';
import pug from 'gulp-pug';
import plumber from 'gulp-plumber'
import changed from 'gulp-changed';
import gulpif from 'gulp-if';
import prettify from 'gulp-prettify';
import config from '../config';

const renderHtml = (onlyChanged) => {
  return gulp
    .src([config.src.pug + '/[^_]*.pug'])
    .pipe(plumber({ errorHandler: config.errorHandler }))
    .pipe(gulpif(onlyChanged, changed(config.dest.html, { extension: '.html' })))
    .pipe(pug())
    .pipe(prettify({
      indent_size: 2,
      wrap_attributes: 'auto', // 'force'
      preserve_newlines: true,
      // unformatted: [],
      end_with_newline: true
    }))
    .pipe(gulp.dest(config.dest.html));
};

gulp.task('pug', () => renderHtml());
gulp.task('pug:changed', () => renderHtml(true));

const build = gulp => gulp.parallel('pug');
const watch = gulp => {
  return function() {
    gulp.watch([
      config.src.pug + '/**/[^_]*.pug'
    ], gulp.parallel('pug:changed'));

    gulp.watch([
      config.src.pug + '/**/_*.pug'
    ], gulp.parallel('pug'));
  }
};

module.exports.build = build;
module.exports.watch = watch;
