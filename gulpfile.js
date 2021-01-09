const gulp = require("gulp");
const sass = require("gulp-sass");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sync = require("browser-sync").create();
const postcss = require("gulp-postcss");
const csso = require("postcss-csso");
const del = require("del");
const rename = require("gulp-rename");
const svgstore = require("gulp-svgstore");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");

// Styles

const stylesFirst = () => {
    return gulp
      .src("source/scss/style.scss")
      .pipe(plumber())
      .pipe(sourcemap.init())
      .pipe(sass())
      .pipe(postcss([csso()]))
      .pipe(sourcemap.write("."))
      .pipe(rename("style.min.css"))
      .pipe(gulp.dest("build/css"))
      .pipe(sync.stream());
  }
  
exports.stylesFirst = stylesFirst;

const styles = () => {
  return gulp.src("source/scss/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// SVG Sprite

const sprite = () => {
  return gulp.src("source/img/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("svg-sprite.svg"))
    .pipe(gulp.dest("build/img"))
}

exports.sprite = sprite;

// Images
const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.mozjpeg({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"))
}

exports.images = images;

// WebP

const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({quality: 80}))
    .pipe(gulp.dest("build/img/webp"))
}

exports.createWebp = createWebp;

// Copy

const copy = () => {
  return gulp
    .src(
      [
        "source/fonts/*.{woff2,woff}",
        "source/img/**/*.{jpg,png,svg}",
        "source/js/**/*.js",
        "source/*.html"
      ],
      {
        base: "source",
      }
    )
    .pipe(gulp.dest("build"));
};

exports.copy = copy;

// Clean
const clean = () => {
  return del("build");
};

// Server

const server = (done) => {
    sync.init({
      server: {
        baseDir: 'source'
      },
      cors: true,
      notify: false,
      ui: false,
    });
    done();
  }
  
  exports.server = server;
  
  // Watcher
  
  const watcher = () => {
    gulp.watch("source/scss/**/*.scss", gulp.series("styles"));
    gulp.watch("source/*.html").on("change", sync.reload);
  }
  
  const build = gulp.series(clean, gulp.parallel(stylesFirst, copy, images, createWebp), sprite);

  exports.build = build;
  
  exports.default = gulp.series(
    styles, server, watcher
  );