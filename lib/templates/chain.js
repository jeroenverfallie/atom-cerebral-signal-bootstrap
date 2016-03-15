'use babel';

const t = `export default [
    () => throw new Error('Unimplemented cerebral chain NAME')
];
`;

export default (chain) => {
    const content = t.replace(/NAME/g, chain.name);

    return content;
};
