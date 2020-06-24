import WidgetPrototype from 'core/components/widget-prototype.js';

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
            credentials: true,
            url: 'https://api.openweathermap.org/data/2.5/weather',
            query: {
                raw: {
                    id: settings.cityId,
                    units: settings.units,
                    lang: settings.lang
                },
                credentials: ['appid']
            }
        });
    }

    parseData() {
        this.data.main.temp = this.data.main.temp.toFixed(1);
        this.data.wind.speed = (this.data.wind.speed * 3.6).toFixed(1);
        this.data.wind.deg -= 180;
        this.data.icon = icons[this.data.weather[0].icon];
        this.data.description = this.data.weather[0].description;
    }
}

export default Widget;
