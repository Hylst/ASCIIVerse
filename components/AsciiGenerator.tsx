
import React, { useState, useMemo, useEffect } from 'react';
import { FONTS, FRAMES, ZALGO_UP, ZALGO_MID, ZALGO_DOWN, ASCII_ART_TEMPLATES } from '../constants';
import { AsciiFont } from '../types';

type TabType = 'style' | 'layout' | 'decor' | 'presets';

// Presets grouped by category for the dropdown
const TEMPLATE_GROUPS = Array.from(new Set(ASCII_ART_TEMPLATES.map(t => t.category)))
    .map(category => ({ category, items: ASCII_ART_TEMPLATES.filter(t => t.category === category) }));

const AsciiGenerator: React.FC = () => {
    // --- MEMORY BANKS (Persistence) ---
    // We keep the input alive even if the user refreshes. Because losing data sucks.
    const [inputText, setInputText] = useState(() => {
        return localStorage.getItem('ascii_gen_input') || 'ASCII Art';
    });
    const [activeTab, setActiveTab] = useState<TabType>('style');

    useEffect(() => {
        localStorage.setItem('ascii_gen_input', inputText);
    }, [inputText]);

    // --- CONFIGURATION MATRIX ---
    const [selectedFontId, setSelectedFontId] = useState<string>('normal');
    const [isReversed, setIsReversed] = useState(false);

    // Zalgo: The chaos engine. Proceed with caution.
    const [isZalgoMode, setIsZalgoMode] = useState(false);
    const [zalgoIntensity, setZalgoIntensity] = useState(5);

    // Layout: Warping space-time (or just text alignment)
    const [transformMode, setTransformMode] = useState<'none' | 'vertical' | 'diagonal' | 'reverse_diagonal'>('none');
    const [lineEffect, setLineEffect] = useState<'none' | 'wave' | 'zigzag' | 'stairs'>('none');
    const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');

    // Decor: Frames and shadows
    const [selectedFrameId, setSelectedFrameId] = useState<string>('none');
    const [bgChar, setBgChar] = useState('');
    const [shadowEnabled, setShadowEnabled] = useState(false);
    const [shadowChar, setShadowChar] = useState('▓'); // Classic shadowing block

    const [fontSearch, setFontSearch] = useState('');
    const [copied, setCopied] = useState(false);

    const selectedFont = useMemo(() => FONTS.find(f => f.id === selectedFontId) || FONTS[0], [selectedFontId]);
    const selectedFrame = useMemo(() => FRAMES.find(f => f.id === selectedFrameId) || FRAMES[0], [selectedFrameId]);

    const filteredFonts = useMemo(() => {
        const q = fontSearch.toLowerCase();
        return FONTS.filter(font => font.name.toLowerCase().includes(q));
    }, [fontSearch]);

    // Font cards preview the user's own text (first line, shortened)
    const sampleText = useMemo(() => {
        const first = inputText.split('\n').find(l => l.trim()) || '';
        const s = first.trim().slice(0, 24);
        return s || 'Abc 123';
    }, [inputText]);

    // --- TRANSFORMATION ENGINE ---

    // 1. Text Mapping (The "Font" logic)
    const transformText = (text: string, font: AsciiFont, reverse: boolean): string => {
        let result = text;
        if (reverse) result = result.split('').reverse().join('');
        // Upside down fonts usually need a reverse to be readable
        if (font.id === 'upside_down' && !reverse) result = result.split('').reverse().join('');
        return result.split('').map(char => font.map[char] || char).join('');
    };

    // 2. The Zalgo Invocation: combining diacritics for that "cursed" look
    const applyZalgo = (text: string) => {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += text[i];
            if (text[i] === ' ' || text[i] === '\n') continue;
            const numUp = Math.floor(Math.random() * zalgoIntensity);
            const numMid = Math.floor(Math.random() * (zalgoIntensity / 2));
            const numDown = Math.floor(Math.random() * zalgoIntensity);
            for (let j = 0; j < numUp; j++) result += ZALGO_UP[Math.floor(Math.random() * ZALGO_UP.length)];
            for (let j = 0; j < numMid; j++) result += ZALGO_MID[Math.floor(Math.random() * ZALGO_MID.length)];
            for (let j = 0; j < numDown; j++) result += ZALGO_DOWN[Math.floor(Math.random() * ZALGO_DOWN.length)];
        }
        return result;
    };

    // 3. Layout Geometry
    const applyLayout = (lines: string[]) => {
        let processed = [...lines];

        if (transformMode !== 'none') {
            const chars = processed.join('').split('');
            if (transformMode === 'vertical') {
                processed = chars;
            } else if (transformMode === 'diagonal') {
                processed = chars.map((c, i) => ' '.repeat(i * 2) + c);
            } else if (transformMode === 'reverse_diagonal') {
                const len = chars.length;
                processed = chars.map((c, i) => ' '.repeat((len - 1 - i) * 2) + c);
            }
        }

        if (lineEffect !== 'none') {
            processed = processed.map((line, i) => {
                let shift = 0;
                if (lineEffect === 'wave') shift = Math.floor((Math.sin(i / 1.5) + 1) * 3);
                if (lineEffect === 'zigzag') shift = (i % 4) * 2;
                if (lineEffect === 'stairs') shift = i * 2;
                return ' '.repeat(shift) + line;
            });
        }

        if (alignment !== 'left') {
            const maxLen = Math.max(...processed.map(l => l.length));
            processed = processed.map(line => {
                const pad = Math.max(0, maxLen - line.length);
                if (alignment === 'center') return ' '.repeat(Math.floor(pad / 2)) + line + ' '.repeat(Math.ceil(pad / 2));
                if (alignment === 'right') return ' '.repeat(pad) + line;
                return line;
            });
        }

        return processed;
    };

    // 4. Decoration Layer (Frames & Shadows)
    const applyFrameAndDecor = (lines: string[]) => {
        const frame = selectedFrame;
        const maxLineLen = Math.max(...lines.map(l => l.length), 1);

        let contentLines = [...lines];
        if (shadowEnabled) {
            const newLines: string[] = [];
            contentLines.forEach(l => {
                newLines.push(l);
                newLines.push(' ' + l.replace(/\S/g, shadowChar));
            });
            contentLines = newLines;
        }

        if (frame.id !== 'none') {
            const contentWidth = Math.max(maxLineLen, 5);

            const buildFrameLine = (pattern: string) => {
                if (!pattern) return '';
                if (pattern.includes('[C]')) {
                    const parts = pattern.split('[C]');
                    const filler = frame.id === 'simple' || frame.id === 'simple_rounded' ? '─' : (frame.id === 'double' ? '═' : pattern[0]);
                    return parts[0] + filler.repeat(Math.max(0, contentWidth)) + parts[1];
                }
                return pattern;
            };

            const top = buildFrameLine(frame.top);
            const bot = buildFrameLine(frame.bottom);

            const middle = contentLines.map(line => {
                const padLen = Math.max(0, contentWidth - line.length);
                const leftPad = Math.floor(padLen / 2);
                const centered = ' '.repeat(leftPad) + line + ' '.repeat(padLen - leftPad);
                if (frame.middle.includes('[T]')) return frame.middle.replace('[T]', centered);
                return `| ${centered} |`;
            });

            contentLines = [top, ...middle, bot].filter(l => l);
        }

        if (bgChar) {
            contentLines = contentLines.map(line => line.replace(/ /g, bgChar));
        }

        return contentLines.join('\n');
    };

    // --- THE PIPELINE ---
    const output = useMemo(() => {
        let text = transformText(inputText, selectedFont, isReversed);
        if (isZalgoMode) text = applyZalgo(text);
        let lines = text.split('\n');
        lines = applyLayout(lines);
        return applyFrameAndDecor(lines);
    }, [inputText, selectedFont, isReversed, isZalgoMode, zalgoIntensity, transformMode, lineEffect, alignment, selectedFrame, bgChar, shadowEnabled, shadowChar]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const insertTemplate = (art: string) => {
        setInputText(art);
        // Reset incompatible settings when loading a template
        setSelectedFrameId('none');
        setIsZalgoMode(false);
        setSelectedFontId('normal');
        setIsReversed(false);
        setLineEffect('none');
        setTransformMode('none');
        setBgChar('');
        setShadowEnabled(false);
    };

    const resetAll = () => {
        setSelectedFontId('normal');
        setSelectedFrameId('none');
        setIsZalgoMode(false);
        setIsReversed(false);
        setLineEffect('none');
        setTransformMode('none');
        setAlignment('left');
        setBgChar('');
        setShadowEnabled(false);
    };

    // Number of active effects, shown on the reset button
    const activeEffects = [selectedFontId !== 'normal', isReversed, isZalgoMode, transformMode !== 'none', lineEffect !== 'none', alignment !== 'left', selectedFrameId !== 'none', !!bgChar, shadowEnabled].filter(Boolean).length;

    // --- UI COMPONENTS ---

    const renderTabButton = (id: TabType, label: string) => (
        <button
            onClick={() => setActiveTab(id)}
            aria-pressed={activeTab === id}
            className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === id
                ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
        >
            {label}
        </button>
    );

    const segBtn = (active: boolean) => `flex-1 px-2 py-1.5 text-[11px] font-bold rounded capitalize transition-colors ${active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`;

    return (
        <div className="flex flex-col gap-4">

            {/* --- ROW 1: INPUT + RESULT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                        <label htmlFor="weird-input" className="text-xs font-bold text-foreground uppercase tracking-wider">Your text</label>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="font-mono">{inputText.length} chars</span>
                            {inputText && <button onClick={() => setInputText('')} className="hover:text-destructive">Clear</button>}
                        </div>
                    </div>
                    <textarea
                        id="weird-input"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="w-full h-32 lg:h-36 bg-transparent p-4 text-foreground focus:outline-none resize-none font-sans text-base placeholder:text-muted-foreground/50"
                        placeholder="Type here..."
                    />
                </div>

                <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden shadow-2xl relative">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent via-blue-500 to-purple-600 opacity-60"></div>
                    <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border">
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider truncate">
                            Result <span className="text-muted-foreground normal-case font-normal">· {selectedFont.name}{activeEffects > (selectedFontId !== 'normal' ? 1 : 0) ? ' + effects' : ''}</span>
                        </span>
                        <button
                            onClick={copyToClipboard}
                            disabled={!output}
                            className={`shrink-0 px-4 py-1.5 rounded-lg font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-40 ${copied ? 'bg-green-500 text-white' : 'bg-accent text-accent-foreground hover:bg-accent/90'}`}
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                    <div className="h-32 lg:h-36 overflow-auto custom-scrollbar flex bg-black/40">
                        <pre className="m-auto p-4 font-mono text-lg md:text-xl text-emerald-400 whitespace-pre text-center leading-normal">
                            {output || <span className="text-muted-foreground text-sm">The result appears here.</span>}
                        </pre>
                    </div>
                    <div className="px-4 py-1.5 border-t border-border flex justify-between text-[11px] text-muted-foreground font-mono">
                        <span>{output.length} chars</span>
                        <span>{output ? output.split('\n').length : 0} lines</span>
                    </div>
                </div>
            </div>

            {/* --- ROW 2: FONT GALLERY + OPTIONS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] gap-4 items-start">

                {/* Font gallery */}
                <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-border flex items-center gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={fontSearch}
                                onChange={(e) => setFontSearch(e.target.value)}
                                placeholder="Search fonts..."
                                aria-label="Search fonts"
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none pl-8"
                            />
                            <svg className="absolute left-2.5 top-2.5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /></svg>
                        </div>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">{filteredFonts.length} fonts</span>
                    </div>

                    <div className="p-2 overflow-y-auto custom-scrollbar max-h-[24rem] lg:max-h-[calc(100dvh-25.5rem)] lg:min-h-[16rem] grid grid-cols-2 xl:grid-cols-3 gap-2 content-start">
                        {filteredFonts.length === 0 && (
                            <p className="col-span-full text-center text-xs text-muted-foreground py-6">No font matches “{fontSearch}”.</p>
                        )}
                        {filteredFonts.map(font => (
                            <button
                                key={font.id}
                                onClick={() => setSelectedFontId(font.id)}
                                aria-pressed={selectedFontId === font.id}
                                className={`min-w-0 px-3 py-2 rounded-lg text-left transition-all flex flex-col gap-0.5 border ${selectedFontId === font.id
                                    ? 'bg-accent/10 border-accent text-accent'
                                    : 'bg-secondary/40 border-border/60 text-foreground/90 hover:bg-muted hover:border-border'
                                    }`}
                            >
                                <span className="font-bold text-[10px] text-muted-foreground uppercase truncate">{font.name}</span>
                                <span className="truncate text-base">{transformText(sampleText, font, false)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Options */}
                <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden lg:sticky lg:top-0">
                    <div className="flex p-2 gap-1 border-b border-border bg-muted/10" role="tablist" aria-label="Options">
                        {renderTabButton('style', 'Style')}
                        {renderTabButton('layout', 'Layout')}
                        {renderTabButton('decor', 'Decor')}
                        {renderTabButton('presets', 'Presets')}
                    </div>

                    <div className="p-4 space-y-4">

                        {activeTab === 'style' && (
                            <div className="space-y-3 animate-in fade-in">
                                <label className="flex items-center gap-3 p-3 bg-secondary rounded-lg cursor-pointer hover:bg-muted transition-colors">
                                    <input type="checkbox" checked={isReversed} onChange={e => setIsReversed(e.target.checked)} className="w-5 h-5 accent-accent" />
                                    <span className="text-sm font-bold text-foreground">Reverse text</span>
                                </label>

                                <div className="space-y-2 p-3 bg-secondary rounded-lg">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={isZalgoMode} onChange={e => setIsZalgoMode(e.target.checked)} className="w-5 h-5 accent-purple-500" />
                                        <span className="text-sm font-bold text-foreground">Zalgo / glitch</span>
                                    </label>
                                    {isZalgoMode && (
                                        <div className="pt-2">
                                            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                                <span>Low</span>
                                                <span>Chaos</span>
                                            </div>
                                            <input
                                                type="range" min="1" max="15"
                                                value={zalgoIntensity} onChange={e => setZalgoIntensity(parseInt(e.target.value))}
                                                className="w-full accent-purple-500"
                                                aria-label="Zalgo intensity"
                                            />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[11px] text-muted-foreground">Pick a font in the gallery: each card previews your own text.</p>
                            </div>
                        )}

                        {activeTab === 'layout' && (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-bold text-muted-foreground uppercase">Transform</span>
                                    <div className="grid grid-cols-2 gap-1 bg-secondary p-1 rounded-lg">
                                        {(['none', 'vertical', 'diagonal', 'reverse_diagonal'] as const).map(mode => (
                                            <button key={mode} onClick={() => setTransformMode(mode)} aria-pressed={transformMode === mode} className={segBtn(transformMode === mode)}>
                                                {mode.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-bold text-muted-foreground uppercase">Line effect</span>
                                    <div className="grid grid-cols-4 gap-1 bg-secondary p-1 rounded-lg">
                                        {(['none', 'wave', 'zigzag', 'stairs'] as const).map(effect => (
                                            <button key={effect} onClick={() => setLineEffect(effect)} aria-pressed={lineEffect === effect} className={segBtn(lineEffect === effect)}>
                                                {effect}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-bold text-muted-foreground uppercase">Alignment</span>
                                    <div className="grid grid-cols-3 gap-1 bg-secondary p-1 rounded-lg">
                                        {(['left', 'center', 'right'] as const).map(align => (
                                            <button key={align} onClick={() => setAlignment(align)} aria-pressed={alignment === align} className={segBtn(alignment === align)}>
                                                {align}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'decor' && (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="space-y-1.5">
                                    <label htmlFor="weird-frame" className="text-[11px] font-bold text-muted-foreground uppercase">Frame</label>
                                    <select
                                        id="weird-frame"
                                        value={selectedFrameId}
                                        onChange={(e) => setSelectedFrameId(e.target.value)}
                                        className="w-full bg-secondary border border-border rounded-lg p-2 text-sm text-foreground focus:border-accent outline-none"
                                    >
                                        {FRAMES.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        id="weird-bg"
                                        type="text" maxLength={1} placeholder="·"
                                        value={bgChar} onChange={e => setBgChar(e.target.value)}
                                        className="w-10 h-10 bg-secondary border border-border rounded-lg text-center text-foreground"
                                    />
                                    <label htmlFor="weird-bg" className="text-[11px] text-muted-foreground">Background fill: replaces spaces with this character.</label>
                                </div>

                                <div className="space-y-2 p-3 bg-secondary rounded-lg border border-border">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={shadowEnabled} onChange={e => setShadowEnabled(e.target.checked)} className="w-5 h-5 accent-accent" />
                                        <span className="text-sm font-bold text-foreground">3D block shadow</span>
                                    </label>
                                    {shadowEnabled && (
                                        <div className="pt-1 flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">Shadow character</span>
                                            <input
                                                type="text" maxLength={1}
                                                value={shadowChar} onChange={e => setShadowChar(e.target.value)}
                                                className="w-8 h-8 bg-background border border-border rounded text-center text-xs"
                                                aria-label="Shadow character"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'presets' && (
                            <div className="space-y-2 animate-in fade-in">
                                <label htmlFor="weird-preset" className="text-[11px] font-bold text-muted-foreground uppercase">Load a classic</label>
                                <select
                                    id="weird-preset"
                                    value=""
                                    onChange={(e) => {
                                        const t = ASCII_ART_TEMPLATES.find(x => x.id === e.target.value);
                                        if (t) insertTemplate(t.art);
                                    }}
                                    className="w-full bg-secondary border border-border rounded-lg p-2 text-sm text-foreground focus:border-accent outline-none"
                                >
                                    <option value="">Choose a preset…</option>
                                    {TEMPLATE_GROUPS.map(g => (
                                        <optgroup key={g.category} label={g.category}>
                                            {g.items.map(t => <option key={t.id} value={t.id}>{t.name}   {t.art}</option>)}
                                        </optgroup>
                                    ))}
                                </select>
                                <p className="text-[11px] text-muted-foreground">Replaces your text and resets the effects.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-border bg-muted/10">
                        <button
                            onClick={resetAll}
                            disabled={activeEffects === 0}
                            className="w-full py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                        >
                            Reset all settings{activeEffects ? ` (${activeEffects} active)` : ''}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AsciiGenerator;
