import StaticComponent from './components/static-component';

class App {
    constructor() {
        this.init();
    }

    init() {
        this.initStaticComponent();
        this.initAsyncComponent();
    }

    initStaticComponent() {
        const staticComponent = new StaticComponent();

        staticComponent.printMessage();
    }

    async initAsyncComponent() {
        const AsyncComponent = (await import('./components/async-component')).default;
        const asyncComponent = new AsyncComponent();

        asyncComponent.printMessage();
    }
}

document.addEventListener('DOMContentLoaded', () => new App());
