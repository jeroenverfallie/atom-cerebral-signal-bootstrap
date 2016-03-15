'use babel';

const t = `export default () => {
    function NAME({ARGUMENTS}) {
        throw 'Unimplemented cerebral factory NAME';
    }
    OUTPUTS
    return NAME;
}
`;

export default (fac) => {
    const args = fac.outputs ? ['input, output'] : ['input', 'state'];
    const outputs = fac.outputs ? fac.name + '.outputs = [\'' + fac.outputs.join('\', \'') + '\'];\n' : '';

    let content = t
        .replace(/NAME/g, fac.name)
        .replace(/ARGUMENTS/g, args.join(', '))
        .replace(/OUTPUTS/g, outputs);

    return content;
};
