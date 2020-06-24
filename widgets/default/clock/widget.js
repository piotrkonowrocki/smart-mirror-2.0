import WidgetPrototype from 'core/components/widget-prototype.js';
import moment from 'moment';
import leftPad from 'left-pad';

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
        const today = moment();

        this.data = {
            hours: leftPad(date.getHours(), 2, 0),
            minutes: leftPad(date.getMinutes(), 2, 0),
            seconds: leftPad(date.getSeconds(), 2, 0),
            date: today.format(this.settings.formatDate)
        };
    }
}

export default Widget;
