import $, {Cash} from 'cash-dom';
import './styles/app.less';

import storage from './utils/storage';
import {
    INPUT_DOM_ATTRIBUTES,
    ELEMENT_CLASSES,
    ELEMENT_EVENTS,
    USER_WATCHED_LEVELS_STORAGE_KEY,
    OUTPUT_DOM_ATTRIBUTES,
    ATTRIBUTE_PREFIX
} from './consts';
import {
    AppParams,
    ClickedItems,
    IndicatorSettings,
    IDisposable,
    TooltipElementSettings, IndicatorOptions, IndicatorOptionsList
} from './types';
import helper from './utils/helper';
import domManager from './utils/domManager';
import logger from './utils/logger';

export default class App implements IDisposable {
    params: AppParams;
    clickedItems: ClickedItems = {};
    elements: {[key: string]: Cash} = {};
    colors: { [key: string]: string } = {}

    constructor(params: AppParams) {
        this.params = params;
        this.clickedItems = this.getUserClickedItems();
    }

    public generate(): void {
        const elements = $(`[${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}]`);
        elements.each((index, item)=> {

            const parent = $(item);

            const indicatorOptionsFromElement = this.getOptionsFromParentElement(parent);

            // This is a safety check, basically it shouldn't be as the search for elements above is based on the ID attributes
            if (!indicatorOptionsFromElement.id) {
                logger.log(`Missing identifier for element`);
                return;
            }

            const indicatorOptionsFromConfig = this.getOptionsFromConfig(indicatorOptionsFromElement.id);

            const {
                indicator: indicatorSettings,
                tooltip: tooltipSettings
            } = this.getIndicatorSettings({
                ...indicatorOptionsFromConfig,
                ...indicatorOptionsFromElement,
            });

            const id = indicatorSettings.id;
            const { expiration } = indicatorSettings;

            const group = helper.getGroupFromId(id);
            const { clickedItems } = this;

            if (clickedItems?.[id]) {
                return;
            }

            if (expiration && expiration.getTime() < new Date().getTime()) {
                this.cleanElement(parent);
                parent.attr(OUTPUT_DOM_ATTRIBUTES.ERROR, 'item expired');
                return;
            }

            let wnElem: Cash;
            if (this.elements[id]) {

                wnElem = this.elements[id];

                if (parent.find(`.${ELEMENT_CLASSES.INDICATOR}`).length) {
                    return;
                }

            } else {

                if (!this.colors[group]) {
                    this.colors[group] = indicatorSettings.color || this.params.defaultColor || '#462a68';
                }

                const color = this.colors[group];

                wnElem = domManager.getIndicator({
                    ...indicatorSettings,
                    styles: {
                        'background-color': `${color}`,
                        ...indicatorSettings.styles
                    }
                });

                wnElem.on(ELEMENT_EVENTS.CLICK, () => {
                    this.onElementClicked(wnElem, parent);
                });

                wnElem.on(ELEMENT_EVENTS.MOUSE_OVER, () => {
                    this.showTooltip(wnElem, tooltipSettings);
                });

                wnElem.on(ELEMENT_EVENTS.MOUSE_OUT, () => {
                    if (!this.params.debugTooltip) {
                        this.hideTooltips();
                    }
                });
            }

            parent.append(wnElem);
            this.elements[id] = wnElem;
        });
    }

    private getOptionsFromConfig(id: string) {
        return this.params.indicators.find(item => {
            if (item.id.includes('*')) {
                return helper.isMatchWildcard(item.id, id);
            }

            return id === item.id;
        });
    }

    private getUserClickedItems(): ClickedItems {

        const dict: ClickedItems = {};

        if (this.params?.initialState) {
            for (const id of this.params?.initialState) {
                dict[id] = true;
            }
        }

        const itemsInStorage = storage.getItem(USER_WATCHED_LEVELS_STORAGE_KEY);

        return {
            ...itemsInStorage,
            ...dict
        };
    }

