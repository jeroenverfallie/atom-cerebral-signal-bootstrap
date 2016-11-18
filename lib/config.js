'use babel';

import {default as defaultConfig} from 'cerebral-cli-generator/lib/config/defaultConfig.js';

export const options = {
    g1_general: {
        title: 'General',
        type: 'object',
        properties: {
            showNotification: {
                title: 'Show notification',
                description: 'Show a success notification after executing.',
                type: 'boolean',
                default: false
            },
            useRcFile: {
                title: 'Use cerebralrc file',
                type: 'boolean',
                default: true
            }
        }
    },
    g2_style: {
        title: 'Style',
        type: 'object',
        properties: {
            i1_imports: {
                title: '- Imports',
                type: 'object',
                properties: {
                    i1_semiColon: {
                        title: '- - Semicolon',
                        type: 'boolean',
                        default: true
                    },
                    i2_sortAll: {
                        title: '- - Sort all',
                        type: 'boolean',
                        default: true
                    },
                    i3_sortBy: {
                        title: '- - Sort by',
                        type: 'string',
                        default: 'type',
                        enum: ['type', 'appearance']
                    },
                    i4_separateGroups: {
                        title: '- - Separate groups',
                        type: 'string',
                        default: 'all',
                        enum: ['all', 'local', 'none']
                    },
                    i5_extension: {
                        title: '- - Add extension',
                        type: 'boolean',
                        default: true
                    }
                }
            },
            i2_indentation: {
                title: '- Indentation',
                type: 'string',
                default: '    '
            },
            i3_indentationPrefersEditorConfig: {
                title: '- Indentation prefers editorConfig',
                type: 'boolean',
                default: true
            }
        }
    },
    g3_specialImports: {
        title: 'Special imports',
        type: 'string',
        default: JSON.stringify(defaultConfig.specialImports, null, '\t')
    },
    g4_legacy: {
        title: 'Legacy',
        type: 'object',
        properties: {
            signalFiles: {
                title: 'Generate signal files',
                description: '(legacy) If enabled, there will be signal files, instead of just chains.',
                type: 'boolean',
                default: false
            }
        }
    },
    g5_templates: {
        title: 'Templates',
        description: 'Generated files will follow these templates. These **SHOULD be written with 2 space indentation** to respect the Identation setting above.',
        type: 'object',
        properties: {
            chain: {
                title: 'Chain',
                type: 'string',
                default: defaultConfig.templates.chain
            },
            signal: {
                title: 'Signal (only if enabled)',
                type: 'string',
                default: defaultConfig.templates.signal
            },
            actionFactory: {
                title: 'Action Factory',
                type: 'string',
                default: defaultConfig.templates.actionFactory
            },
            chainFactory: {
                title: 'Chain Factory',
                type: 'string',
                default: defaultConfig.templates.chainFactory
            },
            action: {
                title: 'Action',
                type: 'string',
                default: defaultConfig.templates.action
            }
        }
    }
};


export const keyMap = {
    g1_general: 'general',
    g2_style: 'style',
    i1_imports: 'imports',
    i1_semiColon: 'semiColon',
    i2_sortAll: 'sortAll',
    i3_sortBy: 'sortBy',
    i4_separateGroups: 'separateGroups',
    i5_extension: 'extension',
    i2_indentation: 'indentation',
    i3_indentationPrefersEditorConfig: 'indentationPrefersEditorConfig',
    g3_specialImports: 'specialImports',
    g4_legacy: 'legacy',
    g5_templates: 'templates',
};
