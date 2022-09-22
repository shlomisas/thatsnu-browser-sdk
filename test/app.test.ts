import {describe, expect, test, afterEach, jest} from '@jest/globals';
import $, {Cash} from 'cash-dom';
import {faker} from '@faker-js/faker';

import App from '../src/app';
import {
    INPUT_DOM_ATTRIBUTES,
    ELEMENT_CLASSES,
    OUTPUT_DOM_ATTRIBUTES,
    INDICATOR_ERRORS,
    ELEMENT_EVENTS
} from '../src/consts';
import {IndicatorAttributes, IndicatorOptions} from '../src/types';
import testHelper from './testHelper';
import moment from 'moment';

describe('App', () => {

    afterEach(() => {
        localStorage.clear();
        global.document.documentElement.innerHTML = '';
    });

    describe('indicator types', () => {
        test('check simple dot indicator', () => {

            const feature: IndicatorOptions = {
                id: faker.commerce.product()
            };

            global.document.documentElement.innerHTML = `<body><div data-tnu-id="${feature.id}"></div></body>`

            const app = new App();
            app.generate();
            const elem = $(`[${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}="${feature.id}"]`).find(`.${ELEMENT_CLASSES.INDICATOR}`);
            expect(elem.hasClass(ELEMENT_CLASSES.INDICATOR_DOT_STYLE)).toBeTruthy();
        });

        test('check simple text indicator', () => {

            const feature: IndicatorOptions = {
                id: faker.commerce.product(),
                text: faker.music.genre()
            };

            global.document.documentElement.innerHTML = `<body><div data-tnu-id="${feature.id}" data-tnu-text="${feature.text}"></div></body>`

            const app = new App();
            app.generate();
            const elem = $(`[${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}="${feature.id}"]`).find(`.${ELEMENT_CLASSES.INDICATOR}`);
            expect(elem.hasClass(ELEMENT_CLASSES.INDICATOR_TEXT_STYLE)).toBeTruthy();
        });
    });

    describe('indicator options', () => {
        test('check indicator by HTML attributes', () => {

            const ids = [
                faker.datatype.uuid(),
                faker.datatype.uuid()
            ];

            global.document.documentElement.innerHTML = `<body></body>`;

            const indicators: { [key: string]: IndicatorOptions } = {};
            for (const id of ids) {
                const indicatorOptions: IndicatorOptions = testHelper.generateIndicatorOption(id);
                const indicatorAttributes: IndicatorAttributes = testHelper.indicatorOptionsToAttributes(indicatorOptions);

                const div: Cash = $('<div>');
                for (const key of Object.keys(indicatorAttributes)) {
                    div.attr(key, indicatorAttributes[key as keyof IndicatorAttributes]);
                }

                $(global.document.body).append(div);
                indicators[id] = indicatorOptions;
            }

            const app = new App();

            app.generate();


            for (const id of ids) {
                const parent = $(`[${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}="${id}"]`);
                const elem = parent.find(`.${ELEMENT_CLASSES.INDICATOR}`);
                testHelper.testElem(elem, indicators[id]);
            }
        });

        test('check indicator by JS options', () => {

            const ids = [
                faker.datatype.uuid(),
                faker.datatype.uuid()
            ];

            global.document.documentElement.innerHTML = `<body></body>`;

            const indicators: Array<IndicatorOptions> = [];
            for (const id of ids) {
                $('body').append(`<div data-tnu-id="${id}"></div>`);
                indicators.push(testHelper.generateIndicatorOption(id));
            }

            const app = new App({
                indicators
            });

            app.generate();

            for (const id of ids) {
                const elem = $(`[${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}="${id}"]`).find(`.${ELEMENT_CLASSES.INDICATOR}`);
                const indicatorOptions = indicators.find(item => item.id === id);
                testHelper.testElem(elem, indicatorOptions);
            }
        });

        test('check indicator onClick', () => {

            const id = faker.datatype.uuid();

            global.document.documentElement.innerHTML = `<body></body>`;
            $('body').append(`<div data-tnu-id="${id}"></div>`);

            let markAsRead = false;
            const app = new App({
                onClick: jest.fn(() => {
                    return markAsRead;
                })
            });

            app.generate();

            const elem = testHelper.getIndicator(id);
            expect(testHelper.getIndicator(id).length).toBe(1);

            elem.trigger('click');
            expect(testHelper.getIndicator(id).length).toBe(1);

            markAsRead = true;
            elem.trigger('click');
            expect(testHelper.getIndicator(id).length).toBe(0);
        });

        test('check indicator tooltip', () => {

            const ids = [
                faker.datatype.uuid()
            ];

            global.document.documentElement.innerHTML = `<body></body>`;

            const indicators: Array<IndicatorOptions> = [];
            for (const id of ids) {
                $('body').append(`<div data-tnu-id="${id}"></div>`);
                indicators.push(testHelper.generateIndicatorOption(id));
            }

            const app = new App({
                indicators
            });

            app.generate();

            for (const id of ids) {
                const elem = $(`[${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}="${id}"]`).find(`.${ELEMENT_CLASSES.INDICATOR}`);
                const indicatorOptions = indicators.find(item => item.id === id);
                testHelper.testTooltip(elem, indicatorOptions);
            }
        });

        test('check invalid attribute', () => {

            const invalidAttributeName = 'data-tnu-invalid-attr';
            const id = faker.datatype.uuid();
            global.document.documentElement.innerHTML = `<body></body>`;
            $('body').append(`<div data-tnu-id="${id}" ${invalidAttributeName}="some data"></div>`);

            const app = new App();

            const spy = jest.spyOn(console, 'log');
            app.generate();
            expect(spy).toHaveBeenCalledWith(`Invalid Thatsnu attribute: ${invalidAttributeName}`);
        });
    });

    describe('indicator clicks', () => {
        test('check indicator simple click', async () => {

            const ids = [
                faker.datatype.uuid(),
                faker.datatype.uuid()
            ];

            global.document.documentElement.innerHTML = `<body></body>`;

            for (const id of ids) {
                $('body').append(`<div data-tnu-id="${id}"></div>`);
            }

            const app = new App();
            app.generate();

            for (const id of ids) {
                const selector = `[${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}="${id}"]`;

                const elemBeforeClick = $(selector).find(`.${ELEMENT_CLASSES.INDICATOR}`);
                expect(elemBeforeClick.length).toBe(1);

                elemBeforeClick.trigger('click');

                const elemAfterClick = $(selector).find(`.${ELEMENT_CLASSES.INDICATOR}`);
                expect(elemAfterClick.length).toBe(0);
            }
        });

        test('check indicator that has already click', async () => {

            const ids = [
                faker.datatype.uuid(),
                faker.datatype.uuid()
            ];

            global.document.documentElement.innerHTML = `<body></body>`;

            for (const id of ids) {
                $('body').append(`<div data-tnu-id="${id}"></div>`);
            }

            const app = new App();
            app.generate();

            const selector1 = `[${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}="${ids[0]}"]`;
            const selector2 = `[${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}="${ids[1]}"]`;

            const elem1BeforeClick = $(selector1).find(`.${ELEMENT_CLASSES.INDICATOR}`);
            expect(elem1BeforeClick.length).toBe(1);

            const elem2BeforeClick = $(selector2).find(`.${ELEMENT_CLASSES.INDICATOR}`);
            expect(elem2BeforeClick.length).toBe(1);

            elem1BeforeClick.trigger('click');

            // Simulate page reload
            global.document.documentElement.innerHTML = `<body></body>`;

            for (const id of ids) {
                $('body').append(`<div data-tnu-id="${id}"></div>`);
            }

            const elem1AfterRefresh = $(selector1).find(`.${ELEMENT_CLASSES.INDICATOR}`);
            expect(elem1AfterRefresh.length).toBe(0);

            app.generate();

            const elem1AfterReGenerate = $(selector1).find(`.${ELEMENT_CLASSES.INDICATOR}`);
            expect(elem1AfterReGenerate.length).toBe(0);

            const elem2AfterReGenerate = $(selector2).find(`.${ELEMENT_CLASSES.INDICATOR}`);
            expect(elem2AfterReGenerate.length).toBe(1);
        });
    });

    describe('nested indicators', () => {
        test('check nested indicators clicks', ()=>{
            const genId = faker.datatype.uuid();

            const ids = [
                genId,
                `${genId}.nested`
            ];

            global.document.documentElement.innerHTML = `<body></body>`;

            for (const id of ids) {
                $('body').append(`<div data-tnu-id="${id}"></div>`);
            }

            const app = new App();
            app.generate();

            const selector1 = `[${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}="${ids[0]}"]`;
            const selector2 = `[${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}="${ids[1]}"]`;

            const elem1BeforeClick = $(selector1).find(`.${ELEMENT_CLASSES.INDICATOR}`);
            expect(elem1BeforeClick.length).toBe(1);

            const elem2BeforeClick = $(selector2).find(`.${ELEMENT_CLASSES.INDICATOR}`);
            expect(elem2BeforeClick.length).toBe(1);

            elem2BeforeClick.trigger('click');

            const elem1AfterClick = $(selector1).find(`.${ELEMENT_CLASSES.INDICATOR}`);
            expect(elem1AfterClick.length).toBe(0);

            const elem2AfterClick = $(selector2).find(`.${ELEMENT_CLASSES.INDICATOR}`);
            expect(elem2AfterClick.length).toBe(0);
        });

        test('check nested indicators wildcard', ()=>{
            const genId = faker.datatype.uuid();
            const ids = [
                genId,
                `${genId}.child1`,
                `${genId}.child2`
            ];

            global.document.documentElement.innerHTML = `<body></body>`;

            const dict: { [key: string]: boolean } = {};
            const indicators: Array<IndicatorOptions> = [];
            for (const id of ids) {

                const isParent = id === ids[0]
                const finalId = isParent ? id : `${ids[0]}.*`;

                $('body').append(`<div data-tnu-id="${id}"></div>`);

                if (dict[finalId]) continue;

                indicators.push({
                    ...testHelper.generateIndicatorOption(id, {
                        color: !isParent
                    }),
                    id: finalId
                });

                dict[finalId] = true;
            }

            const app = new App({
                indicators
            });

            app.generate();

            for (const id of ids) {

                const elem = $(`[${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}="${id}"]`).find(`.${ELEMENT_CLASSES.INDICATOR}`);

                let indicatorOptions: IndicatorOptions;

                if (id === ids[0]) {
                    indicatorOptions = indicators[0];
                } else {
                    indicatorOptions = {
                        ...indicators[1],
                        id
                    };
                }

                testHelper.testElem(elem, indicatorOptions);
            }
        });

        test('check child get parent color', () => {
            const genId = faker.datatype.uuid();

            const indicators: Array<IndicatorOptions> = [
                testHelper.generateIndicatorOption(genId),
                testHelper.generateIndicatorOption(`${genId}.nested`)
            ];

            global.document.documentElement.innerHTML = `<body></body>`;

            for (const indicator of indicators) {
                $('body').append(`<div data-tnu-id="${indicator.id}"></div>`);
            }

            const app = new App({
                indicators
            });

            app.generate();

            const selector1 = `[${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}="${indicators[0].id}"]`;
            const selector2 = `[${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}="${indicators[0].id}"]`;

            const elem1 = $(selector1).find(`.${ELEMENT_CLASSES.INDICATOR}`);
            expect(elem1.length).toBe(1);

            const elem2 = $(selector2).find(`.${ELEMENT_CLASSES.INDICATOR}`);
            expect(elem2.length).toBe(1);

            expect(elem2.css('background-color')).toEqual(elem1.css('background-color'));
        });
    });

    test('prevent regenerate of same indicator', ()=>{

        const ids = [
            faker.datatype.uuid(),
            faker.datatype.uuid()
        ];

        global.document.documentElement.innerHTML = `<body></body>`;

        for (const id of ids) {
            $('body').append(`<div data-tnu-id="${id}"></div>`);
        }

        const app = new App();
        app.generate();

        const selector1 = `[${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}="${ids[0]}"]`;
        const selector2 = `[${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}="${ids[1]}"]`;

        const elemBeforeClick = $(selector1).find(`.${ELEMENT_CLASSES.INDICATOR}`);
        expect(elemBeforeClick.length).toBe(1);

        elemBeforeClick.trigger('click');

        const elemAfterClick = $(selector1).find(`.${ELEMENT_CLASSES.INDICATOR}`);
        expect(elemAfterClick.length).toBe(0);

        app.generate();

        const elemAfterRegenerate = $(selector1).find(`.${ELEMENT_CLASSES.INDICATOR}`);
        expect(elemAfterRegenerate.length).toBe(0);

        const elem2 = $(selector2).find(`.${ELEMENT_CLASSES.INDICATOR}`);
        expect(elem2.length).toBe(1);

        app.generate();

        const elem2AfterRegenerate = $(selector2).find(`.${ELEMENT_CLASSES.INDICATOR}`);
        expect(elem2AfterRegenerate.length).toBe(1);
    });

    test('check expired indicator via JS options', ()=>{

        const ids = [
            faker.datatype.uuid()
        ];

        global.document.documentElement.innerHTML = `<body></body>`;

        for (const id of ids) {
            $('body').append(`<div data-tnu-id="${id}"></div>`);
        }

        const id = ids[0];

        const app = new App({
            indicators: [{
                id,
                expiration: moment().subtract(1, 'day').toDate()
            }]
        });

        app.generate();

        const selector = `[${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}="${ids[0]}"]`;

        const elem = $(selector);
        expect(elem.length).toBe(1);
        expect(elem.attr(OUTPUT_DOM_ATTRIBUTES.ERROR)).toEqual(`${INDICATOR_ERRORS.ITEM_EXPIRED}`);
    });

    test('check expired indicator via HTML attributes', ()=>{

        const id = faker.datatype.uuid();
        const expiration = moment().add(1, 'days');

        global.document.documentElement.innerHTML = `<body></body>`;

        const body = $('body');

        body.append(
            `<div ${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}="${id}" ${INPUT_DOM_ATTRIBUTES.INDICATOR_EXPIRATION}="${expiration.toISOString()}"></div>`
        );

        const app = new App();
        app.generate();

        const indicator = testHelper.getIndicator(id);
        expect(indicator.length).toEqual(1);

        app.dispose();

        body.append(
            `<div ${INPUT_DOM_ATTRIBUTES.INDICATOR_ID}="${id}" ${INPUT_DOM_ATTRIBUTES.INDICATOR_EXPIRATION}="invalid date"></div>`
        );

        try {
            app.generate();
            expect(1).toBe(2); // never should be reached
        } catch(e) {
            expect(e.message).toBe('Invalid expiration date');
        }
    });

    describe('dispose', () => {
        test('check tooltip', () => {

            const id = faker.datatype.uuid();

            testHelper.generatePage({
                id
            });

            const app = new App();
            app.generate();

            const indicator = testHelper.getIndicator(id);
            indicator.trigger(ELEMENT_EVENTS.MOUSE_OVER);

            const selector = `.${ELEMENT_CLASSES.TOOLTIP}`;

            expect($(selector).length).toBe(1);
            app.dispose();
            expect($(selector).length).toBe(0);

        });

        test('check parent and indicator cleanup', () => {

            const id = faker.datatype.uuid();

            testHelper.generatePage({
                id
            });

            const app = new App();
            app.generate();

            expect(testHelper.getIndicatorParent(id).length).toBe(1);
            expect(testHelper.getIndicator(id).length).toBe(1);

            app.dispose();

            expect(testHelper.getIndicatorParent(id).attr(INPUT_DOM_ATTRIBUTES.INDICATOR_ID)).toBeUndefined();
            expect(testHelper.getIndicator(id).length).toBe(0);

        });

        test('check indicator events cleanup', () => {

            const id = faker.datatype.uuid();

            testHelper.generatePage({
                id
            });

            const app = new App({
                onClick() {
                    return false;
                }
            });
            app.generate();

            const indicator = testHelper.getIndicator(id);
            expect(indicator.length).toBe(1);

            const mocks: { [key: string]: Function } = {};

            for (const eventName of Object.values(ELEMENT_EVENTS)) {
                const mockFn = jest.fn();
                mocks[eventName] = mockFn;
                indicator.on(eventName, mockFn);
                indicator.trigger(eventName);
                expect(mockFn).toBeCalled();
                mockFn.mockClear();
            }

            app.dispose();

            for (const eventName of Object.values(ELEMENT_EVENTS)) {
                indicator.trigger(eventName);
                expect(mocks[eventName]).toBeCalledTimes(0);
            }

        });
    });
});