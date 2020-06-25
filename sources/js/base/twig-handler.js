import Twig from 'twig';

class TwigHandler {
    constructor() {
        this.templates = {};
    }

    loadTemplate(src) {
        return new Promise(resolve => {
            Twig.twig({
                id: src,
                href: src,
                async: true,
                load: () => {
                    this.templates[src] = Twig.twig({ref: src});

                    resolve();
                }
            });
        });
    }

    async render(src, data = {}, locales = {}) {
        if (!Object.keys(this.templates).includes(src)) await this.loadTemplate(src);

        return this.templates[src].render({data, locales});
    }
}

const twigHandler = new TwigHandler();

export default twigHandler;
