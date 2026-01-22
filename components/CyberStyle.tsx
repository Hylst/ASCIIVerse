
import React, { useState } from 'react';

type CyberPreset = 'matrix' | 'glitch' | 'borg' | 'retro' | 'cyber';

const CyberStyle: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [selectedPreset, setSelectedPreset] = useState<CyberPreset>('matrix');
    const [intensity, setIntensity] = useState(50);
    const [copied, setCopied] = useState(false);

    // Unicode combining characters for effects
    const glitchChars = ['̸', '̵', '̶', '̷', '̴', '̡', '̢', '̧', '̨', '̛', '̖', '̗', '̘', '̙', '̜', '̝', '̞', '̟', '̠', '̤', '̥', '̦', '̩', '̪', '̫', '̬', '̭', '̮', '̯'];
    const matrixChars = ['̀', '́', '̂', '̃', '̄', '̅', '̆', '̇', '̈', '̉', '̊', '̋', '̌', '̍', '̎', '̏', '̐', '̑', '̒', '̓', '̔'];
    const cyberSymbols = ['◢', '◣', '◤', '◥', '▰', '▱', '►', '◄', '▓', '▒', '░', '█', '▄', '▀', '■', '□', '▪', '▫', '●', '○', '◆', '◇'];
    const borgPrefix = ['Unit', 'Designation', 'Drone', 'Node', 'Agent', 'Entity', 'Module', 'Sector'];
    const retroFrames = ['▐', '▌', '█', '▀', '▄', '░', '▒', '▓'];

    const presets = [
        {
            id: 'matrix' as CyberPreset,
            name: 'Matrix',
            icon: '🟢',
            description: 'Effet pluie binaire avec caractères de combinaison',
            color: 'from-green-500 to-emerald-600'
        },
        {
            id: 'glitch' as CyberPreset,
            name: 'Glitch',
            icon: '⚡',
            description: 'Distorsion numérique type corruption de données',
            color: 'from-red-500 to-pink-600'
        },
        {
            id: 'borg' as CyberPreset,
            name: 'Borg',
            icon: '🤖',
            description: 'Désignation cybernétique collective',
            color: 'from-cyan-500 to-blue-600'
        },
        {
            id: 'retro' as CyberPreset,
            name: 'Retro',
            icon: '📟',
            description: 'Terminal vintage avec cadres ASCII',
            color: 'from-orange-500 to-amber-600'
        },
        {
            id: 'cyber' as CyberPreset,
            name: 'Cyber',
            icon: '⚙️',
            description: 'Symboles cyberpunk et accents futuristes',
            color: 'from-purple-500 to-indigo-600'
        }
    ];

    const transformations: Record<CyberPreset, (text: string) => string> = {
        matrix: (text) => {
            return text.split('').map((char, index) => {
                if (char === ' ') return char;
                const numEffects = Math.floor((intensity / 100) * 3);
                let result = char;
                for (let i = 0; i < numEffects; i++) {
                    result += matrixChars[Math.floor(Math.random() * matrixChars.length)];
                }
                // Add binary rain effect
                if (Math.random() < (intensity / 100) * 0.5) {
                    result = `${Math.random() > 0.5 ? '1' : '0'}${result}${Math.random() > 0.5 ? '1' : '0'}`;
                }
                return result;
            }).join('');
        },

        glitch: (text) => {
            return text.split('').map((char, index) => {
                if (char === ' ') return char;
                const shouldGlitch = Math.random() < (intensity / 100);
                if (!shouldGlitch) return char;

                const numGlitches = Math.floor(Math.random() * 4) + 1;
                let result = char;

                // Add glitch combining chars
                for (let i = 0; i < numGlitches; i++) {
                    result += glitchChars[Math.floor(Math.random() * glitchChars.length)];
                }

                // Random char replacement
                if (Math.random() < 0.3) {
                    const glitchChar = String.fromCharCode(33 + Math.floor(Math.random() * 94));
                    result = glitchChar + result;
                }

                return result;
            }).join('');
        },

        borg: (text) => {
            const words = text.trim().split(/\s+/);
            const prefix = borgPrefix[Math.floor(Math.random() * borgPrefix.length)];
            const numbers = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('');
            const sector = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
                String.fromCharCode(65 + Math.floor(Math.random() * 26));

            const designation = `[${prefix}-${numbers}-${sector}]`;
            const processed = words.map(word => {
                return word.split('').map((char, i) => {
                    if (Math.random() < (intensity / 200)) {
                        return char + '̵';
                    }
                    return char;
                }).join('');
            }).join(' ');

            return `${designation}\n${processed}\n[ASSIMILATION: ${intensity}%]`;
        },

        retro: (text) => {
            const lines = text.split('\n');
            const maxLength = Math.max(...lines.map(l => l.length), 40);
            const border = retroFrames[0].repeat(maxLength + 4);

            const framedLines = lines.map(line => {
                const padded = line.padEnd(maxLength);
                const chars = padded.split('').map((char, i) => {
                    if (Math.random() < (intensity / 300)) {
                        return retroFrames[Math.floor(Math.random() * retroFrames.length)];
                    }
                    return char;
                }).join('');
                return `${retroFrames[1]} ${chars} ${retroFrames[2]}`;
            });

            const cursorLine = intensity > 50 ? `\n${' '.repeat(Math.floor(maxLength / 2))}▂` : '';

            return `${border}\n${framedLines.join('\n')}\n${border}${cursorLine}`;
        },

        cyber: (text) => {
            return text.split('').map((char, index) => {
                if (char === ' ') return ' ';

                const shouldDecorate = Math.random() < (intensity / 100);
                if (!shouldDecorate) return char;

                // Add cyber symbols
                const before = Math.random() < 0.5 ? cyberSymbols[Math.floor(Math.random() * cyberSymbols.length)] : '';
                const after = Math.random() < 0.5 ? cyberSymbols[Math.floor(Math.random() * cyberSymbols.length)] : '';

                // Add combining accents
                const accent = Math.random() < 0.7 ? matrixChars[Math.floor(Math.random() * matrixChars.length)] : '';

                return `${before}${char}${accent}${after}`;
            }).join('');
        }
    };

    const applyTransform = () => {
        const result = transformations[selectedPreset](inputText);
        setOutputText(result);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(outputText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const exampleTexts: Record<CyberPreset, string> = {
        matrix: 'Wake up, Neo...',
        glitch: 'System Error 404',
        borg: 'Resistance is futile',
        retro: 'LOADING...\nSYSTEM READY\n> _',
        cyber: 'CYBERPUNK 2077'
    };

    return (
        <div className="flex flex-col gap-6 pb-12">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 animate-pulse">
                    <span className="text-2xl">⚡</span>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Cyber Style</h1>
                    <p className="text-sm text-muted-foreground">Transformations cyberpunk & rétro-futuristes</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left: Presets */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-card rounded-xl border border-border p-4">
                        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                            <span>🎨</span>
                            Presets
                        </h3>
                        <div className="space-y-2">
                            {presets.map((preset) => (
                                <button
                                    key={preset.id}
                                    onClick={() => setSelectedPreset(preset.id)}
                                    className={`w-full text-left p-3 rounded-xl transition-all relative overflow-hidden group ${selectedPreset === preset.id
                                            ? 'ring-2 ring-white/20 shadow-lg'
                                            : 'hover:bg-muted'
                                        }`}
                                >
                                    {selectedPreset === preset.id && (
                                        <div className={`absolute inset-0 bg-gradient-to-r ${preset.color} opacity-20`}></div>
                                    )}
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xl">{preset.icon}</span>
                                            <span className="font-bold text-foreground text-sm">{preset.name}</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground leading-tight">
                                            {preset.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Intensity Control */}
                    <div className="bg-card rounded-xl border border-border p-4">
                        <h3 className="text-sm font-bold text-foreground mb-3">Intensité</h3>
                        <div className="space-y-2">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={intensity}
                                onChange={(e) => setIntensity(Number(e.target.value))}
                                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Subtle</span>
                                <span className="font-mono font-bold text-accent">{intensity}%</span>
                                <span>Intense</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Load */}
                    <div className="bg-card rounded-xl border border-border p-4">
                        <h3 className="text-sm font-bold text-foreground mb-3">Exemple</h3>
                        <button
                            onClick={() => setInputText(exampleTexts[selectedPreset])}
                            className="w-full px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-xs text-foreground transition-colors"
                        >
                            Charger l'exemple
                        </button>
                    </div>
                </div>

                {/* Right: Editor */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Input */}
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Texte Source</span>
                            <span className="text-[10px] text-muted-foreground">{inputText.length} caractères</span>
                        </div>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Entrez votre texte ici..."
                            className="w-full h-48 p-4 bg-transparent text-foreground resize-none focus:outline-none font-mono text-sm"
                        />
                    </div>

                    {/* Transform Button */}
                    <button
                        onClick={applyTransform}
                        disabled={!inputText}
                        className={`w-full py-4 bg-gradient-to-r ${presets.find(p => p.id === selectedPreset)?.color} text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <span className="text-xl">{presets.find(p => p.id === selectedPreset)?.icon}</span>
                        <span>Appliquer {presets.find(p => p.id === selectedPreset)?.name}</span>
                        <span className="text-xl">{presets.find(p => p.id === selectedPreset)?.icon}</span>
                    </button>

                    {/* Output */}
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Résultat</span>
                            {outputText && (
                                <button
                                    onClick={handleCopy}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-accent text-white hover:bg-accent/90'
                                        }`}
                                >
                                    {copied ? '✓ Copié' : 'Copier'}
                                </button>
                            )}
                        </div>
                        <div className={`p-4 min-h-48 bg-gradient-to-br ${selectedPreset === 'matrix' ? 'from-green-950/20 to-black' : selectedPreset === 'glitch' ? 'from-red-950/20 to-black' : selectedPreset === 'borg' ? 'from-cyan-950/20 to-black' : selectedPreset === 'retro' ? 'from-orange-950/20 to-black' : 'from-purple-950/20 to-black'}`}>
                            <pre className="text-foreground font-mono text-sm whitespace-pre-wrap break-words">
                                {outputText || 'Le texte transformé apparaîtra ici...'}
                            </pre>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-card rounded-xl border border-border p-4">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">💡</div>
                            <div>
                                <h4 className="text-sm font-bold text-foreground mb-1">Astuce</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Les effets utilisent des caractères de combinaison Unicode.
                                    Certains rendus peuvent varier selon la police et la plateforme.
                                    Ajustez l'<strong>intensité</strong> pour un meilleur résultat.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CyberStyle;
