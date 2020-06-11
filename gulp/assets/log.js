'use strict';

const chalk = require('chalk');
const plugins = require('gulp-load-plugins')();

module.exports = class Log {
    constructor() {
        if (Log.singletonInstance) return Log.singletonInstance;
        Log.singletonInstance = this;
    }

    error(message) {
        this.print(chalk.red(message));
    }

    print(message) {
        plugins.util.log(message);
    }
};
