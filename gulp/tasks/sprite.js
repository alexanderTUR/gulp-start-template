import gulp from 'gulp';
import plumber from 'gulp-plumber';
import svgmin from 'gulp-svgmin';
import gulpcheerio from 'gulp-cheerio';
import svgSprite from 'gulp-svg-sprite';
import config from '../config';

gulp.task('sprite:mono', () =>
  gulp
    .src(`${config.src.iconsMono}/*.svg`)
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
            sprite: '../sprites/sprite-mono.svg',
            render: {
              scss: {
                dest: `../../../${config.src.sassGen}/_sprite-mono-generated.scss`,
                template: `${config.src.sass}/settings/_sprite-mono-template.scss`,
              },
            },
          },
        },
      })
    )
    .pipe(gulp.dest(config.dest.img))
);

gulp.task('sprite:multi', () =>
  gulp
    .src(`${config.src.iconsMulti}/*.svg`)
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
            sprite: '../sprites/sprite-multi.svg',
            render: {
              scss: {
                dest: `../../../${config.src.sassGen}/_sprite-multi-generated.scss`,
                template: `${config.src.sass}/settings/_sprite-multi-template.scss`,
              },
            },
          },
        },
      })
    )
    .pipe(gulp.dest(config.dest.img))
);

const build = (gulp) => gulp.parallel('sprite:mono', 'sprite:multi');
const watch = (gulp) => () =>
  gulp.watch(
    [`${config.src.iconsMono}/*.svg`, `${config.src.iconsMulti}/*.svg`],
    gulp.parallel('sprite:mono', 'sprite:multi')
  );

module.exports.build = build;
module.exports.watch = watch;
