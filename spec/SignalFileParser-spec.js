'use babel';

import SignalFileParser from '../lib/SignalFileParser.js';

describe('SignalFileParser', () => {

    it('should fail on wrong files', () => {
        const content = `
            export default [];
        `;

        const result = SignalFileParser.parse(content);

        expect(result).toEqual(false);
    });

    it('should parse actions', () => {
        const content = `
            export default [
                actionA,
                actionB
            ];
        `;

        const expected = [{
            type: 'action',
            name: 'actionA'
        }, {
            type: 'action',
            name: 'actionB'
        }];

        const result = SignalFileParser.parse(content);

        expect(result).toEqual(expected);
    });

    it('should parse factories', () => {
        const content = `
            export default [
                factoryA(param),
                factoryB('test'),
                ...factoryC(namespaced.param)
            ];
        `;

        const expected = [{
            type: 'factory',
            name: 'factoryA'
        }, {
            type: 'factory',
            name: 'factoryB'
        }, {
            type: 'factory',
            name: 'factoryC'
        }];

        const result = SignalFileParser.parse(content);

        expect(result).toEqual(expected);
    });

    it('should parse chains', () => {
        const content = `
            export default [
                ...chainA,
                ...chainB
            ];
        `;

        const expected = [{
            type: 'chain',
            name: 'chainA'
        }, {
            type: 'chain',
            name: 'chainB'
        }];

        const result = SignalFileParser.parse(content);

        expect(result).toEqual(expected);
    });

    it('should parse outputs', () => {
        const content = `
            export default [
                actionA,
                actionB, {
                    outputA: [
                        ...chainA
                    ],
                    outputB: []
                },
                factoryA()
            ];
        `;

        const expected = [{
            type: 'action',
            name: 'actionA'
        }, {
            type: 'action',
            name: 'actionB',
            outputs: ['outputA', 'outputB']
        }, {
            type: 'chain',
            name: 'chainA'
        }, {
            type: 'factory',
            name: 'factoryA'
        }];

        const result = SignalFileParser.parse(content);

        expect(result).toEqual(expected);
    });

    it('should parse imports', () => {
        const content = `
            import actionB from '../actions/actionA.js';
            import factoryA from '../factories/factoryA.js';

            export default [
                actionA,
                actionB, {
                    outputA: [
                        ...chainA
                    ],
                    outputB: []
                },
                factoryA()
            ];
        `;

        const expected = [{
            type: 'action',
            name: 'actionA'
        }, {
            type: 'chain',
            name: 'chainA'
        }, {
            type: 'import',
            name: 'actionB',
            outputs: ['outputA', 'outputB']
        }, {
            type: 'import',
            name: 'factoryA'
        }];

        const result = SignalFileParser.parse(content);

        expect(result).toEqual(expected);
    });


    it('should parse deep nested things..uh', () => {
        const content = `
            import chainB from '../chains/chainB.js';

            export default [
                [
                    action,
                    actionA,
                    actionB, {
                        outputA: [
                            ...chainA
                        ],
                        outputB: [
                            factoryB(), {
                                outputA: [
                                    actionA,
                                    actionC, {
                                        outputB: [
                                            factoryC(), ...chainB
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ],
                factoryA()
            ];
        `;

        const expected = [{
            type: 'action',
            name: 'action'
        }, {
            type: 'action',
            name: 'actionA'
        }, {
            type: 'action',
            name: 'actionB',
            outputs: ['outputA', 'outputB']
        }, {
            type: 'action',
            name: 'actionC',
            outputs: ['outputB']
        }, {
            type: 'chain',
            name: 'chainA'
        }, {
            type: 'factory',
            name: 'factoryA'
        }, {
            type: 'factory',
            name: 'factoryB',
            outputs: ['outputA']
        }, {
            type: 'factory',
            name: 'factoryC'
        }, {
            type: 'import',
            name: 'chainB'
        }];

        const result = SignalFileParser.parse(content);

        expect(result).toEqual(expected);
    });

});
