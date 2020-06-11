'use strict';

const path = require('path');

const config = require('./config.json');
const Log = require('./log');

const log = new Log();

module.exports = class Paths {
    constructor() {
        if (Paths.singletonInstance) return Paths.singletonInstance;
        Paths.singletonInstance = this;

        this.root = `${path.resolve(process.cwd(), config.paths.root)}/`.replace(/\\/gu, '/');
        this.paths = {
            root: this.root,
            sources: this.root + config.paths.sources,
            stylesSource: this.root + config.paths.sources + config.dirs.sass,
            stylesTemp: this.root + config.paths.sources + config.paths.temp + config.dirs.css,
            stylesResult: this.root + config.paths.results + config.dirs.css,
            scriptsSource: this.root + config.paths.sources + config.dirs.js,
            scriptsTemp: this.root + config.paths.sources + config.paths.temp + config.dirs.js,
            scriptsResult: this.root + config.paths.results + config.dirs.js,
            imagesSource: this.root + config.paths.sources + config.dirs.img,
            imagesTemp: this.root + config.paths.sources + config.paths.temp + config.dirs.img,
            imagesResult: this.root + config.paths.results + config.dirs.img,
            templatesSource: this.root + config.paths.sources + config.dirs.twig,
            templatesTemp: this.root + config.paths.sources + config.paths.temp + config.dirs.html,
            templatesResult: this.root + config.paths.results + config.dirs.html,
            temp: this.root + config.paths.sources + config.paths.temp,
            public: this.root + config.paths.results
        };
    }

    getPath(requestedPath) {
        if (!this.paths[requestedPath]) log.error(`Path "${requestedPath}" does not exist, build will probably won't work`);

        return this.paths[requestedPath];
    }
};
