class AsyncComponent {
    constructor() {
        this.message = 'Async component loaded successfully!';
    }

    printMessage() {
        /* eslint-disable no-console */
        console.log(this.message);
        /* eslint-enable */
    }
}

export default AsyncComponent;
