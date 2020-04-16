import gulp from 'gulp';
import plumber from 'gulp-plumber';
import svgmin from 'gulp-svgmin';
import gulpcheerio from 'gulp-cheerio';
import svgSprite from 'gulp-svg-sprite';
import config from '../config';

gulp.task('sprite', () =>
  gulp
    .src(config.src.icons + '/*.svg')
    // minify svg
    .pipe(
      svgmin({
        js2svg: {
          pretty: true,
        },
      })
    )
    // remove all fill, style and stroke declarations in out shapes
    .pipe(
      gulpcheerio({
        run: function ($) {
          $('[fill]').removeAttr('fill');
          $('[stroke]').removeAttr('stroke');
          $('[style]').removeAttr('style');
          $('[class]').removeAttr('class');
          $('style').remove();
        },
        parserOptions: { xmlMode: true },
      })
    )
    .pipe(
      plumber({
        errorHandler: config.errorHandler,
      })
    )
    // build svg sprite
    .pipe(
      svgSprite({
        mode: {
          symbol: {
            sprite: '../sprites/sprite.svg',
            render: {
              scss: {
                dest: '../../../' + config.src.sassGen + '/_sprite-generated.scss',
                template: config.src.sass + '/settings/_sprite-template.scss',
              },
            },
          },
        },
      })
    )
    .pipe(gulp.dest(config.dest.img))
);

const build = (gulp) => gulp.series('sprite');
const watch = (gulp) => () => gulp.watch(config.src.icons + '/*.svg', gulp.parallel('sprite'));

module.exports.build = build;
module.exports.watch = watch;
