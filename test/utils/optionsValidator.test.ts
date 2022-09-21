import {describe, expect, test} from '@jest/globals';
import { faker } from '@faker-js/faker';
import optionsValidator from '../../src/utils/optionsValidator';

describe('optionsValidator', () => {

    test('check normalizeAttribute - expiration', () => {
        const now = new Date();
        const res = optionsValidator.normalizeAttribute('expiration', now.toISOString());
        expect(now.toISOString()).toEqual(res.toISOString());

        try {
            optionsValidator.normalizeAttribute('expiration', 'some invalid date');
            expect(1).toBe(2); // never should be reached
        } catch(e) {
            expect(e.message).toBe('Invalid expiration date');
        }

        expect(optionsValidator.normalizeAttribute('expiration', now)).toBe(now);
    });

    test('check normalizeAttribute - styles', () => {
        const styles = faker.datatype.json();
        const stylesObj = JSON.parse(styles)

        expect(optionsValidator.normalizeAttribute('styles', stylesObj)).toMatchObject(stylesObj);
        expect(optionsValidator.normalizeAttribute('styles', stylesObj)).toMatchObject(stylesObj);

        expect(optionsValidator.normalizeAttribute('tooltipStyles', stylesObj)).toMatchObject(stylesObj);
        expect(optionsValidator.normalizeAttribute('tooltipStyles', stylesObj)).toMatchObject(stylesObj);
    });

    test('check invalid option', () => {

        const invalidKey = 'sssssss';

        try {
            // @ts-ignore
            optionsValidator.validate({ [invalidKey]: true });
        } catch(e) {
            expect(e.message).toEqual(`Invalid indicator option: ${invalidKey}`);
        }
    });

    test('check valid option with invalid value', () => {

        const invalidVars: Array<Record<string, any>> = [{
            key: 'id',
            value: undefined,
            expectedError: 'ID must be provided'
        }, {
            key: 'expiration',
            value: new Date('sss'),
            expectedError: 'Expiration must be a valid date'
        }, {
            key: 'className',
            value: new Date('sss dsdsds sdsds'),
            expectedError: 'className must be a string and without spaces'
        }, {
            key: 'tooltipStyles',
            value: 'ssss',
            expectedError: 'styles must be an object with valid CSS rules'
        }];

        for (const invalidVar of invalidVars) {
            try {
                optionsValidator.validate({
                    [`${invalidVar.key}`]: invalidVar.value
                })
            } catch(e) {
                expect(e.message).toEqual(`Invalid option '${invalidVar.key}' | ${invalidVar.expectedError}`);
            }
        }
    });
});