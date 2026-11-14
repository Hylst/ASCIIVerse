
import React, { useState, useEffect, useMemo } from 'react';

type TransformationType =
    | 'uppercase' | 'lowercase' | 'capitalize' | 'titleCase' | 'sentenceCase'
    | 'camelCase' | 'pascalCase' | 'snakeCase' | 'kebabCase' | 'constantCase'
    | 'dotCase' | 'pathCase' | 'alternatingCase' | 'inverseCase' | 'toggleCase'
    | 'removeAccents' | 'normalize' | 'removeDuplicates' | 'removeInvisible'
    | 'trim' | 'compactSpaces' | 'base64Encode' | 'base64Decode'
    | 'urlEncode' | 'urlDecode' | 'htmlEncode' | 'htmlDecode'
    | 'markdown' | 'html' | 'plain' | 'regex';

interface HistoryEntry {
    input: string;
    transformId?: TransformationType;
    transform: string;
    timestamp: number;
}

const HISTORY_KEY = 'textTransformerHistory';
const INPUT_KEY = 'text_transformer_input';

// --- helpers (Unicode aware: accented letters count as letters) ---

const perLine = (text: string, fn: (line: string) => string) => text.split('\n').map(fn).join('\n');

// Split a line into words, also breaking camelCase boundaries
const words = (line: string) => line
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

const joinWords = (sep: string, map: (w: string, i: number) => string) =>
    (text: string) => perLine(text, line => words(line).map(map).join(sep));

const base64Encode = (text: string) => {
    const bytes = new TextEncoder().encode(text);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
};

const base64Decode = (text: string) => {
    let bin: string;
    try {
        bin = atob(text.replace(/\s+/g, ''));
    } catch {
        throw new Error('Invalid Base64 string');
    }
    try {
        return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
    } catch {
        throw new Error('Decoded data is not valid UTF-8 text');
    }
};

