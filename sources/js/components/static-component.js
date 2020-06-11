class StaticComponent {
    constructor() {
        this.message = 'Static component loaded successfully!';
    }

    printMessage() {
        /* eslint-disable no-console */
        console.log(this.message);
        /* eslint-enable */
    }
}

export default StaticComponent;
