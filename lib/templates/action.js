'use babel';

const t = `function IDENTIFIER({ARGUMENTS}) {
    throw new Error('Unimplemented cerebral action IDENTIFIER');
}
OUTPUTS
export default IDENTIFIER;
`;

export default (action) => {
    const args = action.outputs ? ['input', 'state', 'output'] : ['input', 'state'];
    const outputs = action.outputs ? action.identifier + '.outputs = [\'' + action.outputs.join('\', \'') + '\'];\n' : '';

    let content = t
        .replace(/IDENTIFIER/g, action.identifier)
        .replace(/ARGUMENTS/g, args.join(', '))
        .replace(/OUTPUTS/g, outputs);

    return content;
};
