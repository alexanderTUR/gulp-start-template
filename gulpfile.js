const gulp = require('gulp');
const pug = require('gulp-pug');
const prettyHtml = require('gulp-pretty-html');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const sortCSSmq = require('sort-css-media-queries');
const cssnano = require('cssnano');
const flexFix = require('postcss-flexbugs-fixes');
const pxtorem = require('postcss-pxtorem');
const sourcemaps = require('gulp-sourcemaps');
const smoothScroll = require('postcss-momentum-scrolling');
const doiuse = require('doiuse');
const postcssWillChange = require('postcss-will-change');
const postcssAspectRatio = require('postcss-aspect-ratio');
const cssDeclarationSorter = require('css-declaration-sorter');
const notify = require('gulp-notify');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const imageminTiny = require('gulp-tinypng');
const rename = require('gulp-rename');
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const del = require('del');
const rev = require('gulp-rev');
const revRewrite = require('gulp-rev-rewrite');
const browserSync = require('browser-sync').create();

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
                    message: err.msg + ' on file ' + err.filename + ' on line ' + err.line
                }
            }))
        )
        .pipe(prettyHtml({
            indent_size: 4,
            unformatted: ['abbr', 'area', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i', 'ins', 'kbd', 'keygen', 'map', 'mark', 'math', 'meter', 'noscript', 'object', 'output', 'progress', 'q', 'ruby', 's', 'samp', 'small', 'strong', 'sub', 'sup', 'template', 'time', 'u', 'var', 'wbr', 'text', 'acronym', 'address', 'big', 'dt', 'ins', 'strike', 'tt']
        }))
        .pipe(gulp.dest(scrPath))
        .pipe(browserSync.stream());
});

// SASS task
gulp.task('sass', () => {
    const processors = [
        // insert 3D hack before will-change property
        postcssWillChange(),
        // fix some flex-box issues
        flexFix(),
        // replace px to rem in all fonts rules
        pxtorem(),
        // add -webkit-overflow-scrolling: touch to all styles with overflow: scroll for smooth scroll on iOS
        smoothScroll(),
        // fix an element's dimensions to an aspect ratio.
        postcssAspectRatio(),
        // sort css rules in 'concentric-css' order
        cssDeclarationSorter({order: 'concentric-css'}),
        // add vendor prefixes
        autoprefixer()
    ];
    return gulp.src(scrPath+'sass/**/*.scss')
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
        .pipe(gulp.dest(scrPath+'css'))
        .pipe(browserSync.stream());
});

// Js task
gulp.task('js', () => {
    return gulp.src([
        //  - uncomment what you need
        //  - SVG-sprites fallback for IE
        scrPath+'js/libs/svg4everybody_2.1.9/svg4everybody.js',
        //  - GSAP
        // scrPath+'js/libs/gsap_2.0.2/TweenMax.js',
        //  - ScrollMagic
        // scrPath+'js/libs/scrollmagic_2.0.6/ScrollMagic.js',
        // scrPath+'js/libs/scrollmagic_2.0.6/jquery.ScrollMagic.js',
        // scrPath+'js/libs/scrollmagic_2.0.6/animation.gsap.js',
        // scrPath+'js/libs/scrollmagic_2.0.6/debug.addIndicators.js',
        //  - Slick slider
        // scrPath+'js/libs/slick_1.9.0/slick.js',
        //  - Scroll to ID plugin
        // scrPath+'js/libs/scrolltoid_1.5.9/jquery.malihu.PageScroll2id.js',
        scrPath+'js/common.js' // always the last
    ])
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('/'))
        .pipe(gulp.dest(scrPath+'js'))
        .pipe(browserSync.stream());
});

// SVG mono-color sprite task
gulp.task('svg-sprite:mono', () => {
    return gulp.src(scrPath+'img/svg-to-sprite-monocolor/*.svg')
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
                            dest: '../../sass/global/generated/_sprite_generated_monocolor.scss',
                            template: scrPath+'sass/settings/_sprite_template_monocolor.scss'
                        }
                    }
                }
            }
        }))
        .pipe(gulp.dest(scrPath+'img'))
});

