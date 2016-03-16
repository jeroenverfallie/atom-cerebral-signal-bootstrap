'use babel';

import SignalDefinitionsFileParser from '../lib/SignalDefinitionsFileParser.js';

describe('SignalDefinitionsFileParser', () => {

    it('should fail on wrong files', () => {
        const content = `
            export default [];
        `;

        const result = SignalDefinitionsFileParser.parse(content);

        expect(result).toEqual(false);
    });


    it('should parse on right files', () => {
        const content = `
            export default {
                something,
                athing: otherThing
            };
        `;

        const expected = ['otherThing', 'something'];

        const result = SignalDefinitionsFileParser.parse(content);

        expect(result).toEqual(expected);
    });


    it('should parse everything', () => {
        const content = `
            import abc from '....';

            export default {
                something: something,
                athing: otherThing,
                another,
                thing: abc
            };
        `;

        const expected = ['another', 'otherThing', 'something'];

        const result = SignalDefinitionsFileParser.parse(content);

        expect(result).toEqual(expected);
    });

});
