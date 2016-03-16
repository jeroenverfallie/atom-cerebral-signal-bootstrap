'use babel';

const t = `export default (FACTORYARGUMENTS) => {
    function NAME({ARGUMENTS}) {
        throw new Error('Unimplemented cerebral factory NAME');
    }
OUTPUTS
    return NAME;
};
`;

export default (fac) => {
    const args = fac.outputs ? ['input', 'state', 'output'] : ['input', 'state'];
    const outputs = fac.outputs ? '    ' + fac.name + '.outputs = [\'' + fac.outputs.join('\', \'') + '\'];\n' : '';

    const factoryArgs = fac.argumentCount ? new Array(fac.argumentCount).join(',').split(',').map((item, i) => 'arg' + (i+1)) : '';

    let content = t
        .replace(/NAME/g, fac.name)
        .replace(/FACTORYARGUMENTS/g, factoryArgs)
        .replace(/ARGUMENTS/g, args.join(', '))
        .replace(/OUTPUTS/g, outputs);

    return content;
};
