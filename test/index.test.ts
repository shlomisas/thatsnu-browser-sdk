import {jest, describe, expect, test, afterEach, beforeAll} from '@jest/globals';
import { faker } from '@faker-js/faker';

// @ts-ignore
window.onThatsnuLoaded = jest.fn();

import sdk from '../src/index';
import App from '../src/app';
import domObserver from '../src/utils/domObserver';
import storage from '../src/utils/storage';
import {USER_CLICKED_ITEMS_STORAGE_KEY} from '../src/consts';
import domSubscriber from '../src/utils/domObserver';

describe('SDK', () => {

    let domSubscriberCallback: Function;

    beforeAll(() => {
        domObserver.observe = jest.fn(cb => {
            domSubscriberCallback = cb;
            domSubscriberCallback();
        });
        domObserver.dispose = jest.fn(() => {});
    });

    afterEach(() => {
        sdk.dispose();
        jest.clearAllMocks();
    });

    test('check async loading callback', async ()=> {

        // This one expected to be called from the line above before the imports

        // @ts-ignore
        expect(window.onThatsnuLoaded).toBeCalled();
    });

    test('init the SDK', async () => {

        const spyGenerate = jest.spyOn(App.prototype, 'generate');

        await sdk.init();
        expect(spyGenerate).toHaveBeenCalledTimes(1);
        expect(typeof domSubscriberCallback).toBe('function');
        domSubscriberCallback();
        expect(App.prototype.generate).toHaveBeenCalledTimes(2);

    });

    test('init sdk with initialState', async ()=> {

        const initialState = ['a', 'b', 'c'];

        await sdk.init({
            initialState
        });

        const expectedStateObj = initialState.reduce((acc: { [key: string]: boolean }, item: string ) => {
            acc[item] = true;
            return acc;
        }, {});

        expect(storage.getItem(USER_CLICKED_ITEMS_STORAGE_KEY)).toEqual(expectedStateObj);
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

    test('reset state', async ()=> {

        const initialState: Array<string> = [
            faker.commerce.product(),
            faker.commerce.product(),
            faker.commerce.product(),
            faker.commerce.product()
        ]

        await sdk.init({ initialState });

        sdk.resetState();

        const res = sdk.getState();
        expect(res.length).toBe(0);
    });

    test('prevent double init', async () => {
        // @ts-ignore
        window.thasnuInitialized = true;
        await sdk.init();
        expect(domSubscriber.observe).not.toHaveBeenCalled();
    });

    test('dispose sdk', async ()=> {

        const spyDispose = jest.spyOn(App.prototype, 'dispose');

        await sdk.init();
        sdk.dispose();

        expect(App.prototype.dispose).toBeCalled();
        expect(domObserver.dispose).toBeCalled();

        spyDispose.mockRestore();
    });
});