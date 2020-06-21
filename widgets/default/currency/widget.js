import WidgetPrototype from 'core/components/widget-prototype.js';
import moment from 'moment';

class Widget extends WidgetPrototype {
    constructor(globals, name, settings) {
        super(globals, name, settings, {
            loop: [
                ['0 * * * *']
            ],
            credentials: true,
            url: 'https://api.exchangeratesapi.io/history',
            query: {
                raw: {
                    base: Object.keys(settings.base)[0],
                    symbols: Object.keys(settings.ratings).join(','),
                    /* eslint-disable camelcase */
                    start_at: moment().subtract(10, 'd').format('YYYY-MM-DD'),
                    end_at: moment().format('YYYY-MM-DD')
                    /* eslint-enable */
                }
            }
        });
    }

    parseData() {
        const keys = Object.keys(this.data.rates).sort();
        const current = this.data.rates[keys[keys.length - 1]];
        const prev = this.data.rates[keys[keys.length - 2]];

        this.data.currencies = {};
        Object.keys(this.settings.ratings).forEach(item => {
            this.data.currencies[item] = {
                country: this.settings.ratings[item],
                value: (1 / current[item]).toFixed(2),
                diff: ((prev[item] / current[item] - 1) * 100).toFixed(2),
                growth: current[item] < prev[item]
            };
        });
    }
}

export default Widget;
