'use strict';

const Log = require('./log');

const log = new Log();

module.exports = class Timer {
    constructor() {
        if (Timer.singletonInstance) return Timer.singletonInstance;
        Timer.singletonInstance = this;

        this.counters = [];
    }

    register(id) {
        this.counters[id] = new Date().getTime();
    }

    get(id) {
        if (this.counters[id]) return `${((new Date().getTime() - this.counters[id]) / 1000).toFixed(2)}s`;
        else {
            log.error(`Timer "${id}" does not exist.`);

            return '?';
        }
    }
};
