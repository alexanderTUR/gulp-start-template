const gulp = require('gulp');
const pug = require('gulp-pug');
const prettyHtml = require('gulp-pretty-html');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const sortCSSmq = require('sort-css-media-queries');
const listSelectorsPlugin = require('list-selectors').plugin;
const cssnano = require('cssnano');
const cssbyebye = require('css-byebye');
const flexFix = require('postcss-flexbugs-fixes');
const pxtorem = require('postcss-pxtorem');
const sourcemaps = require('gulp-sourcemaps');
const smoothScroll = require('postcss-momentum-scrolling');
const doiuse = require('doiuse');
const colors = require('colors');
const postcssWillChange = require('postcss-will-change');
const postcssWillChangeTransition = require('postcss-will-change-transition');
const postcssAspectRatio = require('postcss-aspect-ratio');
const postcssPseudoClassEnter = require('postcss-pseudo-class-enter');
const postcssAnimation = require('postcss-animation');
const postcssCriticalSplit = require('postcss-critical-split');
const colorFunction = require('postcss-color-function');
const cssDeclarationSorter = require('css-declaration-sorter');
const notify = require('gulp-notify');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const rename = require('gulp-rename');
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const del = require('del');
const rev = require('gulp-rev');
const revRewrite = require('gulp-rev-rewrite');
const inlinesource = require('gulp-inline-source');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

// Path variables
const scrPath = 'src/';
const buildPath = 'build/';

// PUG task
gulp.task('pug', () => {
  return gulp.src(scrPath + 'pug/*.pug')
    .pipe(pug()
      .on('error', notify.onError(function (err) {
        return {
          title: 'PUG error',
          message: err.message
        }
      }))
    )
    .pipe(prettyHtml({
      indent_size: 2,
      unformatted: ['abbr', 'area', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'ins', 'kbd', 'keygen', 'map', 'mark', 'math', 'meter', 'noscript', 'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', 'small', 'strong', 'sub', 'sup', 'template', 'time', 'u', 'var', 'wbr', 'text', 'acronym', 'address', 'big', 'dt', 'ins', 'strike', 'tt']
    }))
    .pipe(gulp.dest(scrPath))
});

// SASS task
gulp.task('sass', () => {
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
  ];
  return gulp.src(scrPath + 'scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass()
      .on('error', notify.onError(function (err) {
        return {
          title: 'SASS error',
          message: err.formatted
        }
      }))
    )
    .pipe(postcss(processors))
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest(scrPath + 'css'))
    .pipe(browserSync.stream());
});

// Split CSS tasks
gulp.task('css:split:critical', () => {
  let splitOptions = getSplitOptions(true);

  return gulp.src([scrPath + 'css/**/*.css', '!' + scrPath+ 'css/' + splitOptions.prefix + '*.css'])
    .pipe(sourcemaps.init({'loadMaps': true}))
    .pipe(postcss([postcssCriticalSplit(splitOptions)]))
    .pipe(rename({'prefix': splitOptions.prefix}))
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest(scrPath + 'css'))
    .pipe(browserSync.stream());
});

gulp.task('css:split:rest', () => {
  let splitOptions = getSplitOptions(false);

  return gulp.src([scrPath + 'css/**/*.css', '!' + scrPath+ 'css/' + splitOptions.prefix + '*.css'])
    .pipe(sourcemaps.init({'loadMaps': true}))
    .pipe(postcss([postcssCriticalSplit(splitOptions)]))
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest(scrPath + 'css'))
    .pipe(browserSync.stream());
});

gulp.task('css:split', gulp.series('css:split:critical', 'css:split:rest'));

function getSplitOptions(isCritical) {
  let options = {
    'start': 'critical:start',
    'stop': 'critical:end',
    'prefix': 'critical-'
  };

  if (isCritical === true) {
    options.output = postcssCriticalSplit.output_types.CRITICAL_CSS;
  } else {
    options.output = postcssCriticalSplit.output_types.REST_CSS;
  }

  return options;
}


