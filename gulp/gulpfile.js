'use strict';

const gulp = require('gulp');
const Tasks = require('./assets/tasks');

const tasks = new Tasks();

gulp.task('default', () => tasks.about());
gulp.task('build:production', () => tasks.buildProduction());
gulp.task('build:dev', () => tasks.buildDev());
gulp.task('build:fast', () => tasks.buildFast());
