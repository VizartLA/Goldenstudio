process.env.BROWSERSYNC_CACHE = 'no';

const { src, dest, watch, parallel, series } = require('gulp');
const sass = require('sass');
const gulpSass = require('gulp-sass')(sass);
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const mozjpeg = require('imagemin-mozjpeg');
const optipng = require('imagemin-optipng');
const svgo = require('imagemin-svgo');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const include = require('gulp-include');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const svgSprite = require('gulp-svg-sprite');

// Пути для удобного управления
const paths = {
  styles: {
    src: 'app/scss/style.scss',
    watch: 'app/scss/**/*.scss',
    dest: 'app/css'
  },
  scripts: {
    src: ['node_modules/swiper/swiper-bundle.js', 'app/js/main.js'],
    watch: ['app/js/**/*.js', '!app/js/**/*.min.js'],
    dest: 'app/js'
  },
  images: {
    src: ['app/images/src/**/*.*', '!app/images/src/**/*.svg'],
    dest: 'app/images'
  },
  fonts: {
    src: 'app/fonts/src/*.*',
    dest: 'app/fonts'
  },
  pages: {
    src: 'app/pages/*.html',
    components: 'app/components'
  }
};

// Обработка SCSS
function styles() {
  return src(paths.styles.src)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(gulpSass({ 
      outputStyle: 'compressed',
      includePaths: ['app/scss'],
      quietDeps: true
    }).on('error', gulpSass.logError))
    .pipe(autoprefixer({ 
      overrideBrowserslist: ['last 4 versions'],
      cascade: false
    }))
    .pipe(concat('style.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

// Обработка JS
function scripts() {
  return src(paths.scripts.src)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

// Оптимизация изображений
function images() {
  return src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(avif({ quality: 50 }))
    .pipe(dest(paths.images.dest))
    .pipe(src(paths.images.src))
    .pipe(newer(paths.images.dest))
    .pipe(webp())
    .pipe(dest(paths.images.dest));
}

// Создание SVG-спрайта
function sprite() {
  return src('app/images/**/*.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg',
          example: true
        }
      }
    }))
    .pipe(dest('app/images'));
}

// Конвертация шрифтов
function fonts() {
  return src(paths.fonts.src)
    .pipe(fonter({ formats: ['woff', 'ttf'] }))
    .pipe(src('app/fonts/*.ttf'))
    .pipe(ttf2woff2())
    .pipe(dest(paths.fonts.dest));
}

// Сборка HTML из компонентов
function pages() {
  return src(paths.pages.src)
    .pipe(include({ includePaths: paths.pages.components }))
    .pipe(dest('app'))
    .pipe(browserSync.stream());
}

// Очистка папки dist
function cleanDist() {
  return src('dist', { allowEmpty: true, read: false })
    .pipe(clean());
}

// Копирование файлов в dist
function building() {
  return src([
    'app/css/style.min.css',
    'app/images/*.*',
    '!app/images/*.svg',
    'app/images/sprite.svg',
    'app/fonts/*.*',
    'app/js/main.min.js',
    'app/**/*.html'
  ], { base: 'app' })
    .pipe(dest('dist'));
}

// Запуск сервера
function serve() {
  return new Promise((resolve) => {
    browserSync.init({
      server: { 
        baseDir: "app/",
        serveStaticOptions: {
          extensions: ['html']
        }
      },
      notify: false,
      open: true,
      port: 3000,
      ui: false,
      reloadDebounce: 2000,
      injectChanges: false,
      files: [
        'app/css/**/*.css',
        'app/js/**/*.js',
        'app/**/*.html'
      ],
      middleware: (req, res, next) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        next();
      }
    });
    resolve();
  });
}

// Отслеживание изменений
function watching() {
  const watchOptions = {
    delay: 1000,
    ignoreInitial: true
  };

  watch(paths.styles.watch, watchOptions, series(styles, (done) => {
    setTimeout(() => {
      browserSync.reload('*.css');
      done();
    }, 500);
  }));

  watch(paths.scripts.watch, watchOptions, series(scripts, (done) => {
    setTimeout(() => {
      browserSync.reload();
      done();
    }, 500);
  }));

  watch(paths.images.src, watchOptions, series(images, (done) => {
    setTimeout(() => {
      browserSync.reload();
      done();
    }, 500);
  }));

  watch([paths.pages.components + '/*', paths.pages.src], watchOptions, series(pages, (done) => {
    setTimeout(() => {
      browserSync.reload();
      done();
    }, 500);
  }));

  watch('app/*.html', watchOptions).on('change', () => {
    setTimeout(() => browserSync.reload(), 500);
  });
}

// Экспорт задач
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.fonts = fonts;
exports.pages = pages;
exports.sprite = sprite;
exports.clean = cleanDist;
exports.build = series(cleanDist, building);
exports.default = series(
  parallel(styles, scripts, images, fonts, pages),
  serve,
  watching
);