const del         = require('del');
const gulp        = require('gulp');
const babel       = require('gulp-babel');
const webpack     = require('webpack-stream');
const runSequence = require('run-sequence');

const webPackCFG = require('./webpack.config.js');

gulp.task('babelify', () => {
	return gulp.src('src/**/*.js')
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('bundle', (done) => {
	// return gulp.src('src/**/*.js')
	//   .pipe(webpack(webPackCFG))
	//   .pipe(gulp.dest('dist'));
	webpack(webPackCFG, (err, st) => {
		// if (err) {
		//     console.log('ERRRRRR')
		//     console.log(typeof err, err)
		//     // throw 'aaaaarrrrrrrrgggggggggg'
		// }

		console.log('SXS!')
		console.log(st)
		done()
	})
});

gulp.task('clean', () => {
	return del(['./dist']);
});

gulp.task('build', (done) => {
	runSequence('clean', 'bundle', done);
});