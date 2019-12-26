import gulp from 'gulp';
import config from './gulp/config';

const getTaskBuild = task => require('./gulp/tasks/' + task).build(gulp);
const getTaskWatch = task => require('./gulp/tasks/' + task).watch(gulp);

// PUG tasks
gulp.task('pug', () => getTaskBuild('pug'));
gulp.task('pug:watch', getTaskWatch('pug'));

// JS tasks
gulp.task('js', getTaskBuild('js'));
gulp.task('js:watch', getTaskWatch('js'));

// SASS tasks
gulp.task('sass', getTaskBuild('sass'));
gulp.task('sass:watch', getTaskWatch('sass'));

// SVG sprite tasks
gulp.task('sprite', () => getTaskBuild('sprite'));
gulp.task('sprite:watch', getTaskWatch('sprite'));

// Copy files tasks
gulp.task('copy', getTaskBuild('copy'));
gulp.task('copy:watch', getTaskWatch('copy'));

// Clean task
gulp.task('clean', getTaskBuild('clean'));

// Server task
gulp.task('server', getTaskBuild('server'));

// Set production mode
const setmodeProd = done => {
  config.setEnv('production');
  config.logEnv();
  done();
};

// Set development mode
const setmodeDev = done => {
  config.setEnv('development');
  config.logEnv();
  done();
};

// Build (production) task
gulp.task(
  'build',
  gulp.series(
    setmodeProd,
    'clean',
    'sass',
    'js',
    'sprite',
    'copy',
    'pug'
  )
);

// Build (development) task
gulp.task(
  'build:dev',
  gulp.series(
    setmodeDev,
    'clean',
    'sass',
    'js',
    'sprite',
    'copy',
    'pug'
  )
);

// Watch task
gulp.task(
  'watch',
  gulp.parallel(
    'copy:watch',
    'pug:watch',
    'sass:watch',
    'js:watch',
    'sprite:watch'
  )
);

// Default task
gulp.task('default', gulp.series(['build:dev', 'server', 'watch']));
