const gulp = require('gulp');
const shell = require('gulp-shell');
const connect = require('gulp-connect');

gulp.task('server', () => {
  connect.server({
    root: './dist',
    livereload: true,
    port: 8030,
  });
});

gulp.task('reload', () => {
  return gulp.src('./dist/**').pipe(connect.reload());
});

gulp.task('dev', shell.task(['npm run dev']));

gulp.task('watch', () => {
  gulp.watch(['./src/**/*'], gulp.series('dev', 'reload'));
});

gulp.task('startServer', gulp.series('dev', 'server'));
gulp.task('default', gulp.parallel('startServer', 'watch'));
