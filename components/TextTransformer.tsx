
import React, { useState, useEffect } from 'react';

type TransformationType =
    | 'uppercase' | 'lowercase' | 'capitalize' | 'titleCase' | 'sentenceCase'
    | 'camelCase' | 'pascalCase' | 'snakeCase' | 'kebabCase' | 'constantCase'
    | 'dotCase' | 'pathCase' | 'alternatingCase' | 'inverseCase' | 'toggleCase'
    | 'removeAccents' | 'normalize' | 'removeDuplicates' | 'removeInvisible'
    | 'trim' | 'compactSpaces' | 'base64Encode' | 'base64Decode'
    | 'urlEncode' | 'urlDecode' | 'htmlEncode' | 'htmlDecode'
    | 'markdown' | 'html' | 'plain' | 'regex';

const TextTransformer: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [selectedTransform, setSelectedTransform] = useState<TransformationType>('uppercase');
    const [regexPattern, setRegexPattern] = useState('');
    const [regexReplace, setRegexReplace] = useState('');
    const [regexFlags, setRegexFlags] = useState('g');
    const [history, setHistory] = useState<Array<{ input: string, output: string, transform: string, timestamp: number }>>([]);
    const [copied, setCopied] = useState(false);

    // Load history from localStorage
    useEffect(() => {
        const savedHistory = localStorage.getItem('textTransformerHistory');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    // Transformation functions
    const transforms: Record<TransformationType, (text: string) => string> = {
        // Case transformations
        uppercase: (text) => text.toUpperCase(),
        lowercase: (text) => text.toLowerCase(),
        capitalize: (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(),
        titleCase: (text) => text.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()),
        sentenceCase: (text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(),
        camelCase: (text) => text.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
            index === 0 ? match.toLowerCase() : match.toUpperCase()
        ).replace(/\s+/g, ''),
        pascalCase: (text) => text.replace(/(?:^\w|[A-Z]|\b\w)/g, (match) => match.toUpperCase()).replace(/\s+/g, ''),
        snakeCase: (text) => text.replace(/\W+/g, ' ').split(/ |\B(?=[A-Z])/).map(word => word.toLowerCase()).join('_'),
        kebabCase: (text) => text.replace(/\W+/g, ' ').split(/ |\B(?=[A-Z])/).map(word => word.toLowerCase()).join('-'),
        constantCase: (text) => text.replace(/\W+/g, ' ').split(/ |\B(?=[A-Z])/).map(word => word.toUpperCase()).join('_'),
        dotCase: (text) => text.replace(/\W+/g, ' ').split(/ |\B(?=[A-Z])/).map(word => word.toLowerCase()).join('.'),
        pathCase: (text) => text.replace(/\W+/g, ' ').split(/ |\B(?=[A-Z])/).map(word => word.toLowerCase()).join('/'),
        alternatingCase: (text) => text.split('').map((char, i) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()).join(''),
        inverseCase: (text) => text.split('').map(char => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()).join(''),
        toggleCase: (text) => text.split('').map(char => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()).join(''),

        // Normalization
        removeAccents: (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
        normalize: (text) => text.normalize('NFC'),
        removeDuplicates: (text) => text.split('\n').filter((line, index, arr) => arr.indexOf(line) === index).join('\n'),
        removeInvisible: (text) => text.replace(/[\u200B-\u200D\uFEFF]/g, ''),
        trim: (text) => text.trim(),
        compactSpaces: (text) => text.replace(/\s+/g, ' ').trim(),

        // Encoding/Decoding
        base64Encode: (text) => {
            try {
                return btoa(unescape(encodeURIComponent(text)));
            } catch {
                return 'Error: Invalid input for Base64 encoding';
            }
        },
        base64Decode: (text) => {
            try {
                return decodeURIComponent(escape(atob(text)));
            } catch {
                return 'Error: Invalid Base64 string';
            }
        },
        urlEncode: (text) => encodeURIComponent(text),
        urlDecode: (text) => {
            try {
                return decodeURIComponent(text);
            } catch {
                return 'Error: Invalid URL encoding';
            }
        },
        htmlEncode: (text) => text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;'),
        htmlDecode: (text) => text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'"),

        // Format conversions
        markdown: (text) => {
            // Simple markdown-like formatting
            return text
                .replace(/^# (.+)$/gm, '<h1>$1</h1>')
                .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>');
        },
        html: (text) => text.replace(/<[^>]*>/g, ''), // Remove HTML tags
        plain: (text) => text.replace(/[^\w\s]/gi, ''), // Keep only alphanumeric
        regex: (text) => {
            if (!regexPattern) return text;
            try {
                const regex = new RegExp(regexPattern, regexFlags);
                return text.replace(regex, regexReplace);
            } catch {
                return 'Error: Invalid regex pattern';
            }
        },
    };

    const transformCategories = [
        {
            name: 'Case Transformations',
            icon: '🔤',
            transforms: ['uppercase', 'lowercase', 'capitalize', 'titleCase', 'sentenceCase', 'camelCase', 'pascalCase', 'snakeCase', 'kebabCase', 'constantCase', 'dotCase', 'pathCase', 'alternatingCase', 'inverseCase', 'toggleCase'] as TransformationType[]
        },
        {
            name: 'Text Cleanup',
            icon: '🧹',
            transforms: ['removeAccents', 'normalize', 'removeDuplicates', 'removeInvisible', 'trim', 'compactSpaces'] as TransformationType[]
        },
        {
            name: 'Encoding/Decoding',
            icon: '🔐',
            transforms: ['base64Encode', 'base64Decode', 'urlEncode', 'urlDecode', 'htmlEncode', 'htmlDecode'] as TransformationType[]
        },
        {
            name: 'Format Conversion',
            icon: '📝',
            transforms: ['markdown', 'html', 'plain', 'regex'] as TransformationType[]
        }
    ];

    const transformNames: Record<TransformationType, string> = {
        uppercase: 'UPPERCASE',
        lowercase: 'lowercase',
        capitalize: 'Capitalize',
        titleCase: 'Title Case',
        sentenceCase: 'Sentence case',
        camelCase: 'camelCase',
        pascalCase: 'PascalCase',
        snakeCase: 'snake_case',
        kebabCase: 'kebab-case',
        constantCase: 'CONSTANT_CASE',
        dotCase: 'dot.case',
        pathCase: 'path/case',
        alternatingCase: 'aLtErNaTiNg',
        inverseCase: 'iNVERSE',
        toggleCase: 'tOGGLE',
        removeAccents: 'Remove Accents',
        normalize: 'Normalize Unicode',
        removeDuplicates: 'Remove Duplicate Lines',
        removeInvisible: 'Remove Invisible Chars',
        trim: 'Trim Whitespace',
        compactSpaces: 'Compact Spaces',
        base64Encode: 'Base64 Encode',
        base64Decode: 'Base64 Decode',
        urlEncode: 'URL Encode',
        urlDecode: 'URL Decode',
        htmlEncode: 'HTML Encode',
        htmlDecode: 'HTML Decode',
        markdown: 'Markdown → HTML',
        html: 'Strip HTML',
        plain: 'Plain Text Only',
        regex: 'Regex Replace'
    };

    const applyTransform = () => {
        const result = transforms[selectedTransform](inputText);
        setOutputText(result);

        // Add to history
        const newEntry = {
            input: inputText.substring(0, 100),
            output: result.substring(0, 100),
            transform: transformNames[selectedTransform],
            timestamp: Date.now()
        };
        const newHistory = [newEntry, ...history].slice(0, 20);
        setHistory(newHistory);
        localStorage.setItem('textTransformerHistory', JSON.stringify(newHistory));
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(outputText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const clearHistory = () => {
        if (confirm('Clear all transformation history?')) {
            setHistory([]);
            localStorage.removeItem('textTransformerHistory');
        }
    };

    return (
        <div className="flex flex-col gap-6 pb-12">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <span className="text-2xl">🔄</span>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Text Transformer</h1>
                    <p className="text-sm text-muted-foreground">Advanced text transformation utilities</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Transform Categories */}
                <div className="lg:col-span-1 space-y-4">
                    {transformCategories.map((category) => (
                        <div key={category.name} className="bg-card rounded-xl border border-border p-4">
                            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                <span>{category.icon}</span>
                                {category.name}
                            </h3>
                            <div className="space-y-1">
                                {category.transforms.map((transform) => (
                                    <button
                                        key={transform}
                                        onClick={() => setSelectedTransform(transform)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${selectedTransform === transform
                                                ? 'bg-accent text-white font-bold shadow-lg shadow-accent/20'
                                                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {transformNames[transform]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right: Input/Output + History */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Regex Options (only show for regex transform) */}
                    {selectedTransform === 'regex' && (
                        <div className="bg-card rounded-xl border border-border p-4">
                            <h3 className="text-sm font-bold text-foreground mb-3">Regex Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                    type="text"
                                    placeholder="Pattern (e.g. \d+)"
                                    value={regexPattern}
                                    onChange={(e) => setRegexPattern(e.target.value)}
                                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono"
                                />
                                <input
                                    type="text"
                                    placeholder="Replacement"
                                    value={regexReplace}
                                    onChange={(e) => setRegexReplace(e.target.value)}
                                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono"
                                />
                                <input
                                    type="text"
                                    placeholder="Flags (e.g. gi)"
                                    value={regexFlags}
                                    onChange={(e) => setRegexFlags(e.target.value)}
                                    className="px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono"
                                />
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="bg-muted/30 px-4 py-2 border-b border-border">
                            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Input Text</span>
                        </div>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Enter or paste your text here..."
                            className="w-full h-48 p-4 bg-transparent text-foreground resize-none focus:outline-none font-mono text-sm"
                        />
                    </div>

                    {/* Transform Button */}
                    <button
                        onClick={applyTransform}
                        className="w-full py-3 bg-gradient-to-r from-accent to-blue-600 hover:from-accent/90 hover:to-blue-600/90 text-white font-bold rounded-xl shadow-lg shadow-accent/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <span>✨</span>
                        Transform to {transformNames[selectedTransform]}
                        <span>✨</span>
                    </button>

                    {/* Output */}
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Output</span>
                            {outputText && (
                                <button
                                    onClick={handleCopy}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-accent text-white hover:bg-accent/90'
                                        }`}
                                >
                                    {copied ? '✓ Copied' : 'Copy'}
                                </button>
                            )}
                        </div>
                        <div className="p-4 bg-background/50 min-h-48">
                            <pre className="text-foreground font-mono text-sm whitespace-pre-wrap break-words">
                                {outputText || 'Transformed text will appear here...'}
                            </pre>
                        </div>
                    </div>

                    {/* History */}
                    {history.length > 0 && (
                        <div className="bg-card rounded-xl border border-border p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-foreground">Recent Transformations</h3>
                                <button
                                    onClick={clearHistory}
                                    className="text-xs text-destructive hover:text-destructive/80"
                                >
                                    Clear
                                </button>
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                {history.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 bg-background rounded-lg border border-border hover:border-accent/50 transition-colors cursor-pointer"
                                        onClick={() => {
                                            setInputText(item.input);
                                            setOutputText(item.output);
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-accent">{item.transform}</span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(item.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">
                                            {item.input.substring(0, 50)}...
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TextTransformer;
