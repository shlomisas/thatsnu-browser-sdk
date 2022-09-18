import {jest, describe, expect, test, beforeAll} from '@jest/globals';
import { faker } from '@faker-js/faker';

// @ts-ignore
window.onThatsnuLoaded = jest.fn();

import sdk from '../src/index';
import App from '../src/app';
import domObserver from '../src/utils/domObserver';

describe('SDK', () => {

    let domSubscriberCallback: Function;

    beforeAll(() => {
        domObserver.observe = jest.fn(cb => {
            domSubscriberCallback = cb;
            domSubscriberCallback();
        });
        domObserver.dispose = jest.fn(() => {});

        App.prototype.generate = jest.fn(function () {});
        App.prototype.dispose = jest.fn(function () {});
    });

    test('check async loading callback', async ()=> {

        // This one expected to be called from the line above before the imports

        // @ts-ignore
        expect(window.onThatsnuLoaded).toBeCalled();
    });

    test('init the SDK', async () => {
        await sdk.init();
        expect(App.prototype.generate).toHaveBeenCalledTimes(1);
        expect(typeof domSubscriberCallback).toBe('function');
        domSubscriberCallback();
        expect(App.prototype.generate).toHaveBeenCalledTimes(2);

    });

    test('dispose sdk', ()=> {
        sdk.dispose();

        expect(App.prototype.dispose).toBeCalled();
        expect(domObserver.dispose).toBeCalled();
    });

    test('get state', async ()=> {

        const initialState: Array<string> = [
            faker.commerce.product(),
            faker.commerce.product(),
            faker.commerce.product(),
            faker.commerce.product()
        ]

        await sdk.init({ initialState });

        const res = sdk.getState();

        expect(initialState).toEqual(expect.arrayContaining(res));
        expect(res).toEqual(expect.arrayContaining(initialState));
    });
});