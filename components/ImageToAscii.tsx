import React, { useState, useRef, useEffect } from 'react';
import { ASCII_DENSITY_SETS } from '../constants';

const ImageToAscii: React.FC = () => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [asciiArt, setAsciiArt] = useState<string>('');

    // Processing Settings
    const [resolution, setResolution] = useState(100); // Width in chars
    const [contrast, setContrast] = useState(1.0);
    const [densitySet, setDensitySet] = useState<keyof typeof ASCII_DENSITY_SETS>('standard');
    const [inverted, setInverted] = useState(false);
    const [verticalScale, setVerticalScale] = useState(0.55); // Aspect ratio correction

    // View Settings
    const [fontSize, setFontSize] = useState(8);
    const [processing, setProcessing] = useState(false);
    const [copied, setCopied] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setImageSrc(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const processImage = () => {
        if (!imageSrc || !canvasRef.current) return;
        setProcessing(true);

        const img = new Image();
        img.src = imageSrc;
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            // Aspect Ratio Calculation
            const aspectRatio = img.height / img.width;
            const finalWidth = resolution;
            const finalHeight = Math.floor(finalWidth * aspectRatio * verticalScale);

            canvas.width = finalWidth;
            canvas.height = finalHeight;

            // Fill white first for transparency handling
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, finalWidth, finalHeight);

            ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

            const imageData = ctx.getImageData(0, 0, finalWidth, finalHeight);
            const data = imageData.data;
            let asciiStr = "";

            const chars = ASCII_DENSITY_SETS[densitySet];
            const charsLen = chars.length;

            for (let y = 0; y < finalHeight; y++) {
                for (let x = 0; x < finalWidth; x++) {
                    const offset = (y * finalWidth + x) * 4;
                    const r = data[offset];
                    const g = data[offset + 1];
                    const b = data[offset + 2];

                    // Brightness
                    let brightness = (0.299 * r + 0.587 * g + 0.114 * b);

                    // Contrast
                    brightness = ((brightness - 128) * contrast) + 128;
                    brightness = Math.max(0, Math.min(255, brightness));

                    let charIndex;
                    if (inverted) {
                        charIndex = Math.floor(((255 - brightness) / 255) * (charsLen - 1));
                    } else {
                        charIndex = Math.floor((brightness / 255) * (charsLen - 1));
                    }

                    charIndex = Math.max(0, Math.min(charsLen - 1, charIndex));
                    asciiStr += chars[charIndex];
                }
                asciiStr += "\n";
            }

            setAsciiArt(asciiStr);
            setProcessing(false);
        };
    };

    useEffect(() => {
        if (imageSrc) {
            processImage();
        }
    }, [imageSrc, resolution, contrast, densitySet, inverted, verticalScale]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(asciiArt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        // Use h-auto on mobile to allow scrolling, lg:h-full to lock to viewport on desktop
        <div className="flex flex-col lg:h-full gap-4 min-h-0 pb-10 lg:pb-0">

            <div className="flex flex-col lg:flex-row gap-6 lg:h-full min-h-0">

                {/* --- LEFT: Settings Panel --- */}
                {/* On mobile: standard block. On Desktop: scrollable sidebar */}
                <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 lg:overflow-y-auto custom-scrollbar pr-1">

                    {/* Upload Card */}
                    <div className="bg-card p-4 rounded-xl border border-border shrink-0">
                        <h3 className="text-accent font-bold flex items-center gap-2 mb-3 text-sm uppercase tracking-wider">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                            Source Image
                        </h3>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="group relative border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-accent hover:bg-muted transition-all min-h-[120px] flex flex-col items-center justify-center overflow-hidden"
                        >
                            {imageSrc ? (
                                <>
                                    <img src={imageSrc} alt="Preview" className="max-h-32 w-full object-contain rounded shadow-lg" />
                                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                        <span className="text-foreground text-xs font-bold">Replace Image</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-muted-foreground space-y-2">
                                    <div className="mx-auto w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-muted transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-foreground">Upload Image</p>
                                        <p className="text-[10px] text-muted-foreground/60">JPG, PNG, WEBP</p>
                                    </div>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Controls Card */}
                    <div className="bg-card p-4 rounded-xl border border-border space-y-5">
                        <h3 className="text-accent font-bold text-sm uppercase tracking-wider">Parameters</h3>

                        {/* Resolution */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-muted-foreground">Resolution (Width)</span>
                                <span className="text-foreground">{resolution} chars</span>
                            </div>
                            <input
                                type="range" min="20" max="300" step="5"
                                value={resolution}
                                onChange={(e) => setResolution(parseInt(e.target.value))}
                                className="w-full accent-accent h-1.5 bg-muted rounded-lg appearance-none cursor-pointer hover:bg-muted/80"
                            />
                        </div>

                        {/* Vertical Scale */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-muted-foreground">Vertical Scale</span>
                                <span className="text-foreground">{verticalScale.toFixed(2)}x</span>
                            </div>
                            <input
                                type="range" min="0.3" max="1.0" step="0.01"
                                value={verticalScale}
                                onChange={(e) => setVerticalScale(parseFloat(e.target.value))}
                                className="w-full accent-blue-500 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer hover:bg-muted/80"
                            />
                            <p className="text-[10px] text-muted-foreground/60">Fix crushed height (Aspect Ratio).</p>
                        </div>

                        {/* Contrast */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-muted-foreground">Contrast</span>
                                <span className="text-foreground">{contrast.toFixed(1)}</span>
                            </div>
                            <input
                                type="range" min="0.5" max="3.0" step="0.1"
                                value={contrast}
                                onChange={(e) => setContrast(parseFloat(e.target.value))}
                                className="w-full accent-purple-500 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer hover:bg-muted/80"
                            />
                        </div>

                        {/* Char Set */}
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground font-medium">Character Set</label>
                            <select
                                value={densitySet}
                                onChange={(e) => setDensitySet(e.target.value as any)}
                                className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground focus:outline-none focus:border-accent"
                            >
                                {Object.keys(ASCII_DENSITY_SETS).map(key => (
                                    <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>
                                ))}
                            </select>
                        </div>

                        {/* Toggles */}
                        <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg cursor-pointer hover:bg-muted transition-colors" onClick={() => setInverted(!inverted)}>
                            <div className={`w-9 h-5 rounded-full relative transition-colors ${inverted ? 'bg-accent' : 'bg-muted'}`}>
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${inverted ? 'left-5' : 'left-1'}`} />
                            </div>
                            <span className="text-xs font-bold text-foreground">Invert Colors</span>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: Preview Panel --- */}
                <div className="flex-1 flex flex-col gap-4 min-h-0 min-w-0">

                    {/* Toolbar */}
                    <div className="flex items-center justify-between gap-4 bg-card p-2 px-4 rounded-xl border border-border shrink-0">
                        <div className="flex items-center gap-4 min-w-0">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:inline">Preview</span>
                            <div className="h-4 w-px bg-border hidden sm:block"></div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">Size: {fontSize}px</span>
                                <input
                                    type="range" min="4" max="24" step="1"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                                    className="w-24 accent-accent h-1 bg-muted rounded appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={copyToClipboard}
                                className={`px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95 ${copied ? 'bg-green-500 text-white' : 'bg-accent text-accent-foreground hover:opacity-90'
                                    }`}
                            >
                                {copied ? 'Copied' : 'Copy Text'}
                            </button>
                        </div>
                    </div>

                    {/* Output Area */}
                    {/* Note: min-h-[500px] ensures it doesn't collapse on mobile when stacked */}
                    <div className="flex-1 bg-background rounded-xl border border-border overflow-hidden relative group flex flex-col shadow-2xl min-h-[500px] lg:min-h-0">
                        <div className="flex-1 overflow-auto custom-scrollbar p-8 flex items-start justify-center">
                            {asciiArt ? (
                                <pre
                                    style={{
                                        fontSize: `${fontSize}px`,
                                        lineHeight: `${fontSize}px`,
                                        fontFamily: "'JetBrains Mono', 'Courier New', monospace"
                                    }}
                                    className="text-accent whitespace-pre text-center origin-top select-text"
                                >
                                    {asciiArt}
                                </pre>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 select-none">
                                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center border border-border">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                    </div>
                                    <p className="text-sm font-medium">Upload an image to generate ASCII art</p>
                                </div>
                            )}
                        </div>

                        {/* Info Bar */}
                        {asciiArt && (
                            <div className="absolute bottom-0 left-0 right-0 bg-card/90 backdrop-blur text-[10px] text-muted-foreground p-2 px-4 flex justify-between items-center border-t border-border">
                                <span>{resolution} cols x {asciiArt.split('\n').length} rows</span>
                                <span>{(asciiArt.length / 1024).toFixed(1)} KB</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hidden Canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default ImageToAscii;