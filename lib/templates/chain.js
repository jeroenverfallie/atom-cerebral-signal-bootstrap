'use babel';

const t = `export default [
    () => throw new Error('Unimplemented cerebral chain IDENTIFIER')
];
`;

export default (chain) => {
    const content = t.replace(/NAME/g, chain.identifier);

    return content;
};
