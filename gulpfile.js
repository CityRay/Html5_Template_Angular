// @RAY Lin 
// HTML TEMPLATE GULPFILE
// -------------------------------------

// 1. LIBRARIES
// - - - - - - - - - - - - - - -

var $        = require('gulp-load-plugins')();
var argv     = require('yargs').argv;
var gulp     = require('gulp');
var rimraf   = require('rimraf');
var router   = require('front-router');
var sequence = require('run-sequence');
var pngquant = require('imagemin-pngquant');

// Check for --production flag
var isProduction = !!(argv.production);

// 2. FILE PATHS
// - - - - - - - - - - - - - - -
var paths = require('./config.js');


// 3. TASKS
// - - - - - - - - - - - - - - -

// Cleans the build directory
gulp.task('clean', function(cb) {
  rimraf('./build', cb);
});

// Copies everything in the client folder except templates, Sass, and JS
gulp.task('copy', function() {
  return gulp.src(paths.assets, {
    base: './client/'
  })
    .pipe(gulp.dest('./build'));
});

// Copies your source to the SERVER PROJECT FOLDER
gulp.task('copy:toserver', function() {
  return gulp.src('./build/assets/css/app.css')
    .pipe(gulp.dest('../../WorkSpace/GuguStore/SourceCode/Main/UI/GuguStore Web/fonts/'));
});

// Copies your app's page templates and generates URLs for them
gulp.task('copy:templates', function() {
  return gulp.src('./client/templates/**/*.html')
    .pipe(router({
      path: 'build/assets/js/routes.js',
      root: 'client'
    }))
    .pipe(gulp.dest('./build/templates'));
});

// Compiles the Foundation for Apps directive partials into a single JavaScript file
gulp.task('copy:source', function(cb) {
  gulp.src('bower_components/foundation-apps/js/angular/components/**/*.html')
    .pipe($.ngHtml2js({
      prefix: 'components/',
      moduleName: 'foundation',
      declareModule: false
    }))
    .pipe($.uglify())
    .pipe($.concat('templates.js'))
    .pipe(gulp.dest('./build/assets/js'));

  // Iconic SVG icons
  gulp.src('./bower_components/foundation-apps/iconic/**/*')
    .pipe(gulp.dest('./build/assets/images/iconic/'));

  // Font-Awesome
  gulp.src('./bower_components/font-awesome/fonts/**/*')
    .pipe(gulp.dest('./build/assets/fonts/'));

  //Vendor
  gulp.src(paths.vendor)
    .pipe(gulp.dest('./build/assets/js/vendor/'));

  //Mini Image
  gulp.src('./client/assets/images/**/*.{png,jpg,gif,ico}', {base: './client/assets/images/'})
    .pipe($.imagemin({
        optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
        progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
        interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    }))
    .pipe(gulp.dest('./build/assets/images/'));

  cb();
});

// Compiles Sass
// gulp.task('sass', function () {
//   return gulp.src('client/assets/scss/app.scss')
//     .pipe($.sass({
//       includePaths: paths.sass,
//       outputStyle: (isProduction ? 'compressed' : 'nested'),
//       errLogToConsole: true
//     }))
//     .pipe($.autoprefixer({
//       browsers: ['last 2 versions', 'ie 10']
//     }))
//     .pipe(gulp.dest('./build/assets/css/'))
//   ;
// });
gulp.task('sass', function () {
  return gulp.src('client/assets/scss/app.scss')
    .pipe($.compass({
      config_file: 'config.rb',
      sourcemap: true,
      debug: false,
      comments: false,
      time: true,
      css: './build/assets/css',
      sass: './client/assets/scss',
      image: './client/assets/images',
      style: 'compact', //nested, expanded, compact, compressed
      import_path: paths.sass
    }))
    .on("error", $.notify.onError(function (error) {
      return "Error: " + error.message;
     })) 
    .pipe(gulp.dest('./build/assets/css/'))
    .pipe($.notify({ message: 'SASS Task Complete' }));

});

gulp.task('sass:production', function () {
  return gulp.src('client/assets/scss/app.scss')
    .pipe($.compass({
      config_file: 'config.rb',
      sourcemap: true,
      debug: false,
      comments: false,
      time: true,
      css: './build/assets/css',
      sass: './client/assets/scss',
      image: './client/assets/images',
      style: 'compact', //nested, expanded, compact, compressed
      import_path: paths.sass
    }))
    .on("error", $.notify.onError(function (error) {
      return "Error: " + error.message;
     }))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie 10']
    }))
    .pipe(gulp.dest('./build/assets/css/'))
    .pipe($.notify({ message: 'SASS & Autoprefixer Task Complete' }));

});

// Compiles and copies the Foundation for Apps JavaScript, as well as your app's custom JS
gulp.task('uglify', ['uglify:foundation', 'uglify:app'])

gulp.task('uglify:foundation', function(cb) {
  var uglify = $.if(isProduction, $.uglify()
    .on('error', function (e) {
      console.log(e);
    }));

  return gulp.src(paths.foundationJS)
    .pipe(uglify)
    .pipe($.concat('foundation.js'))
    .pipe(gulp.dest('./build/assets/js/'));
});

gulp.task('uglify:app', function() {
  var uglify = $.if(isProduction, $.uglify()
    .on('error', function (e) {
      console.log(e);
    }));

  return gulp.src(paths.appJS)
    .pipe(uglify)
    .pipe($.concat('app.js'))
    .pipe(gulp.dest('./build/assets/js/'));
});

// Starts a test server, which you can view at http://localhost:8079
gulp.task('server', ['build'], function() {
  gulp.src('./build')
    .pipe($.webserver({
      port: 8079,
      host: 'localhost',
      fallback: 'index.html',
      livereload: true,
      open: true
    }));
});

// Builds your entire app once, without starting a server
gulp.task('build', function(cb) {
  sequence('clean', ['copy', 'copy:source', 'sass', 'uglify'], 'copy:templates', cb);
});

// Default task: builds your app, starts a server, and recompiles assets when they change
gulp.task('default', ['server'], function () {
  // Watch Sass
  gulp.watch(['./client/assets/scss/**/*', './scss/**/*'], ['sass']);

  // Watch JavaScript
  gulp.watch(['./client/assets/js/**/*', './js/**/*'], ['uglify:app']);

  // Watch static files
  gulp.watch(['./client/**/*.*', '!./client/templates/**/*.*', '!./client/assets/{scss,js}/**/*.*'], ['copy']);

  // Watch app templates
  gulp.watch(['./client/templates/**/*.html'], ['copy:templates']);
});
