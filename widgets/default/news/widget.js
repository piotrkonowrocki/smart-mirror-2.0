import WidgetPrototype from 'core/components/widget-prototype.js';

class Widget extends WidgetPrototype {
    constructor(globals, name, settings) {
        super(globals, name, settings, {
            loop: [],
            rss: 'https://wiadomosci.gazeta.pl/pub/rss/wiadomosci.htm',
            cors: true,
            encoding: 'iso-8859-2',
            headers: {
                raw: {
                    'Content-Type': 'text/plain; charset=UTF-8'
                }
            }
        });
    }

    prepareVars() {
        this.step = 1;
        this.cycle = 1;
        this.animationTime = 500;
        this.maxCycles = 5;
        this.svg = document.querySelector('.widget-news__meta__counter__svg svg');
        this.slice = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    }

    run() {
        this.slice.setAttribute('fill', 'rgb(255, 255, 255)');
        this.svg.appendChild(this.slice);
        setTimeout(() => {
            document.querySelector('.widget-news__list').firstElementChild.classList.add('widget-news__list__item--active');
            this._setHeight();
        }, 1);
        setTimeout(this._startCountdown.bind(this), this.animationTime * 0.5);
    }

    _setHeight() {
        const container = document.querySelector('.widget-news__list');
        const activeItem = document.querySelector('.widget-news__list__item--active');

        container.style.height = `${activeItem.offsetHeight}px`;
    }

    _startCountdown() {
        const fps = 30;
        const increase = 1 / (this.settings.displayTime / 1000 * fps);
        let percent = 0;
        let interval = {};

        interval = setInterval(() => {
            const endX = Math.cos(2 * Math.PI * percent);
            const endY = Math.sin(2 * Math.PI * percent);
            const largeArcFlag = percent > 0.5 ? 1 : 0;
            const pathData = `M 1 0 A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;

            this.slice.setAttribute('d', pathData);
            if (percent >= 1) {
                clearInterval(interval);
                setTimeout(this._showNextItem.bind(this), this.animationTime * 0.5);
            } else percent = Math.min(1, percent + increase);
        }, 1000 / fps);
    }

    _showNextItem() {
        const activeItem = document.querySelector('.widget-news__list__item--active');
        const currentStepContainer = document.querySelector('.widget-news__meta__steps__current');

        activeItem.classList.remove('widget-news__list__item--active');
        this.svg.classList.add('hide');
        setTimeout(() => {
            if (this.step < this.data.channel[0].item.length) {
                this.step++;
                activeItem.nextElementSibling.classList.add('widget-news__list__item--active');
            } else {
                this.step = 1;
                this.cycle++;
                if (this.cycle < this.maxCycles) activeItem.parentNode.firstElementChild.classList.add('widget-news__list__item--active');
            }
            if (this.cycle < this.maxCycles) {
                this.svg.classList.remove('hide');
                this.slice.setAttribute('d', '');
                currentStepContainer.innerText = this.step;
                this._setHeight();
                setTimeout(this._startCountdown.bind(this), this.animationTime * 0.5);
            } else this.refresh();
        }, this.animationTime * 1.5);
    }
}

export default Widget;
