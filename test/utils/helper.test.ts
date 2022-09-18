import {describe, expect, test} from '@jest/globals';

import helper from '../../src/utils/helper';

describe('helper', ()=> {
    test('check parseLevel', ()=>{

        const combs = [{
            input: `a`,
            output: 'a'
        }, {
            input: `a.b`,
            output: 'a'
        }, {
            input: `a.b.c`,
            output: 'a'
        }]

        for (const comb of combs) {
            expect(helper.getGroupFromId(comb.input)).toBe(comb.output);
        }

        try {
            expect(helper.getGroupFromId(''));
        } catch(e) {
            expect(e.message).toEqual('Invalid level')
        }
    });
});