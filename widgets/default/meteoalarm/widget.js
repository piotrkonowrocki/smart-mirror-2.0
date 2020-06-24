import WidgetPrototype from 'core/components/widget-prototype.js';

const levels = {
    l2: 1,
    l3: 2,
    l4: 3
};
const types = {
    t1: {
        label: 'silny wiatr',
        icon: 'wi-strong-wind'
    },
    t2: {
        label: 'śnieżyce',
        icon: 'wi-snow-wind'
    },
    t3: {
        label: 'burze',
        icon: 'wi-storm-showers'
    },
    t4: {
        label: 'gęsta mgła',
        icon: 'wi-fog'
    },
    t5: {
        label: 'upał',
        icon: 'wi-day-sunny'
    },
    t6: {
        label: 'silny mróz',
        icon: 'wi-snowflake-cold'
    },
    t7: {
        label: 'sztorm',
        icon: 'wi-tsunami'
    },
    t8: {
        label: 'pożar lasu',
        icon: 'wi-fire'
    },
    t9: {
        label: 'lawina',
        icon: 'wi-meteor'
    },
    t10: {
        label: 'ulewy',
        icon: 'wi-showers'
    },
    t11: {
        label: 'powódź',
        icon: 'wi-flood'
    },
    t12: {
        label: 'ulewy',
        icon: 'wi-showers'
    }
};

class Widget extends WidgetPrototype {
    constructor(globals, name, settings) {
        super(globals, name, settings, {
            rss: `https://www.meteoalarm.eu/documents/rss${settings.rss}`,
            cors: true
        });
    }

    parseData() {
        const wrapper = document.createElement('div');
        let imgData = '';
        let level = 'l1';
        let type = 't0';

        wrapper.innerHTML = this.data.channel[0].item[0].description;
        imgData = wrapper.querySelector('img').src.replace(/\.[^/.]+$/u, '').split('-');
        level = imgData[1];
        type = imgData[2];

        if (Object.keys(levels).includes(level) && Object.keys(types).includes(type)) {
            this.data.level = levels[level];
            this.data.type = types[type];
        }
    }
}

export default Widget;