// Js bundle task
gulp.task('js:bundle', () => {
  return gulp.src([
    //  - uncomment what you need
    //  - SVG-sprites fallback for IE (include, if you use SVG-sprites)
    scrPath + 'js/libs/svg4everybody_2.1.9/svg4everybody.js',
    //  - GSAP (animations - https://greensock.com/gsap)
    // scrPath + 'js/libs/gsap_2.1.3/TweenMax.js',
    //  - ScrollMagic (do magic on scroll - http://scrollmagic.io/)
    // scrPath + 'js/libs/scrollmagic_2.0.7/ScrollMagic.js',
    // scrPath + 'js/libs/scrollmagic_2.0.7/jquery.ScrollMagic.js',
    // scrPath + 'js/libs/scrollmagic_2.0.7/animation.gsap.js',
    // scrPath + 'js/libs/scrollmagic_2.0.7/debug.addIndicators.js',
    //  - Slick slider (best carousel - https://kenwheeler.github.io/slick/)
    // scrPath + 'js/libs/slick_1.9.0/slick.js',
    //  - Scroll to ID plugin (navigation on page - http://manos.malihu.gr/page-scroll-to-id/)
    // scrPath + 'js/libs/scrolltoid_1.6.3/jquery.malihu.PageScroll2id.js',
  ])
    .pipe(sourcemaps.init())
    .pipe(concat('bundle.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest(scrPath + 'js'))
});

// Js main task
gulp.task('js:main', () => {
  return gulp.src([
    scrPath + 'js/custom.js'
  ])
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('/'))
    .pipe(gulp.dest(scrPath + 'js'))
});

// SVG mono-color sprite task
gulp.task('svg-sprite:mono', () => {
  return gulp.src(scrPath + 'img/svg-to-sprite-monocolor/*.svg')
  // minify svg
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    // remove all fill, style and stroke declarations in out shapes
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
        $('[class]').removeAttr('class');
        $('style').remove();
      },
      parserOptions: {xmlMode: true}
    }))
    // cheerio plugin create unnecessary string '&gt;', so replace it.
    .pipe(replace('&gt;', '>'))
    // build svg sprite
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: '../sprites/sprite-monocolor.svg',
          render: {
            scss: {
              dest: '../../scss/global/generated/_sprite_generated_monocolor.scss',
              template: scrPath + 'scss/settings/_sprite_template_monocolor.scss'
            }
          }
        }
      }
    }))
    .pipe(gulp.dest(scrPath + 'img'))
});

// SVG multi-color sprite task
gulp.task('svg-sprite:multi', () => {
  return gulp.src(scrPath + 'img/svg-to-sprite-multicolor/*.svg')
  // minify svg
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    // remove all fill, style and stroke declarations in out shapes
    .pipe(cheerio({
      parserOptions: {xmlMode: true}
    }))
    // cheerio plugin create unnecessary string '&gt;', so replace it.
    .pipe(replace('&gt;', '>'))
    // build svg sprite
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: '../sprites/sprite-multicolor.svg',
          render: {
            scss: {
              dest: '../../scss/global/generated/_sprite_generated_multicolor.scss',
              template: scrPath + 'scss/settings/_sprite_template_multicolor.scss'
            }
          }
        }
      }
    }))
    .pipe(gulp.dest(scrPath + 'img'))
});

// Build SVG sprite task
gulp.task('svg-sprite-build', gulp.parallel('svg-sprite:mono', 'svg-sprite:multi'));

// Browser Sync task
gulp.task('browser-sync', () => {
  browserSync.init({
    server: {
      baseDir: scrPath
    },
    files: [
      {
        match: [scrPath + 'img/**'],
        fn: function (event, file) {
          this.reload()
        }
      }
    ],
    notify: false,
    open: false,
    browser: 'google chrome'
  });
});

// Watch task
gulp.task('watch', () => {
  gulp.watch(scrPath + 'pug/**/*.*', gulp.series('pug'));
  gulp.watch(scrPath + '*.html').on('change', reload);
  gulp.watch(scrPath + 'scss/**/*.*', gulp.series('sass', 'css:split'));
  gulp.watch(scrPath + 'js/libs/*.*', gulp.series('js:bundle')).on('change', reload);
  gulp.watch(scrPath + 'js/custom.js', gulp.series('js:main')).on('change', reload);
  gulp.watch([scrPath + 'img/svg-to-sprite-monocolor/*.svg', scrPath + 'img/svg-to-sprite-multicolor/*.svg'], gulp.series('svg-sprite-build'));
});

// Compile all files before copy to build dir
gulp.task('build:compile', gulp.series('svg-sprite-build', 'pug', 'sass', 'css:split', 'js:bundle', 'js:main'));

// Clean build dir before copy all files
gulp.task('build:clean', (done) => {
  del.sync([buildPath, 'rev-manifest.json']);
  done();
});

