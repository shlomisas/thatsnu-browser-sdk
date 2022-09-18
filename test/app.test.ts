import {jest, describe, expect, test} from '@jest/globals';

// @ts-ignore
window.onThatsnuLoaded = jest.fn();

import App from '../src/app';

describe('App', () => {
    test('TODO', () => {
        expect(1).toBe(1);
    });
});