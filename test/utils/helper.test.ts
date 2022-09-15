import {describe, expect, test} from '@jest/globals';

import helper from '../../src/utils/helper';

describe('helper', ()=> {
    test('check parseLevel', ()=>{

        const combs = [{
            input: `a`,
            output: {
                firstLevel: 'a',
                secondLevel: undefined,
                level: `a`
            }
        }, {
            input: `a.b`,
            output: {
                firstLevel: 'a',
                secondLevel: 'b',
                level: `a.b`
            }
        }, {
            input: `a.b.c`,
            output: {
                firstLevel: 'a',
                secondLevel: 'b',
                level: `a.b.c`
            }
        }]

        for (const comb of combs) {
            expect(helper.parseLevel(comb.input)).toMatchObject(comb.output);
        }

        try {
            expect(helper.parseLevel(''));
        } catch(e) {
            expect(e.message).toEqual('Invalid level')
        }
    });
});