const TRANSFORMS: Record<Exclude<TransformationType, 'regex'>, (text: string) => string> = {
    // Case
    uppercase: (t) => t.toUpperCase(),
    lowercase: (t) => t.toLowerCase(),
    capitalize: (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase(),
    titleCase: (t) => t.toLowerCase().replace(/(^|[\s\-/(«"'])(\p{L})/gu, (_m, p, c) => p + c.toUpperCase()),
    sentenceCase: (t) => t.toLowerCase().replace(/(^\s*|[.!?…]\s+)(\p{L})/gmu, (_m, p, c) => p + c.toUpperCase()),
    camelCase: joinWords('', (w, i) => (i === 0 ? w.toLowerCase() : cap(w))),
    pascalCase: joinWords('', cap),
    snakeCase: joinWords('_', w => w.toLowerCase()),
    kebabCase: joinWords('-', w => w.toLowerCase()),
    constantCase: joinWords('_', w => w.toUpperCase()),
    dotCase: joinWords('.', w => w.toLowerCase()),
    pathCase: joinWords('/', w => w.toLowerCase()),
    alternatingCase: (t) => {
        let i = 0;
        return Array.from(t).map(ch => {
            if (!/\p{L}/u.test(ch)) return ch;
            return i++ % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase();
        }).join('');
    },
    inverseCase: (t) => Array.from(t).map(ch => (ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase())).join(''),
    toggleCase: (t) => t.replace(/\S+/g, w => w.charAt(0).toLowerCase() + w.slice(1).toUpperCase()),

    // Cleanup
    removeAccents: (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC'),
    normalize: (t) => t.normalize('NFC'),
    removeDuplicates: (t) => t.split('\n').filter((line, index, arr) => arr.indexOf(line) === index).join('\n'),
    removeInvisible: (t) => t.replace(/[­​-‏⁠﻿]/g, ''),
    trim: (t) => perLine(t, l => l.trim()).trim(),
    compactSpaces: (t) => perLine(t, l => l.replace(/[ \t ]+/g, ' ').trim()).replace(/\n{3,}/g, '\n\n').trim(),

    // Encoding
    base64Encode,
    base64Decode,
    urlEncode: (t) => encodeURIComponent(t),
    urlDecode: (t) => {
        try {
            return decodeURIComponent(t.replace(/\+/g, ' '));
        } catch {
            throw new Error('Invalid URL encoding');
        }
    },
    htmlEncode: (t) => t
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;'),
    htmlDecode: (t) => t
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&'),

    // Format
    markdown: (t) => t
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>'),
    html: (t) => t.replace(/<[^>]*>/g, ''),
    plain: (t) => t.replace(/[^\p{L}\p{N}\s]/gu, ''),
};

const CATEGORIES: { id: string; name: string; transforms: TransformationType[] }[] = [
    { id: 'case', name: 'Case', transforms: ['uppercase', 'lowercase', 'capitalize', 'titleCase', 'sentenceCase', 'camelCase', 'pascalCase', 'snakeCase', 'kebabCase', 'constantCase', 'dotCase', 'pathCase', 'alternatingCase', 'inverseCase', 'toggleCase'] },
    { id: 'cleanup', name: 'Cleanup', transforms: ['removeAccents', 'normalize', 'removeDuplicates', 'removeInvisible', 'trim', 'compactSpaces'] },
    { id: 'encoding', name: 'Encode / decode', transforms: ['base64Encode', 'base64Decode', 'urlEncode', 'urlDecode', 'htmlEncode', 'htmlDecode'] },
    { id: 'format', name: 'Format', transforms: ['markdown', 'html', 'plain', 'regex'] },
];

const NAMES: Record<TransformationType, string> = {
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
    removeAccents: 'Remove accents',
    normalize: 'Normalize Unicode',
    removeDuplicates: 'Remove duplicate lines',
    removeInvisible: 'Remove invisible chars',
    trim: 'Trim whitespace',
    compactSpaces: 'Compact spaces',
    base64Encode: 'Base64 encode',
    base64Decode: 'Base64 decode',
    urlEncode: 'URL encode',
    urlDecode: 'URL decode',
    htmlEncode: 'HTML encode',
    htmlDecode: 'HTML decode',
    markdown: 'Markdown to HTML',
    html: 'Strip HTML tags',
    plain: 'Letters and digits only',
    regex: 'Regex replace',
};

const HINTS: Record<TransformationType, string> = {
    uppercase: 'Every letter in capitals.',
    lowercase: 'Every letter in lower case.',
    capitalize: 'First letter in capitals, the rest in lower case.',
    titleCase: 'First letter of each word in capitals.',
    sentenceCase: 'First letter of each sentence and each line in capitals.',
    camelCase: 'Words glued together, each new word capitalized, line by line.',
    pascalCase: 'Like camelCase, with a capital first letter.',
    snakeCase: 'Lower case words joined by underscores.',
    kebabCase: 'Lower case words joined by hyphens (URL slugs).',
    constantCase: 'Upper case words joined by underscores.',
    dotCase: 'Lower case words joined by dots.',
    pathCase: 'Lower case words joined by slashes.',
    alternatingCase: 'Letters alternate between lower and upper case.',
    inverseCase: 'Swaps the case of every letter.',
    toggleCase: 'First letter of each word in lower case, the rest in capitals.',
    removeAccents: 'é becomes e, ç becomes c, and so on.',
    normalize: 'Merges decomposed characters (NFC), useful after a copy from a PDF.',
    removeDuplicates: 'Keeps the first occurrence of each line.',
    removeInvisible: 'Removes zero-width spaces, soft hyphens and BOM characters.',
    trim: 'Removes spaces at the start and end of each line.',
    compactSpaces: 'Collapses repeated spaces and blank lines.',
    base64Encode: 'Encodes the text (UTF-8) in Base64.',
    base64Decode: 'Decodes Base64 back to text.',
    urlEncode: 'Escapes the text for use in a URL.',
    urlDecode: 'Turns %20 and friends back into characters.',
    htmlEncode: 'Escapes < > & and quotes for HTML.',
    htmlDecode: 'Turns &lt; &gt; &amp; back into characters.',
    markdown: 'Headings, bold, italic and inline code to HTML tags.',
    html: 'Removes every HTML tag and keeps the text.',
    plain: 'Removes punctuation and symbols, keeps letters, digits and spaces.',
    regex: 'Search and replace with a regular expression ($1 inserts a group).',
};

const ALL_IDS = Object.keys(NAMES) as TransformationType[];

const readHistory = (): HistoryEntry[] => {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter(e => e && typeof e.input === 'string') : [];
    } catch {
        return [];
    }
};

const readInput = () => {
    try {
        return localStorage.getItem(INPUT_KEY) || '';
    } catch {
        return '';
    }
};

const stats = (text: string) => ({
    chars: Array.from(text).length,
    words: (text.match(/[\p{L}\p{N}]+/gu) || []).length,
    lines: text ? text.split('\n').length : 0,
});

const TextTransformer: React.FC = () => {
    const [inputText, setInputText] = useState(readInput);
    const [selectedTransform, setSelectedTransform] = useState<TransformationType>('uppercase');
    const [activeCategory, setActiveCategory] = useState('case');
    const [regexPattern, setRegexPattern] = useState('');
    const [regexReplace, setRegexReplace] = useState('');
    const [regexFlags, setRegexFlags] = useState('g');
    const [history, setHistory] = useState<HistoryEntry[]>(readHistory);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        try { localStorage.setItem(INPUT_KEY, inputText); } catch { /* storage unavailable */ }
    }, [inputText]);

    const selectTransform = (id: TransformationType) => {
        setSelectedTransform(id);
        const cat = CATEGORIES.find(c => c.transforms.includes(id));
        if (cat) setActiveCategory(cat.id);
    };

    // Live result: no button to press, the output follows the input
    const result = useMemo<{ output: string; error?: string; info?: string }>(() => {
        if (!inputText) return { output: '' };
        if (selectedTransform === 'regex') {
            if (!regexPattern) return { output: inputText, info: 'Type a pattern to start replacing.' };
            let re: RegExp;
            try {
                re = new RegExp(regexPattern, regexFlags);
            } catch (e) {
                return { output: '', error: e instanceof Error ? e.message : 'Invalid regex' };
            }
            const counter = new RegExp(regexPattern, regexFlags.includes('g') ? regexFlags : regexFlags + 'g');
            const matches = (inputText.match(counter) || []).length;
            return { output: inputText.replace(re, regexReplace), info: `${matches} match${matches === 1 ? '' : 'es'}${regexFlags.includes('g') ? '' : ' (only the first is replaced without the g flag)'}` };
        }
        try {
            return { output: TRANSFORMS[selectedTransform](inputText) };
        } catch (e) {
            return { output: '', error: e instanceof Error ? e.message : 'Transformation failed' };
        }
    }, [inputText, selectedTransform, regexPattern, regexReplace, regexFlags]);

    const inStats = stats(inputText);
    const outStats = stats(result.output);

    const pushHistory = () => {
        const entry: HistoryEntry = {
            input: inputText.slice(0, 2000),
            transformId: selectedTransform,
            transform: NAMES[selectedTransform],
            timestamp: Date.now(),
        };
        const next = [entry, ...history.filter(h => !(h.input === entry.input && h.transform === entry.transform))].slice(0, 20);
        setHistory(next);
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
    };

    const handleCopy = () => {
        if (!result.output) return;
        navigator.clipboard.writeText(result.output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        pushHistory();
    };

    const chainResult = () => {
        if (!result.output) return;
        pushHistory();
        setInputText(result.output);
    };

    const restore = (item: HistoryEntry) => {
        setInputText(item.input);
        const id = item.transformId && ALL_IDS.includes(item.transformId)
            ? item.transformId
            : ALL_IDS.find(k => NAMES[k].toLowerCase() === item.transform.toLowerCase());
        if (id) selectTransform(id);
    };

    const clearHistory = () => {
        if (confirm('Clear all transformation history?')) {
            setHistory([]);
            try { localStorage.removeItem(HISTORY_KEY); } catch { /* storage unavailable */ }
        }
    };

    const category = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];

    const inputCls = 'w-full px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono text-foreground focus:border-accent focus:outline-none';

    return (
        <div className="flex flex-col gap-4">

            {/* --- TRANSFORM PICKER --- */}
            <div className="bg-card rounded-xl border border-border p-3 space-y-3">

                {/* Mobile: one grouped dropdown */}
                <div className="sm:hidden space-y-1">
                    <label htmlFor="transform-select" className="text-[11px] font-bold text-muted-foreground uppercase">Transformation</label>
                    <select
                        id="transform-select"
                        value={selectedTransform}
                        onChange={(e) => selectTransform(e.target.value as TransformationType)}
                        className="w-full bg-secondary border border-border rounded-lg p-2.5 text-sm text-foreground focus:border-accent outline-none"
                    >
                        {CATEGORIES.map(c => (
                            <optgroup key={c.id} label={c.name}>
                                {c.transforms.map(t => <option key={t} value={t}>{NAMES[t]}</option>)}
                            </optgroup>
                        ))}
                    </select>
                </div>

                {/* Desktop: category tabs + chips */}
                <div className="hidden sm:flex flex-wrap gap-1 bg-secondary p-1 rounded-lg w-fit" role="tablist" aria-label="Categories">
                    {CATEGORIES.map(c => {
                        const holdsSelection = c.transforms.includes(selectedTransform);
                        return (
                            <button
                                key={c.id}
                                role="tab"
                                aria-selected={activeCategory === c.id}
                                onClick={() => setActiveCategory(c.id)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${activeCategory === c.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {c.name}
                                <span className="ml-1.5 opacity-60 font-normal">{c.transforms.length}</span>
                                {holdsSelection && activeCategory !== c.id && <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-accent align-middle" aria-hidden="true"></span>}
                            </button>
                        );
                    })}
                </div>

                <div className="hidden sm:flex flex-wrap gap-1.5">
                    {category.transforms.map(t => (
                        <button
                            key={t}
                            onClick={() => selectTransform(t)}
                            aria-pressed={selectedTransform === t}
                            title={HINTS[t]}
                            className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${selectedTransform === t
                                ? 'bg-accent text-accent-foreground border-accent font-bold shadow-lg shadow-accent/20'
                                : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-accent/50'
                                }`}
                        >
                            {NAMES[t]}
                        </button>
                    ))}
                </div>

                <p className="text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">{NAMES[selectedTransform]}</span> · {HINTS[selectedTransform]}
                </p>

                {selectedTransform === 'regex' && (
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_6rem] gap-2">
                        <label className="space-y-1">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase">Pattern</span>
                            <input type="text" placeholder="e.g. (\d+)" value={regexPattern} onChange={(e) => setRegexPattern(e.target.value)} className={inputCls} spellCheck={false} />
                        </label>
                        <label className="space-y-1">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase">Replace with</span>
                            <input type="text" placeholder="e.g. [$1]" value={regexReplace} onChange={(e) => setRegexReplace(e.target.value)} className={inputCls} spellCheck={false} />
                        </label>
                        <label className="space-y-1">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase">Flags</span>
                            <input type="text" placeholder="gi" value={regexFlags} onChange={(e) => setRegexFlags(e.target.value)} className={inputCls} spellCheck={false} />
                        </label>
                    </div>
                )}
            </div>

            {/* --- INPUT / OUTPUT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col">
                    <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center justify-between gap-2">
                        <label htmlFor="transform-input" className="text-xs font-bold text-foreground uppercase tracking-wider">Input</label>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="font-mono">{inStats.chars} chars · {inStats.words} words · {inStats.lines} lines</span>
                            {inputText && <button onClick={() => setInputText('')} className="hover:text-destructive">Clear</button>}
                        </div>
                    </div>
                    <textarea
                        id="transform-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Enter or paste your text here..."
                        spellCheck={false}
                        className="w-full h-56 lg:h-[max(16rem,calc(100dvh-26rem))] p-4 bg-transparent text-foreground resize-none focus:outline-none font-mono text-sm"
                    />
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col">
                    <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider truncate">Output</span>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={chainResult}
                                disabled={!result.output || result.output === inputText}
                                title="Chain another transformation on this result"
                                className="px-3 py-1 rounded-lg text-xs font-bold border border-border text-muted-foreground hover:text-foreground hover:border-accent/50 disabled:opacity-40 disabled:pointer-events-none"
                            >
                                Use as input
                            </button>
                            <button
                                onClick={handleCopy}
                                disabled={!result.output}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors disabled:opacity-40 ${copied ? 'bg-green-500 text-white' : 'bg-accent text-accent-foreground hover:bg-accent/90'}`}
                            >
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>
                    <div className="p-4 bg-background/50 h-56 lg:h-[max(16rem,calc(100dvh-26rem))] overflow-auto custom-scrollbar" aria-live="polite">
                        {result.error ? (
                            <p className="text-sm text-destructive">Error: {result.error}</p>
                        ) : (
                            <pre className="text-foreground font-mono text-sm whitespace-pre-wrap break-words">
                                {result.output || <span className="text-muted-foreground">The result appears here as you type.</span>}
                            </pre>
                        )}
                    </div>
                    <div className="px-4 py-1.5 border-t border-border flex justify-between gap-2 text-[11px] text-muted-foreground">
                        <span className="truncate">{result.info || ''}</span>
                        <span className="font-mono shrink-0">{outStats.chars} chars · {outStats.lines} lines</span>
                    </div>
                </div>
            </div>

            {/* --- HISTORY --- */}
            {history.length > 0 && (
                <details className="bg-card rounded-xl border border-border group">
                    <summary className="px-4 py-3 cursor-pointer select-none text-sm font-bold text-foreground flex items-center justify-between">
                        <span>Recent transformations <span className="text-muted-foreground font-normal">({history.length})</span></span>
                        <span className="text-xs text-muted-foreground group-open:hidden">Show</span>
                        <span className="text-xs text-muted-foreground hidden group-open:inline">Hide</span>
                    </summary>
                    <div className="px-4 pb-4">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-[11px] text-muted-foreground">Saved when you copy or chain a result. Click to restore.</p>
                            <button onClick={clearHistory} className="text-xs text-destructive hover:text-destructive/80">Clear</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {history.map((item, idx) => (
                                <button
                                    key={`${item.timestamp}-${idx}`}
                                    onClick={() => restore(item)}
                                    className="text-left p-3 bg-background rounded-lg border border-border hover:border-accent/50 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-1 gap-2">
                                        <span className="text-xs font-bold text-accent truncate">{item.transform}</span>
                                        <span className="text-[10px] text-muted-foreground shrink-0">{new Date(item.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">{item.input.slice(0, 80) || '(empty)'}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </details>
            )}
        </div>
    );
};

export default TextTransformer;
