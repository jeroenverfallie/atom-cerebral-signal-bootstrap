'use babel';

const t = `function NAME({ARGUMENTS}) {

}
OUTPUTS
export default NAME;
`;

export default (action) => {
    const args = action.outputs ? ['input, output'] : ['input', 'state'];
    const outputs = action.outputs ? action.name + '.outputs = [\'' + action.outputs.join('\', \'') + '\'];\n' : '';

    let content = t
        .replace(/NAME/g, action.name)
        .replace(/ARGUMENTS/g, args.join(', '))
        .replace(/OUTPUTS/g, outputs);

    return content;
};
