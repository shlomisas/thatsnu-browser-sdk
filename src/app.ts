import $, {Cash} from 'cash-dom';
import './styles/app.less';

import storage from './utils/storage';
import {ELEMENT_ATTRIBUTES, ELEMENT_CLASSES, ELEMENT_EVENTS, USER_WATCHED_LEVELS_STORAGE_KEY} from './consts';
import {AppParams, ClickedItems, IDisposable} from './types';
import helper from './utils/helper';
import elementCreator from './utils/elementCreator';

export default class App implements IDisposable {
    params: AppParams;
    clickedItems: ClickedItems = {};
    elements: {[key: string]: Cash} = {};
    levels: { [key: string]: string } = {}

    constructor(params: AppParams) {
        this.params = params;
        this.clickedItems = this.getUserClickedItems();
    }

    private getUserClickedItems(): ClickedItems {

        const dict: ClickedItems = {};

        if (this.params?.state) {
            for (const id of this.params?.state) {
                dict[id] = true;
            }
        }

        const itemsInStorage = storage.getItem(USER_WATCHED_LEVELS_STORAGE_KEY);

        return {
            ...itemsInStorage,
            ...dict
        };
    }

    public generate(): void {
        const elements = $(`[${ELEMENT_ATTRIBUTES.ID}]`);
        elements.each((index, item)=> {

            const parent = $(item);
            const id = parent.attr(ELEMENT_ATTRIBUTES.ID);
            const tooltipText = parent.attr(ELEMENT_ATTRIBUTES.TOOLTIP_TEXT) || 'New!';
            const expiration = parent.attr(ELEMENT_ATTRIBUTES.EXPIRATION);
            const elemStyleStr = parent.attr(ELEMENT_ATTRIBUTES.STYLE);
            const elemParentStyleStr = parent.attr(ELEMENT_ATTRIBUTES.PARENT_STYLE);

            const { firstLevel, level } = helper.parseLevel(id);

            const { clickedItems } = this;

            if (clickedItems?.[level]) {
                return;
            }

            let elemStyle;
            if (elemStyleStr) {
                try {
                    elemStyle = JSON.parse(elemStyleStr);
                } catch(e) {}
            }

            elemStyle = elemStyle || {
                position: 'absolute',
                'z-index': 1,
                top: 0 ,
                right: 0
            };

            if (expiration) {
                const expDate = new Date(expiration);

                if (expDate instanceof Date && !isNaN(expDate.getTime()) && expDate.getTime() < new Date().getTime()) {
                    this.cleanElement(parent);
                    parent.attr(ELEMENT_ATTRIBUTES.ERROR, 'item expired');
                    return;
                }
            }

            let wnElem: Cash;
            if (this.elements[id]) {

                wnElem = this.elements[id];

                if (parent.find(`.${ELEMENT_CLASSES.MAIN}`).length) {
                    return;
                }

            } else {

                if (!this.levels[firstLevel]) {
                    this.levels[firstLevel] = helper.generateColor();
                }

                const color = this.levels[firstLevel];

                wnElem = elementCreator.getElement({
                    styles: {
                        'background-color': `${color}`,
                        ...elemStyle
                    }
                });

                wnElem.on(ELEMENT_EVENTS.CLICK, () => {
                    this.onElementClicked(wnElem, parent);
                });

                wnElem.on(ELEMENT_EVENTS.MOUSE_OVER, () => {
                    this.showTooltip(wnElem, {
                        tooltipText
                    });
                });

                wnElem.on(ELEMENT_EVENTS.MOUSE_OUT, () => {
                    this.hideTooltips();
                });
            }

            let elemParentStyle;
            if (elemParentStyleStr) {
                try {
                    elemParentStyle = JSON.parse(elemParentStyleStr);
                } catch(e) {}
            }

            parent.css(elemParentStyle || {
                position: 'relative',
                display: 'block'
            });

            parent.append(wnElem);

            this.elements[id] = wnElem;
        });
    }

    private onElementClicked(wnElem: Cash, parent: Cash): void {
        const id = parent.attr(ELEMENT_ATTRIBUTES.ID);
        const { firstLevel, level } = helper.parseLevel(id);
        const { simulate, onClick } = this.params;

        this.clickedItems[level] = true;
        this.clickedItems[firstLevel] = true;

        const { markAsRead } = onClick instanceof Function ? onClick(id, wnElem[0]) : {
            markAsRead: true
        };

        if (!markAsRead) {
            return;
        }

        if (!simulate) {
            storage.setItem(USER_WATCHED_LEVELS_STORAGE_KEY, this.clickedItems);
        }

        if (level) {
            parent.removeAttr(ELEMENT_ATTRIBUTES.ID);
            wnElem.remove();
            const firstLevelElem = $(`[${ELEMENT_ATTRIBUTES.ID}="${firstLevel}"`);
            this.cleanElement(firstLevelElem);
        }

        this.hideTooltips();

    }

    private cleanElement(elem: Cash) {
        for (const attribute of Object.values(ELEMENT_ATTRIBUTES)) {
            elem.removeAttr(attribute);
        }

        for (const className of Object.values(ELEMENT_CLASSES)) {
            elem.removeClass(className);
        }

        elem.find(`.${ELEMENT_CLASSES.MAIN}`).remove();
    }

    private showTooltip(elem: Cash, { tooltipText }: { tooltipText: string }) {
        this.hideTooltips();

        const toolTip = elementCreator.getTooltip({
            text: tooltipText
        });

        $('body').append(toolTip);

        const offset = elem.offset();
        toolTip.css({
            top: offset.top - toolTip.height() - 10,
            left: offset.left + elem.width() + 2
        });
    }

    private hideTooltips() {
        $(`.${ELEMENT_CLASSES.TOOLTIP}`).remove();
    }

    public getState(): Array<string> {
        return Object.keys(this.clickedItems);
    }

    public dispose() {
        this.hideTooltips();

        const elements = $(`[${ELEMENT_ATTRIBUTES.ID}]`);
        for (const attribute of Object.values(ELEMENT_ATTRIBUTES)) {
            elements.removeAttr(attribute).find(`.${ELEMENT_CLASSES.MAIN}`).remove();
        }

        for (const element of Object.values(this.elements)) {
            for (const eventName of Object.values(ELEMENT_EVENTS)) {
                element.off(eventName);
            }
        }
    }
}