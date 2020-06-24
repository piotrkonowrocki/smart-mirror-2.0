/* global gapi */
import WidgetPrototype from 'core/components/widget-prototype.js';
import moment from 'moment';

class Widget extends WidgetPrototype {
    constructor(globals, name, settings) {
        super(globals, name, settings, {
            credentials: true,
            customDataLoader: true,
            externalLibrary: {
                name: 'gapi',
                url: 'https://apis.google.com/js/api.js'
            }
        });
    }

    loadData() {
        return new Promise(resolve => {
            gapi.load('client:auth2', () => {
                gapi.client.init({
                    apiKey: this.credentials.apiKey,
                    clientId: this.credentials.clientId,
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                    scope: 'https://www.googleapis.com/auth/calendar.readonly'
                }).then(() => {
                    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
                        this._getDataFromCalendars()
                            .then(resolve);
                    } else {
                        gapi.auth2.getAuthInstance().signIn().then(() => {
                            this._getDataFromCalendars()
                                .then(resolve);
                        });
                    }
                });
            });
        });
    }

    _getDataFromCalendars() {
        return new Promise(resolve => {
            let data = [];
            let loadedCalendars = 0;

            this.settings.calendars.forEach(calendar => {
                this._getDataFromSingleCalendar(calendar).then(respose => {
                    respose.forEach(item => {
                        item.label = calendar.label || false;
                    });
                    data = data.concat(respose);
                    loadedCalendars++;

                    if (loadedCalendars === this.settings.calendars.length) {
                        this.data = {events: data};
                        resolve();
                    }
                });
            });
        });
    }

    _getDataFromSingleCalendar(calendar) {
        return new Promise(resolve => {
            gapi.client.calendar.events.list({
                calendarId: calendar.id,
                timeMin: moment()
                    .startOf('day')
                    .toISOString(),
                timeMax: moment()
                    .startOf('day')
                    .add(1, 'w')
                    .toISOString(),
                maxResults: 99,
                singleEvents: true,
                orderBy: 'startTime'
            }).then(response => resolve(response.result.items));
        });
    }

    parseData() {
        const today = moment().startOf('day');
        const tommorow = moment().startOf('day').add(1, 'd');
        const dayLength = 1000 * 60 * 60 * 24;

        this.data.list = {
            today: {
                label: 'Dzisiaj',
                events: {}
            },
            tommorow: {
                label: 'Jutro',
                events: {}
            },
            upcoming: {
                label: 'Nadchodzące',
                events: {}
            }
        };

        this.data.events.forEach((event, i) => {
            const eventDate = moment(event.start.dateTime || event.start.date);
            const eventTime = event.start.dateTime ? moment(event.start.dateTime) : false;
            const key = eventDate.unix() + i;

            event.date = eventDate;
            event.day = eventDate.format('dddd');
            event.timeLeft = today.to(eventDate.startOf('day'));
            event.time = eventTime ? eventTime.format('HH:mm') : false;
            event.multiplier = 1;

            if (event.date.diff(today) < dayLength) this.data.list.today.events[key] = event;
            else if (event.date.diff(tommorow) < dayLength) this.data.list.tommorow.events[key] = event;
            else this.data.list.upcoming.events[key] = event;
        });
        Object.keys(this.data.list).forEach(k => {
            if (Object.keys(this.data.list[k].events).length === 0) this.data.list[k].events = 'Brak wydarzeń';
        });

        delete this.data.events;
    }
}

export default Widget;
