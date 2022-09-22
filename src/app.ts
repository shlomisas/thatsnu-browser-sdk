import $, {Cash} from 'cash-dom';
import './styles/app.less';

import storage from './utils/storage';

import {
    VALID_DOM_ATTRIBUTES,
    ELEMENT_CLASSES,
    ELEMENT_EVENTS,
    USER_CLICKED_ITEMS_STORAGE_KEY,
    ATTRIBUTE_PREFIX,
    DEFAULT_INDICATOR_COLOR,
    INDICATOR_ERRORS
} from './consts';
import {
    AppParams,
    ClickedItems,
    IndicatorSettings,
    IDisposable,
    TooltipElementSettings, IndicatorOptions
} from './types';
import helper from './utils/helper';
import domManager from './utils/domManager';
import logger from './utils/logger';
import optionsValidator from './utils/optionsValidator';

export default class App implements IDisposable {
    params: AppParams;
    clickedItems: ClickedItems = {};
    elements: {[key: string]: Cash} = {};
    colors: { [key: string]: string } = {}

    constructor(params?: AppParams) {
        this.params = params;
        this.clickedItems = this.getUserClickedItems();

        this.validate();
    }

    private validate() {
        if (this.params?.indicators?.length) {
            for (let indicatorOption of this.params.indicators) {
                optionsValidator.validate(indicatorOption);
            }
        }
    }

    public generate(): void {
        const elements = $(`[${VALID_DOM_ATTRIBUTES.INDICATOR_ID}]`);
        elements.each((index, item)=> {

            const parent = $(item);

            const indicatorOptionsFromElement = this.getOptionsFromParentAttributes(parent);
            const indicatorOptionsFromConfig = this.getOptionsFromConfig(indicatorOptionsFromElement.id);

            const options = {
                ...indicatorOptionsFromConfig,
                ...indicatorOptionsFromElement,
            };

            optionsValidator.validate(options);

            const {
                indicator: indicatorSettings,
                tooltip: tooltipSettings
            } = this.getIndicatorSettings(options);

            const id = indicatorSettings.id;
            const { expiration } = indicatorSettings;

            const group = helper.getGroupFromId(id);
            const { clickedItems } = this;

            if (clickedItems?.[id]) {
                return;
            }

            if (expiration && expiration.getTime() < new Date().getTime()) {
                parent.attr(VALID_DOM_ATTRIBUTES.INDICATOR_ERROR, `${INDICATOR_ERRORS.ITEM_EXPIRED}`);
                return;
            }

            let indicator: Cash;
            if (this.elements[id]) {

                indicator = this.elements[id];

                if (parent.find(`.${ELEMENT_CLASSES.INDICATOR}`).length) {
                    return;
                }

            } else {

                if (!this.colors[group]) {
                    this.colors[group] = indicatorSettings.color || this.params?.defaultColor || DEFAULT_INDICATOR_COLOR;
                }

                const color = this.colors[group];

                indicator = domManager.getIndicator({
                    ...indicatorSettings,
                    styles: {
                        'background-color': `${color}`,
                        ...indicatorSettings.styles
                    }
                });

                indicator.on(ELEMENT_EVENTS.CLICK, () => {
                    this.onElementClicked(indicator, parent);
                });

                indicator.on(ELEMENT_EVENTS.MOUSE_OVER, () => {
                    this.showTooltip(indicator, tooltipSettings);
                });

                indicator.on(ELEMENT_EVENTS.MOUSE_OUT, () => {
                    if (!this.params.debugTooltip) {
                        this.hideTooltips();
                    }
                });
            }

            parent.append(indicator);
            this.elements[id] = indicator;
        });
    }

    private getOptionsFromConfig(id: string): IndicatorOptions {
        return this.params?.indicators?.find(item => {
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

        const itemsInStorage = storage.getItem(USER_CLICKED_ITEMS_STORAGE_KEY);

        const finalState = {
            ...itemsInStorage,
            ...dict
        };

        storage.setItem(USER_CLICKED_ITEMS_STORAGE_KEY, finalState);

        return finalState;
    }

    private getOptionsFromParentAttributes(parent: Cash): IndicatorOptions {

        const validAttributes = Object.values(VALID_DOM_ATTRIBUTES);

        const data: {[key: string]: any } = {};

        for (const attr of parent[0].attributes) {
            if (attr.name.startsWith(ATTRIBUTE_PREFIX)) {
                if (validAttributes.includes(attr.name)) {
                    const optionName = domManager.attributeToOption(attr.name);
                    data[optionName] = optionsValidator.normalizeAttribute(optionName, attr.value);
                } else {
                    logger.log(`Invalid Thatsnu attribute: ${attr.name}`);
                }
            }
        }

        return data as IndicatorOptions;
    }

    private getIndicatorSettings(options: IndicatorOptions): IndicatorSettings {

        const { className: indicatorClassName } = options;
        const { tooltipClassName } = options;

        return {
            indicator: {
                id: options.id,
                text: options.text,
                styles: options.styles,
                color: options.color,
                classNames: indicatorClassName ? [indicatorClassName] : undefined,
                expiration: options.expiration
            },
            tooltip: {
                text: options.tooltipText || 'New!',
                styles: options.tooltipStyles,
                classNames: tooltipClassName ? [tooltipClassName] : undefined
            }
        }
    }

    private onElementClicked(wnElem: Cash, parent: Cash): void {
        const id = parent.attr(VALID_DOM_ATTRIBUTES.INDICATOR_ID);
        const group = helper.getGroupFromId(id);
        const { onClick } = this.params || {};

        this.clickedItems[id] = true;
        this.clickedItems[group] = true;

        const markAsRead = typeof onClick === 'function' ? onClick(id) : true;

        if (!markAsRead) {
            return;
        }

        storage.setItem(USER_CLICKED_ITEMS_STORAGE_KEY, this.clickedItems);

        if (id) {
            parent.removeAttr(VALID_DOM_ATTRIBUTES.INDICATOR_ID);
            wnElem.remove();
            const firstLevelElem = $(`[${VALID_DOM_ATTRIBUTES.INDICATOR_ID}="${group}"`);
            this.cleanElement(firstLevelElem);
        }

        this.hideTooltips();

    }

    private cleanElement(elem: Cash) {
        for (const attribute of Object.values(VALID_DOM_ATTRIBUTES)) {
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
        storage.removeItem(USER_CLICKED_ITEMS_STORAGE_KEY);
        this.clickedItems = {};
    }

    public dispose() {
        this.hideTooltips();

        const elements = $(`[${VALID_DOM_ATTRIBUTES.INDICATOR_ID}]`);
        for (const attribute of Object.values(VALID_DOM_ATTRIBUTES)) {
            elements.removeAttr(attribute).find(`.${ELEMENT_CLASSES.INDICATOR}`).remove();
        }

        for (const element of Object.values(this.elements)) {
            for (const eventName of Object.values(ELEMENT_EVENTS)) {
                element.off(eventName);
            }
        }

        this.resetState();
    }
}