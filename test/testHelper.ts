import {expect} from '@jest/globals';
import {ElementStyles, IndicatorAttributes, IndicatorOptions, IndicatorOptionsList} from '../src/types';
import {faker} from '@faker-js/faker';
import {ATTRIBUTE_PREFIX, ELEMENT_CLASSES, ELEMENT_EVENTS, VALID_DOM_ATTRIBUTES} from '../src/consts';
import $, {Cash} from 'cash-dom';

class TestHelper {
    getIndicatorParent(id: string) {
        return $(`[${VALID_DOM_ATTRIBUTES.INDICATOR_ID}="${id}"]`);
    }

    getIndicator(id: string) {
        return this.getIndicatorParent(id).find(`.${ELEMENT_CLASSES.INDICATOR}`);
    }
    generateIndicatorOption(id: string, except?: { [key: string]: boolean }): IndicatorOptions {

        const indicatorOptions: IndicatorOptions = {
            id
        };

        for (const key of Object.keys(IndicatorOptionsList) as Array<IndicatorOptionsList>) {

            if (except?.[key]) continue;

            let value: string | Date | ElementStyles;
            switch(key) {
                case 'id':
                    value = indicatorOptions.id;
                    break;
                case 'className':
                case 'tooltipClassName':
                    value = faker.datatype.uuid();
                    break;
                case 'styles':
                    value = {
                        top: faker.datatype.number(),
                        left: faker.datatype.number()
                    };
                    break;
                case 'tooltipStyles':
                    value = {
                        color: faker.color.rgb({
                            format: 'css'
                        }),
                        'font-weight': 'bold'
                    };
                    break;
                case 'color':
                    value = faker.color.rgb({
                        format: 'css'
                    });
                    break;
                case 'expiration':
                    value = faker.date.future();
                    break;
                default:
                    value = faker.music.genre();
            }

            indicatorOptions[key] = value as (string & Date & ElementStyles);
        }

        return indicatorOptions;
    }
    getAttributeByPropName(propName: string): string {
        const dashed = propName.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
        return `${ATTRIBUTE_PREFIX}-${dashed}`;
    }
    indicatorOptionsToAttributes(indicatorOptions: IndicatorOptions): IndicatorAttributes {

        const indicatorAttributes: IndicatorAttributes = {};
        for (const key of Object.keys(indicatorOptions) as Array<IndicatorOptionsList>) {

            let value: string;
            if(indicatorOptions[key] instanceof Date) {
                value = (indicatorOptions[key] as Date).toISOString();
            } else if (typeof indicatorOptions[key] === 'object') {
                value = JSON.stringify(indicatorOptions[key]);
            } else {
                value = indicatorOptions[key] as string;
            }

            const attributeName: string = this.getAttributeByPropName(key);
            indicatorAttributes[attributeName as keyof IndicatorAttributes] = value;
        }

        return indicatorAttributes;
    }
    testElem(elem: Cash, indicatorOptions: IndicatorOptions) {
        expect(elem.length).toBe(1);
        expect(elem.text()).toBe(indicatorOptions.text);
        expect(elem.hasClass(indicatorOptions.className)).toBeTruthy();

        if (indicatorOptions.styles) {
            expect(elem.css('top')).toEqual(`${indicatorOptions.styles.top}px`);
            expect(elem.css('left')).toEqual(`${indicatorOptions.styles.left}px`);
        }

        if (indicatorOptions.color) {
            expect(elem.css('background-color')).toEqual(`${indicatorOptions.color}`);
        }
    }
    testTooltip(elem: Cash, indicatorOptions: IndicatorOptions) {

        elem.trigger(ELEMENT_EVENTS.MOUSE_OVER);

        const selector = `.${ELEMENT_CLASSES.TOOLTIP}`;

        const tooltip = $(selector);
        expect(tooltip.length).toBeGreaterThan(0);
        expect(tooltip.text()).toBe(indicatorOptions.tooltipText);
        expect(tooltip.hasClass(indicatorOptions.tooltipClassName)).toBeTruthy();
        expect(tooltip.css('font-weight')).toEqual(`${indicatorOptions.tooltipStyles['font-weight']}`);
        expect(tooltip.css('color')).toEqual(`${indicatorOptions.tooltipStyles.color}`);

        elem.trigger(ELEMENT_EVENTS.MOUSE_OUT);
        expect($(selector).length).toBe(0);
    }
    generatePage(indicatorOptions: IndicatorOptions): void;
    generatePage(indicatorOptionsList: Array<IndicatorOptions>): void;
    generatePage(input: IndicatorOptions | Array<IndicatorOptions>): void {

        if (!(input instanceof Array)) {
            input = [input];
        }

        global.document.documentElement.innerHTML = `<body></body>`;

        const body = $('body');

        for (const indicatorOptions of input) {
            const attributes = this.indicatorOptionsToAttributes(indicatorOptions);
            const div = $(`<div></div>`);

            for (const [key, val] of Object.entries(attributes)) {
                div.attr(key, val);
            }

            body.append(div);
        }
    }
}

export default new TestHelper();