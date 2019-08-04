/* eslint-disable */
const browserify = require('browserify')
const gulp = require('gulp')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const uglify = require('gulp-uglify')
const log = require('gulplog')
const babelify = require('babelify')
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const browserSync = require('browser-sync').create();
const gulpif = require('gulp-if');
const imagemin = require('gulp-imagemin');
const imgCompress  = require('imagemin-jpeg-recompress');
const size = require('gulp-size');
const notify = require('gulp-notify');

sass.compiler = require('node-sass');

// JS CONFIG
function scripts(mode) {

  const isProduction = mode === 'prod'

  const bundleSize = size()

  const bundleConfig = browserify({
    entries: './src/js/main.js',
    debug: true,
  });

  return bundleConfig
    .transform(babelify.configure({
      presets: ["@babel/preset-env"]
    }))
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulpif(isProduction, uglify()))
    .on('error', log.error)
    .pipe(gulpif(isProduction, bundleSize))
    .pipe(gulp.dest('./build'))
    .pipe(browserSync.stream())
    .pipe(gulpif(isProduction, notify({
      onLast: true,
      message: () => `Javascript Bundle size: ${bundleSize.prettySize}`
    })));
}

// SCSS CONFIG
function styles(mode) {

  const isProduction = mode === 'prod'

  const bundleSize = size()

  return gulp.src('./src/scss/style.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulpif(isProduction, cleanCSS({compatibility: 'ie8'}))) //minifyCSS
    .pipe(gulpif(isProduction, bundleSize))
    .pipe(gulp.dest('./build/css'))
    .pipe(browserSync.stream())
    .pipe(gulpif(isProduction, notify({
      onLast: true,
      message: () => `CSS Bundle size: ${bundleSize.prettySize}`
    })));
}

// IMAGES OPTIMIZE
function imagesMinify() {
  return gulp.src('assets/img/**.*')
  .pipe(imagemin([
    imgCompress({
      loops: 4,
      min: 70,
      max: 80,
      quality: 'high'
    }),
    imagemin.gifsicle(),
    imagemin.optipng(),
    imagemin.svgo()
  ]))
  .pipe(gulp.dest('assets/img/'));
}

function build() {
  return gulp.series(() => del(['./build']), gulp.parallel(() => styles('prod'), () => scripts('prod')))
}

function dev() {

  styles('dev')
  scripts('dev')

  browserSync.init({
    server: {
        baseDir: "./"
    }
  });

  gulp.watch('./src/scss/**/*.scss', () => styles('dev'));
  gulp.watch('./src/js/**/*.js', () => scripts('dev'));
  gulp.watch('*.html').on('change', browserSync.reload);
}

// TASKS
exports.build = build()
exports.dev = gulp.series(() => del(['./build']), dev)
exports.imgmin = imagesMinify