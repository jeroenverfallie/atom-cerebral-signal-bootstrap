'use babel';

const t = `export default (FACTORYARGUMENTS) => {
    function IDENTIFIER({ARGUMENTS}) {
        throw new Error('Unimplemented cerebral factory IDENTIFIER');
    }
OUTPUTS
    return IDENTIFIER;
};
`;

export default (fac) => {
    const args = fac.outputs ? ['input', 'state', 'output'] : ['input', 'state'];
    const outputs = fac.outputs ? '    ' + fac.identifier + '.outputs = [\'' + fac.outputs.join('\', \'') + '\'];\n' : '';

    const factoryArgs = fac.argumentCount ? new Array(fac.argumentCount).join(',').split(',').map((item, i) => 'arg' + (i+1)) : '';

    let content = t
        .replace(/IDENTIFIER/g, fac.identifier)
        .replace(/FACTORYARGUMENTS/g, factoryArgs.join(', '))
        .replace(/ARGUMENTS/g, args.join(', '))
        .replace(/OUTPUTS/g, outputs);

    return content;
};
