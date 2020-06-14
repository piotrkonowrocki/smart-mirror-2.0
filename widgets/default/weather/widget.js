import WidgetPrototype from 'core/components/widget-prototype.js';

class Widget extends WidgetPrototype {
    constructor(name, settings) {
        super(name, settings, {
            credentials: true,
            url: 'http://api.openweathermap.org/data/2.5/weather',
            query: {
                raw: {
                    id: settings.cityId,
                    units: settings.units,
                    lang: settings.lang
                },
                credentials: ['appid']
            }
        });

        this.icons = {
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
    }

    parseData(data) {
        if (data.weather[0]) data.weather = data.weather[0];
        data.main.temp = data.main.temp.toFixed(1);
        data.wind.speed = (data.wind.speed * 3.6).toFixed(1);
        data.wind.deg -= 180;
        data.icon = this.getIcon(data.weather.icon);

        return data;
    }

    getIcon(id) {
        return this.icons[id];
    }
}

export default Widget;
