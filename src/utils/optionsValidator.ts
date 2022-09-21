import {IndicatorOptions, IndicatorOptionsList} from '../types';
import domManager from './domManager';

const validateOption = (optionName: string, value: any): boolean => {
    try {
        switch(optionName) {
            case IndicatorOptionsList.id:
                if (!value) {
                    throw new Error(`ID must be provided`);
                }
                break;
            case IndicatorOptionsList.expiration:
                if (value && (!(value instanceof Date) || isNaN(value.getTime()))) {
                    throw new Error(`Expiration must be a valid date`);
                }
                break;
            case IndicatorOptionsList.className:
            case IndicatorOptionsList.tooltipClassName:
                if (value && (typeof value !== 'string' || /\s/.test(value))) {
                    throw new Error(`className must be a string and without spaces`);
                }
                break;
            case IndicatorOptionsList.styles:
            case IndicatorOptionsList.tooltipStyles:
                if (value && typeof value !== 'object'){
                    throw new Error(`styles must be an object with valid CSS rules`);
                }
                break;
        }

        return true;
    } catch(e) {
        throw new Error(`Invalid option '${optionName}' | ${e.message}`);
    }
};

export default {
    normalizeAttribute(optionName: string, value: any): any {

        switch(optionName) {
            case IndicatorOptionsList.expiration:
                if (typeof value === 'string') {
                    const date = new Date(value);
                    if (!(date instanceof Date) || isNaN(date.getTime())) {
                        throw new Error('Invalid expiration date');
                    }
                    return date;
                }
                break;
            case IndicatorOptionsList.styles:
            case IndicatorOptionsList.tooltipStyles:
                if (typeof value === 'string'){
                    return domManager.getStylesFromString(value);
                }
                break;
        }

        return value;
    },
    validate(options: IndicatorOptions) {

        const optionKeys = Object.keys(options);
        const validOptions = Object.keys(IndicatorOptionsList);

        for (const key of optionKeys) {
            if (!validOptions.includes(key)) {
                throw new Error(`Invalid indicator option: ${key}`);
            }

            validateOption(key, options[key as keyof IndicatorOptions]);
        }
    }
}