// SVG multi-color sprite task
gulp.task('svg-sprite:multi', () => {
    return gulp.src(scrPath+'img/svg-to-sprite-multicolor/*.svg')
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
                            dest: '../../sass/global/generated/_sprite_generated_multicolor.scss',
                            template: scrPath+'sass/settings/_sprite_template_multicolor.scss'
                        }
                    }
                }
            }
        }))
        .pipe(gulp.dest(scrPath+'img'))
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
                match: [scrPath+'img/**'],
                fn: function (event, file) {
                    this.reload()
                }
            }
        ],
        // notify: false,
        open: false,
        browser: 'google chrome'
    });
});

// Watch task
gulp.task('watch', () => {
    gulp.watch(scrPath+'pug/**/*.*', gulp.series('pug'));
    gulp.watch(scrPath+'sass/**/*.*', gulp.series('sass'));
    gulp.watch([scrPath+'js/common.js', scrPath+'js/libs/*.*'], gulp.series('js'));
    gulp.watch([scrPath+'img/svg-to-sprite-monocolor/*.svg', scrPath+'img/svg-to-sprite-multicolor/*.svg'], gulp.series('svg-sprite-build'));
});

// Compile all files before copy to build dir
gulp.task('build:compile', gulp.series('svg-sprite-build', 'pug', 'sass', 'js'));

// Clean build dir before copy all files
gulp.task('build:clean', (done) => {
    del.sync([buildPath, 'rev-manifest.json']);
    done();
});

// Build CSS files with reversion
gulp.task('build:css', () => {
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
            // ignore: ['flexbox', 'text-size-adjust', 'css-appearance', 'outline', 'intrinsic-width', 'transforms3d', 'will-change', 'css-filters']
        }),
        // minify css
        cssnano()
    ];

    // minify, analise and copy CSS
    return gulp.src([scrPath+'css/*.css'])
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
    return gulp.src([scrPath+'js/**/*.js', '!'+scrPath+'js/libs/**/*.*', '!'+scrPath+'js/vendor/**/*.*', '!'+scrPath+'js/common.js'])
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest(buildPath+'js'))
        .pipe(rev.manifest('./' + 'rev-manifest.json', {
            base: './',
            merge: true // merge with the existing manifest (if one exists)
        }))
        .pipe(gulp.dest('./'));
});

//Copy vendor JS files
gulp.task('build:js-vendor', () => {
    return gulp.src([scrPath+'js/vendor/**/*.*'])
        .pipe(gulp.dest(buildPath+'js/vendor'));
});

// Build HTML files with reversion
gulp.task('build:html', () => {
    const manifest = gulp.src('./' + 'rev-manifest.json');
    // copy HTML and replace CSS/JS includes after reversion
    return gulp.src([scrPath+'*.html'])
        .pipe(revRewrite({ manifest }))
        // minify html if needed
        // .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
        .pipe(gulp.dest(buildPath));
});

// Copy PHP files
gulp.task('build:php', () => {
    return gulp.src([scrPath+'*.php'])
        .pipe(gulp.dest(buildPath));
});

// Copy and minify IMAGES
gulp.task('build:images', () => {
    // minify and copy IMAGES
    return gulp.src([scrPath + 'img/**/*.*', '!'+scrPath+'img/svg-to-sprite-monocolor/*.*', '!'+scrPath+'img/svg-to-sprite-multicolor/*.*', '!'+scrPath+'img/sprites/*.*'])
        // minify images (low rate)
        .pipe(imagemin())
        // minify images with tinypng API (high rate), limited 500 images per month (use your own API_KEY)
        // .pipe(imageminTiny('1nsRMC7PPcKVYff5dn8vvkzsp06hqmZ2'))
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

gulp.task('build', gulp.series('build:clean', 'build:compile', 'build:css', 'build:js', 'build:js-vendor', 'build:fonts', 'build:sprites', 'build:images', 'build:php', 'build:html'));

// Default task
gulp.task('default', gulp.series('pug', 'sass', 'js', 'svg-sprite-build', gulp.parallel('browser-sync', 'watch')));