import WidgetPrototype from 'core/components/widget-prototype.js';
import leftPad from 'left-pad';

const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
const months = [
    'stycznia',
    'lutego',
    'marca',
    'kwietnia',
    'maja',
    'czerwca',
    'lipca',
    'sierpnia',
    'września',
    'października',
    'listopada',
    'grudnia'
];

class Widget extends WidgetPrototype {
    constructor(globals, name, settings) {
        super(globals, name, settings, {
            loop: [
                ['* * * * * *']
            ]
        });
    }

    parseData() {
        const date = new Date();

        this.data = {
            hours: leftPad(date.getHours(), 2, 0),
            minutes: leftPad(date.getMinutes(), 2, 0),
            seconds: leftPad(date.getSeconds(), 2, 0),
            dayOfWeek: days[date.getDay()],
            day: date.getDate(),
            month: months[date.getMonth()],
            year: date.getFullYear()
        };
    }
}

export default Widget;
