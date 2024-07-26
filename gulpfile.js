const gulp = require('gulp');
var replace = require('gulp-replace');
var sass = require('gulp-sass')(require('node-sass'));
var data = require('gulp-data');
var fs = require('fs');
var browserSync = require('browser-sync').create();
var gutil = require('gulp-util');
var inject = require('gulp-inject-string');
var include = require('gulp-include');
var sourcemaps = require('gulp-sourcemaps');
var autoprefix = require('gulp-autoprefixer');

// hbs
var handlebarss = require('handlebars');
var handlebars = require('gulp-compile-handlebars');
var helpers = require('handlebars-helpers')({
  handlebarss: handlebars
});

/* css */
var cssnano = require('gulp-cssnano');
var rename = require('gulp-rename');
// var uglify = require('gulp-uglify');
let uglify = require('gulp-uglify-es').default;

let paths_kgonetap = {
  root: ['./dist/'],
  root_asset: './dist/asset/',
  root_bundle: './dist/asset/',
  src_sass: ['./src/sass/**/*.scss'],
  src_json: './json/data.json',
  src_partials: ['./src/templates','./src/templates/partials'],
  src_hbs: './src/templates/**/*.handlebars',
  src_hbs_watch: ['./src/templates/*.handlebars','./src/templates/partials/*.hbs'],
  src_js: './dist/asset/js/*.js',
  src_js_watch: './dist/asset/js/*.js',
  dest_hbs: './dist/',
  dest_sass: './dist/asset/css',
  dest_js: './dist/asset/js',
}


// project active
var paths = paths_kgonetap;

// asset directory 
var unmincss = [paths.root_asset+'/css/*.css', '!'+paths.root_asset+'/css/*.min.css'];
var unminjs = [paths.root_asset+'/js/*.js', '!'+paths.root_asset+'/js/*.min.js'];

function minscript() {
  return gulp.src(unminjs)
    .pipe(uglify())
    .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
    .pipe(rename({
      suffix: ".min"
    }))
    //.pipe(gulp.dest(paths.root+'/asset/js'));
    .pipe(gulp.dest(paths.root_bundle+'/js'));

}

function minstyle() {
  return gulp.src(unmincss)
    .pipe(cssnano({
      zindex: false, //for zindex on different page
      reduceIdents: {
        keyframes: false //for animation
      },
      discardUnused: {
        keyframes: false, //for unused/old keyframe
      },
      svgo: false, //for minified svg
      autoprefixer: {
        remove: false, //for unused/old autoprefixer esc. -webkit-box-orient
        browsers: ['last 2 versions']
      }
    }))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(gulp.dest(paths.root_bundle+'/css'));

}

function runstyle() {
  return gulp.src(paths.src_sass) // Gets all files ending with .scss in app/scss and children dirs
    // .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefix({
      cascade: false,
      remove: false, //for unused/old autoprefixer esc. -webkit-box-orient
        //browsers: ['last 2 versions']
    }))
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.dest_sass))
	  .pipe(browserSync.reload({
      stream: true
    }));
    //done();
}

function runServer() {
  browserSync.init({
  	ghostMode: false,
  	open: false,
    server: {
      baseDir: paths.root
    }
  });
  // done();
}

function runHandlebars() {
  var templateData = {
    author: 'kompascom'
  },
  options = {
      ignorePartials: true, //ignores the unknown footer2 partial in the handlebars template, defaults to false 
      batch : paths.src_partials,
  }

  return gulp.src(paths.src_hbs)
    // .pipe(data(function(file) {
    //   return JSON.parse(
    //   fs.readFileSync(paths.src_json)
    //   );
    // }))
      .pipe(handlebars(templateData, options))
      .pipe(rename(function(path) {
      path.extname = '.html';
    }))
    .pipe(gulp.dest(paths.dest_hbs))
    .pipe(browserSync.reload({
      stream: true
    }));
    // done();
}

// main task
gulp.task('minify', gulp.parallel(minstyle, minscript));

gulp.task('host', gulp.parallel(runServer));

gulp.task('watch', function () {
  gulp.watch(paths.src_hbs_watch, gulp.series(runHandlebars));
  gulp.watch(paths.src_sass, gulp.series(runstyle));
});

gulp.task('full', gulp.series(runServer, runHandlebars, runstyle, 'watch'));

gulp.task('default', () => {
  runHandlebars()
  runstyle()

  browserSync.init({
  	ghostMode: false,
  	open: false,
    server: {
      baseDir: paths.root
    }
  });
  
  gulp.watch(paths.src_hbs_watch, gulp.series(runHandlebars));
  gulp.watch(paths.src_sass, gulp.series(runstyle));
});
