import $, {Cash} from 'cash-dom';
import {ELEMENT_CLASSES} from '../consts';
import {
    ClassNames,
    ElementStyles,
    IndicatorElementSettings,
    TooltipElementSettings} from '../types';

const getElement = ({ type, text, styles, classNames }: {
    type: string ,
    text?: string,
    styles?: ElementStyles,
    classNames?: Array<string> }) => {

    const elem = $(`<${type}>`);

    if (classNames?.length) {
        domManager.addClassesToElement(elem, classNames);
    }

    if (styles) {
        elem.css(styles);
    }

    if (text) {
        elem.text(text);
    }

    return elem;
};

const domManager = {
    getIndicator(params: IndicatorElementSettings) {

        const { text, styles, classNames } = params;

        let finalClassNames = [ELEMENT_CLASSES.INDICATOR];

        if (classNames?.length) {
            finalClassNames = finalClassNames.concat(classNames);
        }

        if (text) {
            finalClassNames.push(ELEMENT_CLASSES.INDICATOR_TEXT_STYLE);
        } else {
            finalClassNames.push(ELEMENT_CLASSES.INDICATOR_DOT_STYLE);
        }

        return getElement({
            text,
            type: 'span',
            styles,
            classNames: finalClassNames
        });
    },
    getTooltip(params: TooltipElementSettings): Cash {
        const tooltip = $('<div>');
        tooltip.addClass(ELEMENT_CLASSES.TOOLTIP);

        const { text, styles, classNames } = params;

        let finalClassNames = [ELEMENT_CLASSES.TOOLTIP];

        if (classNames?.length) {
            finalClassNames = finalClassNames.concat(classNames);
        }

        return getElement({
            type: 'div',
            text,
            styles,
            classNames: finalClassNames
        });
    },
    getStylesFromString(str: string) {
        try {
            return JSON.parse(str);
        } catch (e) {}
    },
    addClassesToElement(elem: Cash, classNames: ClassNames ) {
        for (const className of classNames) {
            if (className) {
                elem.addClass(className);
            }
        }
    }
}

export default domManager;