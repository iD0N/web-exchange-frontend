const gulp = require('gulp');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');

gulp.task('minify', () =>
  gulp
    .src('public/chartiq/*')
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('build/static/js/'))
);
