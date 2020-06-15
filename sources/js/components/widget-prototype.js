import deepExtend from 'deep-extend';
import schedule from 'node-schedule';
import queryString from 'query-string';
import twigHandler from '../base/twig-handler';

class WidgetPrototype {
    constructor(name, settings, params) {
        this.name = name;
        this.settings = settings;
        this.params = deepExtend({
            loop: [
                ['*/30 * * * *'],
                ['0 0 * * *']
            ]
        }, params);

        this.init();
    }

    async init() {
        this.renderWrapper();
        if (this.params.credentials) await this.loadCredentials();
        if (this.params.url) await this.loadData();
        this.parseData();
        await this.renderContent();
        this.loop();
    }

    async refresh() {
        if (this.params.url) await this.loadData();
        this.parseData();
        await this.renderContent();
    }

    renderWrapper() {
        this.widgetWrapper = document.createElement('div');
        const region = document.querySelector(`.region.region--${this.settings.region[0]}.region--${this.settings.region[1]}`);

        this.widgetWrapper.classList.add('widget', `widget-${this.name}`);
        region.appendChild(this.widgetWrapper);
    }

    async loadCredentials() {
        let credentials = await fetch(`/widgets/default/${this.name}/credentials.json`);

        credentials = await credentials.json();
        this.credentials = credentials;
    }

    async loadData() {
        const query = this.getQuery(this.params.query);
        let data = await fetch(`${this.params.url}?${query}`);

        data = await data.json();
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

    loop() {
        this.params.loop.forEach(schema => {
            schedule.scheduleJob(schema, this.refresh.bind(this));
        });
    }

    getQuery(queryObject) {
        const query = queryObject.raw;

        queryObject.credentials.forEach(item => {
            query[item] = this.credentials[item];
        });

        return queryString.stringify(query);
    }
}

export default WidgetPrototype;