// Build CSS files with reversion
gulp.task('build:css', () => {
  // const cssbyebyeOptions = ['.remove-test'];
  // postCSS plugins for build optimizations
  const processors = [

    // pack all media queries
    mqpacker({
      sort: sortCSSmq //mobile-first
      // replace with 'sort: sortCSSmq.desktopFirst' for desktop-first
    }),

    // check CSS for support in browsers from browserlist with outputs to console
    doiuse({
      browserslist: 'package.json',
      ignore: [
        'will-change',
        'object-fit',
        'flexbox',
        'css-appearance'
      ],
      onFeatureUsage: function (info) {
        const selector = info.usage.parent.selector;
        const property = `${info.usage.prop}: ${info.usage.value}`;

        let status = info.featureData.caniuseData.status.toUpperCase();

        if (info.featureData.missing) {
          status = `NOT SUPPORTED IN ${info.featureData.missing}`.red;
        } else if (info.featureData.partial) {
          status = `PARTIAL SUPPORT ${info.featureData.partial}`.yellow;
        }

        console.log(`\n${status}:\n\n    ${selector} {\n        ${property};\n    }\n`);
      }
    }),

    // remove the CSS rules that you don't want
    // pass a list of selectors that you want to exclude and it will remove them and the associated rules from your CSS.
    // cssbyebye({
    // rulesToRemove: ['.remove-test'] // array of selectors, that will be not included to result CSS file
    // }),

    // generate a nicely organized list of all the selectors used in your CSS
    listSelectorsPlugin((list) => {
      const inspect = require('util').inspect;

      console.log('SELECTORS:'.blue);
      console.log(inspect(list.selectors, { maxArrayLength: null }).blue);
      console.log('IDS:'.red);
      console.log(inspect(list.simpleSelectors.ids, { maxArrayLength: null }).red);
    }),
    // minify css
    cssnano()
  ];

  // minify, analise and copy CSS
  return gulp.src([scrPath + 'css/*.css'])
    .pipe(postcss(processors))
    .pipe(rev())
    .pipe(gulp.dest(buildPath + 'css'))
    .pipe(rev.manifest('./' + 'rev-manifest.json', {
      base: './',
      merge: true // merge with the existing manifest (if one exists)
    }))
    .pipe(gulp.dest('./'));
});

// Build JS files with reversion
gulp.task('build:js', () => {
  // minify and copy JS with revision
  return gulp.src([scrPath + 'js/**/*.min.js', '!' + scrPath + 'js/libs/**/*.*', '!' + scrPath + 'js/vendor/**/*.*'])
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest(buildPath + 'js'))
    .pipe(rev.manifest('./' + 'rev-manifest.json', {
      base: './',
      merge: true // merge with the existing manifest (if one exists)
    }))
    .pipe(gulp.dest('./'));
});

//Copy vendor JS files
gulp.task('build:js-vendor', () => {
  return gulp.src([scrPath + 'js/vendor/**/*.*'])
    .pipe(gulp.dest(buildPath + 'js/vendor'));
});

// Build HTML files with reversion
gulp.task('build:html', () => {
  const manifest = gulp.src('./' + 'rev-manifest.json');
  // copy HTML and replace CSS/JS includes after reversion
  return gulp.src([scrPath + '*.html'])
    .pipe(revRewrite({ manifest }))
    // minify html if needed
    // .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(gulp.dest(buildPath));
});

gulp.task('build:html-inline', () => {
  return gulp.src([buildPath + '*.html'])
    .pipe(inlinesource())
    .pipe(replace('url(../', 'url('))
    .pipe(gulp.dest(buildPath));
});

// Copy PHP files
gulp.task('build:php', () => {
  return gulp.src([scrPath + '*.php'])
    .pipe(gulp.dest(buildPath));
});

// Copy and minify IMAGES
gulp.task('build:images', () => {
  // minify and copy IMAGES
  return gulp.src([scrPath + 'img/**/*.*', '!' + scrPath + 'img/svg-to-sprite-monocolor/*.*', '!' + scrPath  +'img/svg-to-sprite-multicolor/*.*', '!' + scrPath + 'img/sprites/*.*'])
  // minify images (low rate)
  // .pipe(imagemin())
    .pipe(gulp.dest(buildPath + 'img'));
});

//Copy SVG sprites
gulp.task('build:sprites', () => {
  return gulp.src([scrPath + 'img/sprites/*.svg'])
    .pipe(gulp.dest(buildPath + 'img/sprites'));
});

// Copy FONTS
gulp.task('build:fonts', () => {
  return gulp.src([scrPath + 'fonts/**/*.*'])
    .pipe(gulp.dest(buildPath + 'fonts'))
});

gulp.task('build', gulp.series('build:clean', 'build:compile', 'build:css', 'build:js', 'build:js-vendor', 'build:fonts', 'build:sprites', 'build:images', 'build:php', 'build:html', 'build:html-inline'));

// Default task
gulp.task('default', gulp.series('pug', 'sass', 'css:split', 'js:bundle', 'js:main', 'svg-sprite-build', gulp.parallel('browser-sync', 'watch')));
