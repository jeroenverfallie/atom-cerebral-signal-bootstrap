# atom-cerebral-signal-bootstrap package

Quickly bootstrap signals/chains by adding imports and generating the different files.

Works on a structure like:

```
module/
    actions/
    chains/
    factories/
    signals/
    indexFileName.js
```

On files like `signals/signal.js`

```js
export default [
    someFactory(),
    anAction,
    ....
];
```

Or files like `module/signals.js`;

```js
export default {
    galleryOpened,
    ...
};
```

Or files like `module/indexFileName.js`;

```js
...
module.addSignals({
    galleryOpened,
    ....
}); // note the semi colon is important for this format.
```

## Settings

### Import sorting

Wether sort imports by type (action/factory/..) or by appearance, the order it finds them in your signal/..

### Addons

These names will be imported from `cerebral-addons`
