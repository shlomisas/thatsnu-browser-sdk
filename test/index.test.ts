// @ts-ignore
window.onWhatsNewLoaded = jest.fn();

import {describe, expect, test} from '@jest/globals';
import { faker } from '@faker-js/faker';

import sdk from '../src/index';
import App from '../src/app';
import domSubscriber from '../src/utils/domSubscriber';
import helper from '../src/utils/helper';

describe('SDK', () => {

    const userId: string = faker.datatype.number().toString();

    let domSubscriberCallback: Function;

    beforeAll(() => {
        domSubscriber.subscribe = jest.fn(cb => {
            domSubscriberCallback = cb;
            domSubscriberCallback();
        });
        domSubscriber.dispose = jest.fn(() => {});

        App.prototype.generate = jest.fn(function () {});
        App.prototype.dispose = jest.fn(function () {});
    });

    test('check async loading callback', async ()=> {

        // This one expected to be called from the line above before the imports

        // @ts-ignore
        expect(window.onWhatsNewLoaded).toBeCalled();
    });

    test('init the SDK', async () => {
        await sdk.init({ userId });
        expect(App.prototype.generate).toHaveBeenCalledTimes(1);
        expect(typeof domSubscriberCallback).toBe('function');
        domSubscriberCallback();
        expect(App.prototype.generate).toHaveBeenCalledTimes(2);

    });

    test('generate element id', ()=> {
        const group = faker.commerce.product();
        const primitiveId = faker.datatype.uuid();
        const complexId = {
            id: faker.datatype.uuid(),
            name: faker.name.firstName()
        }

        const res1 = sdk.generateId(group);
        const res2 = sdk.generateId(group, primitiveId);
        const res3 = sdk.generateId(group, complexId);

        expect(res1).toEqual(group);
        expect(res2).toEqual(`${group}.${helper.getSha1(primitiveId)}`);
        expect(res3).toEqual(`${group}.${helper.getSha1(JSON.stringify(complexId))}`);
    });

    test('dispose sdk', ()=> {
        sdk.dispose();

        expect(App.prototype.dispose).toBeCalled();
        expect(domSubscriber.dispose).toBeCalled();
    });

    test('get user state', async ()=> {

        const userState: Array<string> = [
            faker.commerce.product(),
            faker.commerce.product(),
            faker.commerce.product(),
            faker.commerce.product()
        ]

        await sdk.init({ userId, userState });

        const res = sdk.getUserState();

        expect(userState).toEqual(expect.arrayContaining(res));
        expect(res).toEqual(expect.arrayContaining(userState));
    });
});