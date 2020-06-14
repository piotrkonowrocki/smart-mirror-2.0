import Mirror from './components/mirror';

class App {
    constructor() {
        this.init();
    }

    init() {
        new Mirror();
    }
}

document.addEventListener('DOMContentLoaded', () => new App());
