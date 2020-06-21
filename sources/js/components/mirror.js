class Mirror {
    constructor() {
        this.init();
    }

    async init() {
        const settings = await this.getSettings();

        this.loadWidgets(settings);
    }

    async getSettings() {
        const response = await fetch('/widgets/settings.json');

        return response.json();
    }

    loadWidgets(settings) {
        settings.widgets.forEach(widget => {
            this.initWidget(settings, widget.name, widget.settings);
        });
    }

    async initWidget(globals, name, settings) {
        const Widget = (await import(`widgets/default/${name}/widget`)).default;

        new Widget(globals, name, settings);
    }
}

export default Mirror;
