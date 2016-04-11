'use babel';

const t = `export default (FACTORYARGUMENTS) => {
  function IDENTIFIER({ARGUMENTS}) {
    throw new Error('Unimplemented cerebral factory IDENTIFIER');
  }
OUTPUTSASYNC
  return IDENTIFIER;
};
`;

export default (fac) => {
    const args = fac.outputs ? ['input', 'state', 'output'] : ['input', 'state'];
    const outputs = fac.outputs ? '  ' + fac.identifier + '.outputs = [\'' + fac.outputs.join('\', \'') + '\'];\n' : '';
    const async = fac.async ? '  ' + fac.identifier + '.async = true;\n' : '';
    const factoryArgs = fac.argumentCount ? new Array(fac.argumentCount).join(',').split(',').map((item, i) => 'arg' + (i+1)) : [];

    let content = t
        .replace(/IDENTIFIER/g, fac.identifier)
        .replace(/FACTORYARGUMENTS/g, factoryArgs.join(', '))
        .replace(/ARGUMENTS/g, args.join(', '))
        .replace(/OUTPUTS/g, outputs)
        .replace(/ASYNC/g, async);

    return content;
};
