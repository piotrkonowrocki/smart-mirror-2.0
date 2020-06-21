import deepExtend from 'deep-extend';
import schedule from 'node-schedule';
import queryString from 'query-string';
import twigHandler from '../base/twig-handler';
import xml2jsonHandler from '../base/xml2json-handler';

class WidgetPrototype {
    constructor(globals, name, settings, params) {
        this.globals = globals;
        this.name = name;
        this.settings = settings;
        this.params = deepExtend({
            loop: [
                ['*/30 * * * *']
            ]
        }, params);

        this.init();
    }

    async init() {
        this.renderWrapper();
        if (this.params.credentials) await this.loadCredentials();
        if (this.params.url || this.params.rss) await this.loadData();
        this.parseData();
        await this.renderContent();
        this.prepareVars();
        this.run();
        this.loop();
    }

    async refresh() {
        if (this.params.url || this.params.rss) await this.loadData();
        this.parseData();
        await this.renderContent();
        this.prepareVars();
        this.run();
    }

    prepareVars() {
        // extend purposes only
    }

    renderWrapper() {
        const region = document.querySelector(`.region.region--${this.settings.region[0]}.region--${this.settings.region[1]}`);

        this.widgetWrapper = document.createElement('div');
        this.widgetWrapper.classList.add('widget', `widget-${this.name}`);
        region.appendChild(this.widgetWrapper);
    }

    async loadCredentials() {
        let credentials = await fetch(`/widgets/default/${this.name}/credentials.json`);

        credentials = await credentials.json();
        this.credentials = credentials;
    }

    async loadData() {
        const headers = this.params.headers ? this.getHeaders(this.params.headers) : {};
        const rest = this.params.rest ? this.getRest(this.params.rest) : '';
        const query = this.params.query ? this.getQuery(this.params.query) : '';
        const cors = this.params.cors ? this.globals.corsService : '';
        let data = await fetch(`${cors}${this.params.url || this.params.rss}${rest}?${query}`, {headers});

        if (this.params.url) data = await data.json();
        else if (this.params.rss) {
            if (this.params.encoding) {
                const decoder = new TextDecoder(this.params.encoding);

                data = await data.arrayBuffer();
                data = decoder.decode(data);
            } else {
                data = await data.text();
            }
            data = await xml2jsonHandler.parse(data);
        }
        this.data = data;
    }

    parseData() {
        if (this.data === null) this.data = {};
    }

    async renderContent() {
        const content = await twigHandler.render(`/widgets/default/${this.name}/widget.twig`, this.data);

        this.widgetWrapper.innerHTML = content;
        this.widgetWrapper.classList.add('widget--loaded');
    }

    run() {
        // extend purposes only
    }

    loop() {
        this.params.loop.forEach(schema => {
            schedule.scheduleJob(schema, this.refresh.bind(this));
        });
    }

    getHeaders(headersObject) {
        const headers = headersObject.raw || {};

        if (headersObject.credentials) {
            headersObject.credentials.forEach(item => {
                headers[item] = this.credentials[item];
            });
        }

        return headers;
    }

    getRest(restObject) {
        let rest = restObject.raw ? restObject.raw.join('/') : '';

        if (restObject.cretentials) {
            if (rest.length) rest += '/';
            restObject.cretentials.forEach((item, i) => {
                if (i > 0) rest += '/';
                rest += this.credentials[item];
            });
        }
        if (restObject.endWithSlash) rest += '/';

        return rest;
    }

    getQuery(queryObject) {
        const query = queryObject.raw || {};

        if (queryObject.credentials) {
            queryObject.credentials.forEach(item => {
                query[item] = this.credentials[item];
            });
        }

        return queryString.stringify(query);
    }
}

export default WidgetPrototype;
