import gulp from 'gulp';
import fs from 'fs';
import htmlValidator from 'gulp-w3c-html-validator';
import pug from 'gulp-pug';
import plumber from 'gulp-plumber';
import changed from 'gulp-changed';
import gulpif from 'gulp-if';
import frontMatter from 'gulp-front-matter';
import prettify from 'gulp-prettify';
import revRewrite from 'gulp-rev-rewrite';
import lazypipe from 'lazypipe';
import htmlmin from 'gulp-htmlmin';
import inlinesource from 'gulp-inline-source';
import replace from 'gulp-replace';
import config from '../config';

// production pipes
const prodPipes = lazypipe()
  // if revision == true: replace CSS and JS files names with new name with revision
  .pipe(function () {
    return gulpif(
      config.revision,
      revRewrite({
        manifest: fs.existsSync(config.revManifest) ? gulp.src(config.revManifest) : false,
      })
    );
  })
  // inline critical CSS in HTML
  .pipe(inlinesource, {
    attribute: 'data-inline-critical',
    rootpath: config.dest.root,
  })
  // replace urls
  .pipe(replace, ('url(../', 'url()'))
  // if minifyHtml == true: minify html files
  .pipe(function () {
    return gulpif(
      config.minifyHtml,
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
      })
    );
  });

const renderHtml = (onlyChanged) => {
  return (
    gulp
      // take you PUG files
      .src([config.src.pug + '/[^_]*.pug'])
      // error handler
      .pipe(plumber({ errorHandler: config.errorHandler }))
      // work only with changed PUG files
      .pipe(gulpif(onlyChanged, changed(config.dest.html, { extension: '.html' })))
      // extract `YAML Front-Matter` header from files
      .pipe(frontMatter({ property: 'data' }))
      // compile PUG
      .pipe(pug())
      // prettify output
      .pipe(
        prettify({
          indent_size: 2,
          wrap_attributes: 'auto', // 'force'
          preserve_newlines: true,
          // unformatted: ['input', 'label'],
          end_with_newline: true,
        })
      )
      // validate result HTML files
      .pipe(htmlValidator())
      // if production: run production pipes
      .pipe(gulpif(config.production, prodPipes()))
      // put result to destination folder
      .pipe(gulp.dest(config.dest.html))
  );
};

gulp.task('pug', () => renderHtml());
gulp.task('pug:changed', () => renderHtml(true));

const build = (gulp) => gulp.parallel('pug');
const watch = (gulp) => {
  return function () {
    gulp.watch([config.src.pug + '/**/[^_]*.pug'], gulp.parallel('pug:changed'));

    gulp.watch([config.src.pug + '/**/_*.pug'], gulp.parallel('pug'));
  };
};

module.exports.build = build;
module.exports.watch = watch;
