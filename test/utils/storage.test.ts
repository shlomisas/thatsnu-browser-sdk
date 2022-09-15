import {describe, expect, test} from '@jest/globals';

import storage from '../../src/utils/storage';

describe('storage', ()=> {

    const key = 'storageKey';

    test('check all', ()=>{

        const combs = [5, 'aaa', { a: 1, b: 'bbb' }]

        for (const comb of combs) {
            storage.setItem(key, comb);
            expect(storage.getItem(key)).toEqual(comb);
            storage.removeItem(key);
            expect(storage.getItem(key)).toBeNull();
        }
    });
});