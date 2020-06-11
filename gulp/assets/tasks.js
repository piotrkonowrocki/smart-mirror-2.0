'use strict';

const fs = require('fs');
const gulp = require('gulp');
const watch = require('gulp-watch');
const plugins = require('gulp-load-plugins')();
const del = require('del');
const chalk = require('chalk');

const pckg = require('../../package.json');
const config = require('./config.json');
const Log = require('./log');
const Timer = require('./timer');
const Paths = require('./paths');
const WebpackHandler = require('./webpack-handler');

const log = new Log();
const timer = new Timer();
const paths = new Paths();
const webpackHandler = new WebpackHandler();

module.exports = class Tasks {
    handleSass() {
        timer.register('handleSass');

        return new Promise(resolve => {
            gulp.src(paths.getPath('stylesSource') + config.files.stylesSource)
                .pipe(plugins.if(this.mode !== 'fast', plugins.sourcemaps.init()))
                .pipe(plugins.sass({
                    includePaths: ['node_modules']
                }))
                .pipe(plugins.if(this.mode !== 'fast', plugins.autoprefixer({
                    cascade: false,
                    remove: true,
                    overrideBrowserslist: ['last 2 version', 'ie >= 11']
                })))
                .pipe(plugins.if(this.mode === 'production', plugins.cleanCss()))
                .pipe(plugins.rename(config.files.stylesResults))
                .pipe(plugins.if(this.mode !== 'fast', plugins.sourcemaps.write('./')))
                .pipe(gulp.dest(paths.getPath('stylesTemp')))
                .on('end', () => {
                    log.print(`✔ Finished building css in ${timer.get('handleSass')}`);
                    resolve();
                });
        });
    }

    handleJs() {
        timer.register('handleJs');

        return new Promise(resolve => {
            webpackHandler.handleJs(this.mode)
                .then(() => {
                    log.print(`✔ Finished building js in ${timer.get('handleJs')}`);
                    resolve();
                });
        });
    }

    handleTwig() {
        timer.register('handleTwig');

        return new Promise(resolve => {
            fs.readFile(paths.getPath('templatesSource') + config.files.twigGlobals, (err, contents) => {
                gulp.src(`${paths.getPath('templatesSource')}*.twig`)
                    .pipe(plugins.twig({data: JSON.parse(contents)}))
                    .pipe(gulp.dest(paths.getPath('templatesTemp')))
                    .on('end', () => {
                        log.print(`✔ Finished building html in ${timer.get('handleTwig')}`);
                        resolve();
                    });
            });
        });
    }

    handleHtml() {
        timer.register('handleHtml');

        return new Promise(resolve => {
            gulp.src(`${paths.getPath('templatesTemp')}*.html`)
                .pipe(plugins.inject(
                    gulp.src([
                        paths.getPath('stylesTemp') + config.files.stylesResults,
                        paths.getPath('scriptsTemp') + config.files.scriptsResults
                    ], {read: false, allowEmpty: true}), {relative: true, quiet: true}
                ))
                .pipe(plugins.if(this.mode === 'production', plugins.htmlmin({
                    collapseWhitespace: true, removeComments: true
                })))
                .pipe(gulp.dest(paths.getPath('templatesTemp')))
                .on('end', () => {
                    log.print(`✔ Finished injecting static files in ${timer.get('handleHtml')}`);
                    resolve();
                });
        });
    }

    handleImages() {
        timer.register('handleImages');

        return new Promise(resolve => {
            gulp.src(`${paths.getPath('imagesSource')}**/*`)
                .pipe(plugins.newer(paths.getPath('imagesTemp')))
                .pipe(plugins.if(this.mode === 'production', plugins.imagemin(
                    [
                        plugins.imagemin.gifsicle(),
                        plugins.imagemin.mozjpeg(),
                        require('imagemin-pngquant')(),
                        plugins.imagemin.svgo()
                    ],
                    {
                        progressive: true,
                        interlaced: true
                    }
                )))
                .pipe(gulp.dest(paths.getPath('imagesTemp')))
                .on('end', () => {
                    log.print(`✔ Finished moving images in ${timer.get('handleImages')}`);
                    resolve();
                });
        });
    }

    handleStaticDirectories(singleDirectory) {
        timer.register('handleStaticDirectories');

        return new Promise(resolve => {
            const directories = singleDirectory ? [singleDirectory] : config.dirs.static;
            let handledDirectories = 0;

            directories.forEach(item => {
                gulp.src(`${paths.getPath('sources')}${item}**/*`)
                    .pipe(gulp.dest(paths.getPath('temp') + item))
                    .on('end', () => {
                        handledDirectories++;
                        if (handledDirectories >= directories.length) {
                            log.print(`✔ Finished moving static directories in ${timer.get('handleStaticDirectories')}`);
                            resolve();
                        }
                    });
            });
        });
    }

    cleanTemp() {
        return new Promise(resolve => {
            del([
                paths.getPath('temp')
            ], {force: true}).then(() => resolve());
        });
    }

    cleanPublic() {
        return new Promise(resolve => {
            const staticDirectories = config.dirs.static.map(item => paths.getPath('public') + item);

            del([
                paths.getPath('stylesResult'),
                paths.getPath('scriptsResult'),
                paths.getPath('imagesResult'),
                paths.getPath('templatesResult') + (config.dirs.html.length ? '' : '*.html')
            ].concat(staticDirectories), {force: true}).then(() => resolve());
        });
    }

    cleanChunks() {
        return new Promise(resolve => {
            del([
                `${paths.getPath('scriptsTemp')}*chunk*`,
                `${paths.getPath('scriptsResult')}*chunk*`
            ], {force: true}).then(() => resolve());
        });
    }

    publish(dir = '**/', mask = '**') {
        return new Promise(resolve => {
            gulp.src(paths.getPath('temp') + dir + mask)
                .pipe(gulp.dest(paths.getPath('public')))
                .on('end', resolve);
        });
    }

    watch() {
        watch(`${paths.getPath('stylesSource')}**/**`, () => {
            this.handleSass()
                .then(this.publish.bind(this, config.dirs.css.replace('/', '*/')));
        });
        watch(`${paths.getPath('scriptsSource')}**/**`, () => {
            this.cleanChunks()
                .then(this.cleanChunks.bind(this))
                .then(this.handleJs.bind(this))
                .then(this.publish.bind(this, config.dirs.js.replace('/', '*/')));
        });
        watch(`${paths.getPath('templatesSource')}**/**`, () => {
            this.handleTwig()
                .then(this.handleHtml.bind(this))
                .then(this.publish.bind(this, config.dirs.html.replace('/', '*/')));
        });
        watch(`${paths.getPath('imagesSource')}**/**`, () => {
            this.handleImages()
                .then(this.publish.bind(this, config.dirs.img.replace('/', '*/')));
        });
        config.dirs.static.forEach(item => {
            watch(`${paths.getPath('sources')}${item}**/*`, () => {
                this.handleStaticDirectories(item)
                    .then(this.publish.bind(this, item.replace('/', '*/')));
            });
        });
    }

    build() {
        return new Promise(resolve => {
            this.cleanTemp()
                .then(this.handleSass.bind(this))
                .then(this.handleJs.bind(this))
                .then(this.handleTwig.bind(this))
                .then(this.handleHtml.bind(this))
                .then(this.handleImages.bind(this))
                .then(this.handleStaticDirectories.bind(this))
                .then(this.cleanPublic.bind(this))
                .then(this.publish.bind(this))
                .then(resolve);
        });
    }

    buildProduction() {
        this.mode = 'production';

        return new Promise(resolve => {
            this.build()
                .then(this.cleanTemp.bind(this))
                .then(() => {
                    log.print('✔ Production build finished');
                    resolve();
                });
        });
    }

    buildDev() {
        this.mode = 'dev';

        return new Promise(resolve => {
            this.build()
                .then(this.watch.bind(this))
                .then(() => {
                    log.print('✔ Development build finished');
                    log.print('Starting file watcher...');
                    resolve();
                });
        });
    }

    buildFast() {
        this.mode = 'fast';

        return new Promise(resolve => {
            this.build()
                .then(this.watch.bind(this))
                .then(() => {
                    log.print('✔ Fast development build finished');
                    log.print('This build doesn\' provide maps, autoprefixing or any form of assistance or feedback.');
                    log.print('Starting file watcher...');
                    resolve();
                });
        });
    }

    about() {
        /* eslint-disable no-console */
        /* eslint-disable prefer-template */
        /* eslint-disable max-len */
        return new Promise(resolve => {
            console.log('');
            console.log('    \\\\');
            console.log('   <*l   ' + chalk.bold('llama boilerplate') + ' v' + pckg.version);
            console.log('    ll   by Piotr Konowrocki');
            console.log('^lllll');
            console.log(' || ||');
            console.log(' \'\' \'\'');
            console.log('');
            console.log(chalk.bold('Available tasks:'));
            console.log(chalk.inverse('build:production') + ' - cleans enviroment, builds and compresses whole projects');
            console.log(chalk.inverse('build:dev') + ' - builds projects and runs files watcher.');
            console.log(chalk.inverse('build:fast') + ' - builds projects and runs files watcher with fastest possible settins - no maps, no feedback and assistance.');
            console.log('');
            resolve();
        });
        /* eslint-enable */
    }
};
