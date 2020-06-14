import queryString from 'query-string';
import twigHandler from '../base/twig-handler';

class WidgetPrototype {
    constructor(name, settings, params) {
        this.name = name;
        this.settings = settings;
        this.params = params;

        this.init();
    }

    async init() {
        this.renderWrapper();
        await this.loadCredentials();
        await this.loadData();
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
        data = this.parseData(data);
        this.data = data;
    }

    async renderContent() {
        const content = await twigHandler.render(`/widgets/default/${this.name}/widget.twig`, this.data);

        this.widgetWrapper.innerHTML = content;
    }

    getQuery(queryObject) {
        const query = queryObject.raw;

        queryObject.credentials.forEach(item => {
            query[item] = this.credentials[item];
        });

        return queryString.stringify(query);
    }

    parseData(data) {
        return data;
    }
}

export default WidgetPrototype;
