import $, {Cash} from 'cash-dom';
import {ELEMENT_CLASSES} from '../consts';

type ElementStyles = { [key: string]: string };

export default {
    getElement({ styles }: { styles: ElementStyles } ) {
        const wnElem = $('<span>');
        wnElem.addClass(ELEMENT_CLASSES.MAIN);
        wnElem.css(styles);
        return wnElem;
    },
    getTooltip({ text }: { text: string }): Cash {
        const tooltip = $('<div>');
        tooltip.addClass(ELEMENT_CLASSES.TOOLTIP);
        tooltip.text(text);
        return tooltip;
    }
}