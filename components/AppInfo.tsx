
import React, { useState, useEffect } from 'react';
import { FONTS, SMILEYS, KAOMOJI_CATEGORIES, ASCII_ART_TEMPLATES, SOCIAL_POST_TEMPLATES, SEPARATORS, DRAWING_CHARS, ASCII_GALLERY_ITEMS } from '../constants';

const AppInfo: React.FC = () => {
    const [storageUsage, setStorageUsage] = useState<string>('0 KB');

    useEffect(() => {
        let total = 0;
        try {
            for (const key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += ((localStorage[key].length + key.length) * 2);
                }
            }
            setStorageUsage((total / 1024).toFixed(2) + ' KB');
        } catch (e) {
            setStorageUsage('Unknown');
        }
    }, []);

    const handleReset = () => {
        if (confirm('⚠️ DANGER ZONE ⚠️\n\nAre you sure you want to reset ALL local data?\nThis includes favorites, history, drafts, and preferences.\n\nThis action cannot be undone.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const stats = [
        { label: 'ASCII Fonts', value: FONTS.length, icon: '🔤' },
        { label: 'Smileys & Symbols', value: SMILEYS.length + 1000, icon: '😀' },
        { label: 'Art Gallery', value: ASCII_GALLERY_ITEMS.length, icon: '🖼️' },
        { label: 'Kaomoji Categories', value: KAOMOJI_CATEGORIES.length, icon: '(=^･^=)' },
        { label: 'Social Templates', value: SOCIAL_POST_TEMPLATES.length, icon: '📱' },
        { label: 'Separator Styles', value: SEPARATORS.length, icon: '〰️' },
    ];

    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

            {/* Header */}
            <div className="bg-card p-8 rounded-xl border border-border relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                </div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-500 mb-2">
                    ASCIIverse Studio
                </h2>
                <p className="text-muted-foreground max-w-2xl text-lg">
                    The ultimate frontend-only suite for creative text generation, ASCII art, and social media formatting.
                    Designed to be fast, private, and offline-ready.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Badge label="v2.0.0" color="emerald" />
                    <Badge label="MIT License" color="blue" />
                    <Badge label="100% Frontend" color="purple" />
                    <Badge label="Zero Tracking" color="orange" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-card p-4 rounded-xl border border-border text-center hover:border-accent/50 transition-colors group">
                        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                        <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT COLUMN */}
                <div className="space-y-6 lg:col-span-1">

                    {/* Philosophy */}
                    <div className="bg-card p-6 rounded-xl border border-border relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 text-accent opacity-5">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
                            The Philosophy
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed text-justify mb-4">
                            We believe creative tools should be <strong>accessible, private, and permanent</strong>.
                        </p>
                        <ul className="space-y-2 text-xs text-foreground/80">
                            <li className="flex gap-2"><span className="text-accent">✓</span> No servers processing your text.</li>
                            <li className="flex gap-2"><span className="text-accent">✓</span> No tracking cookies or analytics.</li>
                            <li className="flex gap-2"><span className="text-accent">✓</span> No paywalls for basic creativity.</li>
                            <li className="flex gap-2"><span className="text-accent">✓</span> Runs entirely on your device.</li>
                        </ul>
                    </div>

                    {/* Creator Card */}
                    <div className="bg-card p-6 rounded-xl border border-border">
                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            Creator & Contact
                        </h3>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xl border border-border">
                                👨‍💻
                            </div>
                            <div>
                                <div className="font-bold text-foreground">Geoffroy Streit</div>
                                <div className="text-xs text-muted-foreground">Lead Developer & Designer</div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <a href="mailto:geoffroy.streit@gmail.com" className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-muted border border-border transition-colors group">
                                <svg className="text-muted-foreground group-hover:text-accent" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                <span className="text-sm text-foreground/80">geoffroy.streit@gmail.com</span>
                            </a>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="bg-card p-6 rounded-xl border border-border">
                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
                            Data Storage
                        </h3>
                        <div className="flex items-center justify-between mb-4 p-3 bg-background rounded-lg border border-border">
                            <span className="text-muted-foreground text-sm">Used Space</span>
                            <span className="font-mono text-accent font-bold">{storageUsage}</span>
                        </div>

                        <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg">
                            <h4 className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                Danger Zone
                            </h4>
                            <p className="text-[10px] text-red-300/70 mb-3">
                                This will wipe all application data from this browser.
                            </p>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold transition-colors w-full shadow-lg shadow-red-900/20 active:scale-95"
                            >
                                Reset Application Data
                            </button>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Legal & Privacy Section */}
                    <div className="bg-card p-6 rounded-xl border border-border">
                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <svg className="text-muted-foreground" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            Legal, Privacy & License
                        </h3>

                        <div className="space-y-4 text-xs text-muted-foreground leading-relaxed">
                            <div className="p-4 bg-background rounded-lg border border-border">
                                <h4 className="text-sm font-bold text-foreground mb-2">MIT License</h4>
                                <p className="mb-2">
                                    Copyright © {new Date().getFullYear()} Geoffroy Streit.
                                </p>
                                <p className="italic opacity-80">
                                    Permission is hereby granted, free of charge, to any person obtaining a copy of this software... to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.
                                </p>
                                <p className="mt-2 font-bold text-muted-foreground/60">
                                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-bold text-foreground mb-1">Privacy Policy (GDPR)</h4>
                                    <p>
                                        This application operates on a <strong>client-side only</strong> basis.
                                        No personal data, inputs, or drawings are sent to any external server.
                                        All data is stored locally on your device using <code>LocalStorage</code> and <code>IndexedDB</code>.
                                        We do not use cookies for tracking or analytics.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-foreground mb-1">Attribution</h4>
                                    <ul className="list-disc pl-4 space-y-1">
                                        <li>Icons by Lucide & Feather.</li>
                                        <li>Fonts: Inter (Google Fonts) & JetBrains Mono.</li>
                                        <li>Built with React, Tailwind CSS & Vite.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pro Tips Section */}
                    <div className="bg-card p-6 rounded-xl border border-border">
                        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <svg className="text-accent" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" /><path d="M9 21h6" /></svg>
                            Pro Tips & Usage
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TipCard
                                icon="📲"
                                title="Install as App"
                                desc="On mobile, use 'Add to Home Screen' to install this as a native app (PWA). It works completely offline!"
                            />
                            <TipCard
                                icon="💬"
                                title="Discord & Slack"
                                desc="For ASCII art to look right, wrap it in code blocks. Use three backticks (```) before and after your art."
                            />
                            <TipCard
                                icon="💾"
                                title="Auto-Save"
                                desc="Your drafts in Social Studio and drawings are saved automatically to your browser's local storage."
                            />
                            <TipCard
                                icon="🔍"
                                title="Smart Search"
                                desc="In the Emoji Library, you can search by concepts like 'happy' or 'blue' not just the official name."
                            />
                        </div>
                    </div>

                    {/* Module Docs */}
                    <div className="bg-card p-6 rounded-xl border border-border">
                        <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                            Module Documentation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ModuleCard
                                icon="🖼️"
                                title="ASCII Art Gallery"
                                desc="A curated collection of over 500 high-quality ASCII art pieces categorized by theme. One-click copy, optimized for social sharing, with updated categories like Space and Gaming."
                            />
                            <ModuleCard
                                icon="🅰️"
                                title="Weird Text Maker"
                                desc="Transforms standard text into various ASCII styles (Bold, Italic, Script, Bubble). Features a 'Zalgo' glitch generator, frame decorators, and automatic layout alignment tools."
                            />
                            <ModuleCard
                                icon="📱"
                                title="Social Studio"
                                desc="A specialized editor for LinkedIn, Twitter (X), and Instagram. Includes character counting, hashtag management, and live preview cards to see how your post will look before publishing."
                            />
                            <ModuleCard
                                icon="😺"
                                title="Kaomoji Builder"
                                desc="Construct complex Japanese emoticons (Kaomoji) by mixing and matching components: Face Base, Eyes, Mouth, Arms, and Accessories. Includes a history of your creations."
                            />
                            <ModuleCard
                                icon="🎨"
                                title="Draw Canvas"
                                desc="A pixel-art style editor using text characters. Supports brush, eraser, bucket fill, lines, rectangles, and circles. Features symmetry modes (X/Y) for creating mandalas and geometric art."
                            />
                            <ModuleCard
                                icon="📷"
                                title="Image to ASCII"
                                desc="Converts uploaded images into high-fidelity ASCII art. Adjustable resolution, contrast, and character density sets (Standard, Block, Matrix, Binary). Supports color inversion."
                            />
                            <ModuleCard
                                icon="✂️"
                                title="Separator Generator"
                                desc="Create aesthetic line breaks and dividers for social media bios or document structuring. Supports repeating patterns, spacing adjustments, and custom middle characters."
                            />
                            <ModuleCard
                                icon="🔢"
                                title="Table Maker"
                                desc="Parses CSV or JSON data and converts it into perfectly aligned ASCII tables. Supports Markdown, Double Line, and Simple border styles."
                            />
                            <ModuleCard
                                icon="🏷️"
                                title="Username FX"
                                desc="Generates stylized usernames with prefixes, suffixes, and font effects like Glitch or Strikethrough. Simulates availability checks for major platforms."
                            />
                            <ModuleCard
                                icon="😀"
                                title="Emoji Library"
                                desc="A massive, categorized library of 2000+ emojis and symbols. Features a 'Skin Tone' selector, smart search, and an 'Inspector' mode to view Unicode/HTML codes."
                            />
                            <ModuleCard
                                icon="✨"
                                title="Text Decorator"
                                desc="Adds combining characters (diacritics) above, below, or inside text. Perfect for creating 'cursed' text or unique stylistic headers."
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

const Badge = ({ label, color }: { label: string, color: string }) => {
    const colors: Record<string, string> = {
        emerald: 'bg-emerald-900/30 text-emerald-400 border-emerald-800',
        blue: 'bg-blue-900/30 text-blue-400 border-blue-800',
        purple: 'bg-purple-900/30 text-purple-400 border-purple-800',
        orange: 'bg-orange-900/30 text-orange-400 border-orange-800',
    };
    return (
        <span className={`px-3 py-1 border rounded-full text-xs font-mono font-bold ${colors[color] || colors.blue}`}>
            {label}
        </span>
    );
}

const TipCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
    <div className="bg-secondary p-3 rounded-lg border border-border flex gap-3 items-start">
        <div className="text-xl mt-0.5">{icon}</div>
        <div>
            <h4 className="font-bold text-sm text-foreground">{title}</h4>
            <p className="text-xs text-muted-foreground leading-tight mt-1">{desc}</p>
        </div>
    </div>
);

const ModuleCard = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
    <div className="bg-secondary p-4 rounded-lg border border-border hover:border-accent/40 transition-colors">
        <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{icon}</span>
            <span className="font-bold text-sm text-foreground">{title}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
            {desc}
        </p>
    </div>
);

export default AppInfo;
