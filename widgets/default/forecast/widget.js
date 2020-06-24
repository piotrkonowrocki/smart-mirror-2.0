import WidgetPrototype from 'core/components/widget-prototype.js';
import moment from 'moment';

const icons = {
    '01d': 'wi-day-sunny',
    '01n': 'wi-night-clear',
    '02d': 'wi-day-cloudy',
    '02n': 'wi-night-alt-cloudy',
    '03d': 'wi-cloud',
    '03n': 'wi-cloud',
    '04d': 'wi-cloudy',
    '04n': 'wi-cloudy',
    '09d': 'wi-showers',
    '09n': 'wi-showers',
    '10d': 'wi-day-showers',
    '10n': 'wi-night-alt-showers',
    '11d': 'wi-storm-showers',
    '11n': 'wi-storm-showers',
    '13d': 'wi-snow',
    '13n': 'wi-snow',
    '50d': 'wi-fog',
    '50n': 'wi-fog'
};

class Widget extends WidgetPrototype {
    constructor(globals, name, settings) {
        super(globals, name, settings, {
            loop: [
                ['*/5 * * * *']
            ],
            locales: true,
            credentials: true,
            url: 'https://api.openweathermap.org/data/2.5/forecast/daily',
            query: {
                raw: {
                    id: settings.cityId,
                    units: settings.units,
                    lang: globals.locale,
                    cnt: 16
                },
                credentials: ['appid']
            }
        });
    }

    parseData() {
        let today = moment();

        this.data.chart = {
            temp: [],
            data: [],
            stats: {}
        };

        this.data.list.forEach((day, i) => {
            this.data.chart.temp.push(day.temp.day);

            if (i === 1) day.name = this.locales.tomorrow;
            else if (i === 2) day.name = this.locales.afterTomorrow;
            else day.name = today.format('dddd');

            day.temp.day = day.temp.day.toFixed(1);
            day.temp.night = day.temp.night.toFixed(1);
            day.speed = (day.speed * 3.6).toFixed(1);
            day.icon = icons[day.weather[0].icon];
            today = today.add(1, 'd');
        });
        this.data.list = this.data.list.splice(1, this.settings.days);

        this.data.chart.stats.min = Math.min.apply(Math, this.data.chart.temp);
        this.data.chart.stats.max = Math.max.apply(Math, this.data.chart.temp);
        this.data.chart.stats.amplitude = this.data.chart.stats.max - this.data.chart.stats.min;
        this.data.chart.stats.height = Math.max(this.data.chart.stats.amplitude * 3, 50);
        this.data.chart.temp.forEach((temp, i) => {
            if (i > 0) {
                this.data.chart.data.push({
                    x1: this._getForecastChartX(i - 1, this.data.chart.temp.length),
                    y1: this._getForecastChartY(this.data.chart.temp[i - 1], this.data.chart.stats),
                    x2: this._getForecastChartX(i, this.data.chart.temp.length),
                    y2: this._getForecastChartY(temp, this.data.chart.stats)
                });
            }
        });
    }

    _getForecastChartX(i, l) {
        let x = Math.max(Math.min(i / (l - 1) * 100, 98), 2);
        const prop = 1 * (x - 50) * 2 / 100;

        x -= prop;

        return x;
    }

    _getForecastChartY(temp, stats) {
        let y = 100 - (temp - stats.min) / stats.amplitude * 100;
        const prop = 10 * (y - 50) * 2 / 100;

        y -= prop;

        return y;
    }
}

export default Widget;