    private getOptionsFromParentElement(parent: Cash): IndicatorOptions {
        const validOptions = Object.keys(IndicatorOptionsList);

        const data: IndicatorOptions = {};
        for (const attr of parent[0].attributes) {
            if (attr.name.startsWith(ATTRIBUTE_PREFIX)) {
                const optionName = helper.toCamelCase(attr.name.substring(ATTRIBUTE_PREFIX.length + 1));

                if (validOptions.includes(optionName)) {
                    data[optionName as IndicatorOptionsList] = attr.value;
                } else {
                    logger.log(`Invalid Thatsnu attribute: ${attr.name}`);
                }
            }
        }

        return data;
    }

    private getIndicatorSettings(options: IndicatorOptions): IndicatorSettings {

        let { expiration } = options;

        if (typeof expiration === 'string') {
            expiration = new Date(expiration);
            if (!(expiration instanceof Date) || isNaN(expiration.getTime())) {
                expiration = undefined;
            }
        }

        const parseStyles = (styles: string | object) => {
            return typeof styles === 'string' ? domManager.getStylesFromString(styles) : styles;
        };

        const { className: indicatorClassName } = options;
        const { tooltipClassName } = options;

        return {
            indicator: {
                id: options.id,
                text: options.text,
                styles: parseStyles(options.styles),
                color: options.color,
                classNames: indicatorClassName ? [indicatorClassName] : undefined,
                expiration
            },
            tooltip: {
                text: options.tooltipText || 'New!',
                styles: parseStyles(options.tooltipStyles),
                classNames: tooltipClassName ? [tooltipClassName] : undefined
            }
        }
    }

    private onElementClicked(wnElem: Cash, parent: Cash): void {
        const id = parent.attr(INPUT_DOM_ATTRIBUTES.INDICATOR_ID);
        const group = helper.getGroupFromId(id);
        const { onClick } = this.params;

        this.clickedItems[id] = true;
        this.clickedItems[group] = true;

        const markAsRead = onClick instanceof Function ? onClick(id) : true;

        if (!markAsRead) {
            return;
        }

        storage.setItem(USER_WATCHED_LEVELS_STORAGE_KEY, this.clickedItems);

        if (id) {
            parent.removeAttr(INPUT_DOM_ATTRIBUTES.INDICATOR_ID);
            wnElem.remove();
            const firstLevelElem = $(`[${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}="${group}"`);
            this.cleanElement(firstLevelElem);
        }

        this.hideTooltips();

    }

    private cleanElement(elem: Cash) {
        for (const attribute of Object.values(INPUT_DOM_ATTRIBUTES)) {
            elem.removeAttr(attribute);
        }

        for (const className of Object.values(ELEMENT_CLASSES)) {
            elem.removeClass(className);
        }

        elem.find(`.${ELEMENT_CLASSES.INDICATOR}`).remove();
    }

    private showTooltip(elem: Cash, elementSettings: TooltipElementSettings) {
        this.hideTooltips();

        const toolTip = domManager.getTooltip(elementSettings);

        $('body').append(toolTip);

        const offset = elem.offset();
        toolTip.css({
            top: offset.top - toolTip.height() - 14,
            left: offset.left + elem.width() + 9
        });
    }

    private hideTooltips() {
        $(`.${ELEMENT_CLASSES.TOOLTIP}`).remove();
    }

    public getState(): Array<string> {
        return Object.keys(this.clickedItems);
    }

    public resetState() {
        storage.removeItem(USER_WATCHED_LEVELS_STORAGE_KEY);
        this.clickedItems = {};
    }

    public dispose() {
        this.hideTooltips();

        const elements = $(`[${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}]`);
        for (const attribute of Object.values(INPUT_DOM_ATTRIBUTES)) {
            elements.removeAttr(attribute).find(`.${ELEMENT_CLASSES.INDICATOR}`).remove();
        }

        for (const element of Object.values(this.elements)) {
            for (const eventName of Object.values(ELEMENT_EVENTS)) {
                element.off(eventName);
            }
        }

        for (const attribute of Object.values(OUTPUT_DOM_ATTRIBUTES)) {
            $(`[${attribute}]`).removeAttr(attribute);
        }

        this.resetState();
    }
}