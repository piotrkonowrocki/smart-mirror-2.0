import WidgetPrototype from 'core/components/widget-prototype.js';

const norms = {
    PM10: {
        norm: 50,
        unit: 'μg/m3',
        label: 'PM10',
        ranges: [20, 40, 50, 100, 150]
    },
    PM25: {
        norm: 25,
        unit: 'μg/m3',
        label: 'PM2.5',
        ranges: [10, 20, 25, 50, 75]
    },
    NO2: {
        norm: 200,
        unit: 'μg/m3',
        label: 'NO₂',
        ranges: [40, 90, 120, 230, 340]
    },
    SO2: {
        norm: 350,
        unit: 'μg/m3',
        label: 'SO₂',
        ranges: [100, 200, 350, 500, 750]
    },
    CO: {
        norm: 30,
        unit: 'mg/m3',
        label: 'CO',
        ranges: [12, 24, 30, 60, 90]
    },
    O3: {
        norm: 100,
        unit: 'μg/m3',
        label: 'O₃',
        ranges: [50, 100, 130, 240, 380]
    }
};
const ratingLabels = [
    'bardzo dobra',
    'dobra',
    'przeciętna',
    'zła',
    'bardzo zła',
    'katastrofalna'
];

class Widget extends WidgetPrototype {
    constructor(globals, name, settings) {
        super(globals, name, settings, {
            credentials: true,
            url: '/data/pollutions.json',
            // url: 'https://airapi.airly.eu/v2/measurements/installation',
            headers: {
                credentials: ['apikey']
            },
            query: {
                raw: {
                    installationId: settings.installationId
                }
            }
        });
    }

    parseData() {
        const entries = this.data.history;
        const ratings = [];

        entries.push(this.data.current);
        entries.reverse();

        entries.some(item => {
            if (item.values) this.data.measurements = item.values;

            return item.values;
        });
        this.data.measurements.forEach((item, i) => {
            if (Object.keys(norms).includes(item.name)) {
                const norm = norms[item.name];

                item.label = norm.label;
                item.unit = norm.unit;
                item.norm = `${(item.value / norm.norm * 100).toFixed(1)}%`;
                item.rating = 0;

                norm.ranges.forEach((range, j) => {
                    if (item.value > range) item.rating = j + 1;
                });
                ratings.push(item.rating);
            } else delete this.data.measurements[i];
        });
        this.data.index = ratingLabels[Math.max.apply(Math, ratings)];
    }
}

export default Widget;
