
import React, { useState, useMemo, useEffect } from 'react';
import { FONTS, FRAMES, ZALGO_UP, ZALGO_MID, ZALGO_DOWN, ASCII_ART_TEMPLATES } from '../constants';
import { AsciiFont, AsciiFrame } from '../types';

type TabType = 'style' | 'layout' | 'decor' | 'presets';

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

    // Style: The aesthetic choices
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

    // Memoizing these lookups to save precious CPU cycles
    const selectedFont = useMemo(() => FONTS.find(f => f.id === selectedFontId) || FONTS[0], [selectedFontId]);
    const selectedFrame = useMemo(() => FRAMES.find(f => f.id === selectedFrameId) || FRAMES[0], [selectedFrameId]);

    // Filtering fonts... because scrolling through 50 items is so 1999
    const filteredFonts = useMemo(() => {
        return FONTS.filter(font =>
            font.name.toLowerCase().includes(fontSearch.toLowerCase())
        );
    }, [fontSearch]);

    // --- TRANSFORMATION ENGINE ---

    // 1. Text Mapping (The "Font" logic)
    const transformText = (text: string, font: AsciiFont, reverse: boolean): string => {
        let result = text;
        // Flip it and reverse it (Missy Elliott style)
        if (reverse) result = result.split('').reverse().join('');
        // Upside down fonts usually need a reverse to be readable
        if (font.id === 'upside_down' && !reverse) result = result.split('').reverse().join('');

        // The core mapping loop
        result = result.split('').map(char => font.map[char] || char).join('');
        return result;
    };

    // 2. The Zalgo Invocation
    // Adds combining diacritics to create that "cursed" look
    const applyZalgo = (text: string) => {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += text[i];
            if (text[i] === ' ' || text[i] === '\n') continue; // Don't curse the whitespace

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

        // Geometry Transforms: Breaking lines apart
        if (transformMode !== 'none') {
            const fullText = processed.join('');
            const chars = fullText.split('');

            if (transformMode === 'vertical') {
                processed = chars;
            } else if (transformMode === 'diagonal') {
                processed = chars.map((c, i) => ' '.repeat(i * 2) + c);
            } else if (transformMode === 'reverse_diagonal') {
                const len = chars.length;
                processed = chars.map((c, i) => ' '.repeat((len - 1 - i) * 2) + c);
            }
        }

        // Line Distortion (Waving at you)
        if (lineEffect !== 'none') {
            processed = processed.map((line, i) => {
                let shift = 0;
                // Math.sin is our friend for natural waves
                if (lineEffect === 'wave') shift = Math.floor((Math.sin(i / 1.5) + 1) * 3);
                if (lineEffect === 'zigzag') shift = (i % 4) * 2;
                if (lineEffect === 'stairs') shift = i * 2;
                return ' '.repeat(shift) + line;
            });
        }

        // Alignment: Padding logic
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

        // Shadow Logic (Block Shadow - 3D Effect)
        let contentLines = [...lines];
        if (shadowEnabled) {
            // We duplicate every line, offset it, and fill with the shadow char
            const newLines: string[] = [];
            contentLines.forEach(l => {
                newLines.push(l);
                newLines.push(' ' + l.replace(/\S/g, shadowChar));
            });
            contentLines = newLines;
        }

        // Frame Logic
        if (frame.id !== 'none') {
            const contentWidth = Math.max(maxLineLen, 5);

            // Frame Builder Helper
            const buildFrameLine = (pattern: string, type: 'top' | 'bot') => {
                if (!pattern) return '';
                if (pattern.includes('[C]')) {
                    const parts = pattern.split('[C]');
                    const filler = frame.id === 'simple' || frame.id === 'simple_rounded' ? '─' : (frame.id === 'double' ? '═' : pattern[0]);
                    const fillLen = Math.max(0, contentWidth);
                    return parts[0] + filler.repeat(fillLen) + parts[1];
                }
                return pattern;
            };

            const top = buildFrameLine(frame.top, 'top');
            const bot = buildFrameLine(frame.bottom, 'bot');

            const middle = contentLines.map(line => {
                const padLen = Math.max(0, contentWidth - line.length);
                const leftPad = Math.floor(padLen / 2);
                const rightPad = padLen - leftPad;
                const centered = ' '.repeat(leftPad) + line + ' '.repeat(rightPad);

                if (frame.middle.includes('[T]')) {
                    return frame.middle.replace('[T]', centered);
                }
                return `| ${centered} |`;
            });

            contentLines = [top, ...middle, bot].filter(l => l);
        }

        // Background Fill (Replacing spaces)
        if (bgChar) {
            contentLines = contentLines.map(line => line.replace(/ /g, bgChar));
        }

        return contentLines.join('\n');
    };

    // --- THE PIPELINE ---
    // Combining all transformations into one memoized output
    const output = useMemo(() => {
        // Stage 1: Base Text
        let text = transformText(inputText, selectedFont, isReversed);
        if (isZalgoMode) text = applyZalgo(text);

        // Stage 2: Layout
        let lines = text.split('\n');
        lines = applyLayout(lines);

        // Stage 3: Polish
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

    // --- UI COMPONENTS ---

    const renderTabButton = (id: TabType, label: string, icon: React.ReactNode) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === id
                    ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col lg:flex-row h-full gap-4 lg:gap-6 min-h-0">

            {/* --- LEFT COLUMN: FONT LIBRARY --- */}
            <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0 h-48 lg:h-full lg:max-h-full">
                <div className="bg-card rounded-xl border border-border flex flex-col h-full overflow-hidden shadow-sm">
                    <div className="p-3 border-b border-border bg-muted/20 shrink-0">
                        <div className="relative">
                            <input
                                type="text"
                                value={fontSearch}
                                onChange={(e) => setFontSearch(e.target.value)}
                                placeholder="Search fonts..."
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-accent focus:outline-none pl-8"
                            />
                            <svg className="absolute left-2.5 top-2.5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /></svg>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
                        {filteredFonts.map(font => (
                            <button
                                key={font.id}
                                onClick={() => setSelectedFontId(font.id)}
                                className={`w-full px-3 py-2 rounded-lg text-left transition-all font-mono flex flex-col gap-0.5 border ${selectedFontId === font.id
                                        ? 'bg-accent/10 border-accent text-accent'
                                        : 'bg-transparent border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                <span className="font-bold text-[10px] opacity-50 uppercase">{font.name}</span>
                                <span className="truncate text-sm">
                                    {transformText('Abc 123', font, false)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- CENTER COLUMN: CONFIGURATION --- */}
            <div className="w-full lg:w-96 flex flex-col gap-4 shrink-0 flex-1 lg:flex-none">

                {/* Input */}
                <div className="bg-card p-4 rounded-xl border border-border shrink-0">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="w-full h-24 bg-background border border-border rounded-lg p-3 text-foreground focus:outline-none focus:border-accent resize-none font-sans text-base placeholder:text-muted-foreground/50"
                        placeholder="Type here..."
                    />
                </div>

                {/* Config Deck */}
                <div className="bg-card rounded-xl border border-border flex flex-col overflow-hidden flex-1 min-h-0">
                    <div className="flex p-2 gap-1 border-b border-border bg-muted/10">
                        {renderTabButton('style', 'Style', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" /></svg>)}
                        {renderTabButton('layout', 'Layout', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>)}
                        {renderTabButton('decor', 'Decor', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5Z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" /></svg>)}
                        {renderTabButton('presets', 'Presets', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>)}
                    </div>

                    <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-4">

                        {/* TAB: STYLE */}
                        {activeTab === 'style' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
                                {/* Font Info */}
                                <div className="p-3 bg-secondary rounded-lg border border-border">
                                    <span className="text-xs text-muted-foreground">Current Font:</span>
                                    <div className="font-bold text-foreground">{selectedFont.name}</div>
                                </div>

                                <label className="flex items-center gap-3 p-3 bg-secondary rounded-lg cursor-pointer hover:bg-muted transition-colors">
                                    <input type="checkbox" checked={isReversed} onChange={e => setIsReversed(e.target.checked)} className="w-5 h-5 text-accent rounded bg-background border-border focus:ring-accent" />
                                    <span className="text-sm font-bold text-foreground">Reverse Text</span>
                                </label>

                                <div className="space-y-2 p-3 bg-secondary rounded-lg">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={isZalgoMode} onChange={e => setIsZalgoMode(e.target.checked)} className="w-5 h-5 text-purple-500 rounded bg-background border-border focus:ring-purple-500" />
                                        <span className="text-sm font-bold text-foreground">Zalgo / Glitch Mode</span>
                                    </label>
                                    {isZalgoMode && (
                                        <div className="pt-2">
                                            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                                                <span>Low Intensity</span>
                                                <span>Chaos</span>
                                            </div>
                                            <input
                                                type="range" min="1" max="15"
                                                value={zalgoIntensity} onChange={e => setZalgoIntensity(parseInt(e.target.value))}
                                                className="w-full accent-purple-500 h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB: LAYOUT */}
                        {activeTab === 'layout' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Transform</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['none', 'vertical', 'diagonal', 'reverse_diagonal'].map((mode) => (
                                            <button
                                                key={mode}
                                                onClick={() => setTransformMode(mode as any)}
                                                className={`px-3 py-2 text-xs rounded border transition-colors ${transformMode === mode
                                                        ? 'bg-accent/10 border-accent text-accent'
                                                        : 'bg-secondary border-border text-muted-foreground'
                                                    }`}
                                            >
                                                {mode.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Line Effect</label>
                                    <div className="flex gap-2 bg-secondary p-1 rounded-lg">
                                        {['none', 'wave', 'zigzag', 'stairs'].map((effect) => (
                                            <button
                                                key={effect}
                                                onClick={() => setLineEffect(effect as any)}
                                                className={`flex-1 py-1.5 text-[10px] uppercase font-bold rounded transition-colors ${lineEffect === effect
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                {effect}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Alignment</label>
                                    <div className="flex gap-2">
                                        {['left', 'center', 'right'].map((align) => (
                                            <button
                                                key={align}
                                                onClick={() => setAlignment(align as any)}
                                                className={`flex-1 py-2 rounded border text-xs capitalize ${alignment === align
                                                        ? 'bg-muted border-border text-foreground'
                                                        : 'bg-background border-border text-muted-foreground'
                                                    }`}
                                            >
                                                {align}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: DECOR */}
                        {activeTab === 'decor' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Frame Style</label>
                                    <select
                                        value={selectedFrameId}
                                        onChange={(e) => setSelectedFrameId(e.target.value)}
                                        className="w-full bg-secondary border border-border rounded-lg p-2 text-sm text-foreground focus:border-accent outline-none"
                                    >
                                        {FRAMES.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Background Fill</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text" maxLength={1} placeholder="Space"
                                            value={bgChar} onChange={e => setBgChar(e.target.value)}
                                            className="w-12 h-10 bg-secondary border border-border rounded-lg text-center text-foreground"
                                        />
                                        <div className="flex-1 text-[10px] text-muted-foreground flex items-center">
                                            Replaces spaces with this character.
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 p-3 bg-secondary rounded-lg border border-border">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={shadowEnabled} onChange={e => setShadowEnabled(e.target.checked)} className="w-5 h-5 text-accent rounded bg-background border-border" />
                                        <span className="text-sm font-bold text-foreground">3D Block Shadow</span>
                                    </label>
                                    {shadowEnabled && (
                                        <div className="pt-2 flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">Shadow Char:</span>
                                            <input
                                                type="text" maxLength={1}
                                                value={shadowChar} onChange={e => setShadowChar(e.target.value)}
                                                className="w-8 h-8 bg-background border border-border rounded text-center text-xs"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* TAB: PRESETS */}
                        {activeTab === 'presets' && (
                            <div className="grid grid-cols-2 gap-2 animate-in fade-in zoom-in-95">
                                {ASCII_ART_TEMPLATES.map(tmpl => (
                                    <button
                                        key={tmpl.id}
                                        onClick={() => insertTemplate(tmpl.art)}
                                        className="p-3 bg-secondary rounded-lg border border-border hover:border-accent text-left group transition-all"
                                    >
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1 group-hover:text-accent">{tmpl.category}</div>
                                        <div className="text-sm font-bold text-foreground">{tmpl.name}</div>
                                    </button>
                                ))}
                            </div>
                        )}

                    </div>

                    {/* Reset Button */}
                    <div className="p-3 border-t border-border bg-muted/10">
                        <button
                            onClick={resetAll}
                            className="w-full py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                        >
                            Reset All Settings
                        </button>
                    </div>
                </div>
            </div>

            {/* --- RIGHT COLUMN: PREVIEW --- */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                <div className="flex-1 bg-card rounded-xl border border-border relative group overflow-hidden flex flex-col shadow-2xl min-h-[300px]">
                    {/* Gradient Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-blue-500 to-purple-600 opacity-50"></div>

                    {/* Copy Button */}
                    <div className="absolute top-4 right-4 z-20">
                        <button
                            onClick={copyToClipboard}
                            className={`px-6 py-2 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2 transition-all transform active:scale-95 ${copied
                                    ? 'bg-green-500 text-white'
                                    : 'bg-accent text-accent-foreground hover:bg-accent/90'
                                }`}
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>

                    {/* Output Canvas */}
                    <div className="flex-1 p-8 overflow-auto custom-scrollbar flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-background via-black to-black">
                        <pre className="font-mono text-xl text-emerald-400 whitespace-pre text-center leading-normal">
                            {output}
                        </pre>
                    </div>

                    {/* Info Footer */}
                    <div className="p-3 bg-card border-t border-border flex justify-between items-center text-xs text-muted-foreground font-mono">
                        <span>{output.length} chars</span>
                        <span>{output.split('\n').length} lines</span>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AsciiGenerator;
