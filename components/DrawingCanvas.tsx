import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { DRAWING_CHARS } from '../constants';
import { IDB } from '../services/db';
import { DrawingProject } from '../types';

const DEFAULT_W = 40;
const DEFAULT_H = 20;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2;

// Smaller starting grid on phones, so the cells stay large enough to tap
const initialSize = () => (typeof window !== 'undefined' && window.innerWidth < 640
    ? { w: 24, h: 16 }
    : { w: DEFAULT_W, h: DEFAULT_H });
const CELL = 24; // base cell size in px, multiplied by the zoom
const MIN_SIZE = 5;
const MAX_SIZE = 100;

type ToolType = 'pen' | 'eraser' | 'bucket' | 'line' | 'rect' | 'circle';
type SymmetryType = 'none' | 'x' | 'y';

// Palette groups: the known characters by family, the rest in "Other"
const BLOCKS = ['█', '▓', '▒', '░', '▄', '▀', '▌', '▐', '■', '▪'];
const SHAPES = ['●', '○', '◆', '◇', '★', '☆', '☺', '☹', '♥', '♦', '♣', '♠'];
const LINES = ['┼', '─', '│', '┌', '┐', '└', '┘'];
const PALETTE_GROUPS = [
    { name: 'Blocks', chars: DRAWING_CHARS.filter(c => BLOCKS.includes(c)) },
    { name: 'Shapes', chars: DRAWING_CHARS.filter(c => SHAPES.includes(c)) },
    { name: 'Lines', chars: DRAWING_CHARS.filter(c => LINES.includes(c)) },
    { name: 'Other', chars: DRAWING_CHARS.filter(c => c !== ' ' && !BLOCKS.includes(c) && !SHAPES.includes(c) && !LINES.includes(c)) },
].filter(g => g.chars.length > 0);

const TOOLS: { id: ToolType, title: string, key: string, icon: React.ReactNode }[] = [
    { id: 'pen', title: 'Pen', key: 'p', icon: <path d="M12 19l7-7 3 3-7 7-3-3z" /> },
    { id: 'eraser', title: 'Eraser', key: 'e', icon: <path d="M20 20H7L3 16C2 15 2 13 3 12L13 2L22 11L20 20Z" /> },
    { id: 'bucket', title: 'Fill', key: 'f', icon: <path d="M19 11L11 3L2.4 11.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z" /> },
    { id: 'line', title: 'Line', key: 'l', icon: <line x1="5" y1="19" x2="19" y2="5" /> },
    { id: 'rect', title: 'Rectangle', key: 'r', icon: <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /> },
    { id: 'circle', title: 'Circle', key: 'c', icon: <circle cx="12" cy="12" r="10" /> },
];

const blankGrid = (w: number, h: number) => Array(h).fill(null).map(() => Array(w).fill(' '));
const clampSize = (n: number) => Math.min(MAX_SIZE, Math.max(MIN_SIZE, n));

const DrawingCanvas: React.FC = () => {
    // Grid State
    const [init] = useState(initialSize);
    const [width, setWidth] = useState(init.w);
    const [height, setHeight] = useState(init.h);
    const [grid, setGrid] = useState<string[][]>(() => blankGrid(init.w, init.h));
    const [wDraft, setWDraft] = useState(String(init.w));
    const [hDraft, setHDraft] = useState(String(init.h));

    // Editor State
    const [selectedChar, setSelectedChar] = useState('█');
    const [activeTool, setActiveTool] = useState<ToolType>('pen');
    const [symmetry, setSymmetry] = useState<SymmetryType>('none');
    const [zoom, setZoom] = useState(1);
    const [showGridLines, setShowGridLines] = useState(true);

    // Interaction State
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState<{ r: number, c: number } | null>(null);
    const [currentPos, setCurrentPos] = useState<{ r: number, c: number } | null>(null);

    // History & UX
    const [history, setHistory] = useState<string[][][]>(() => [blankGrid(init.w, init.h)]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [notification, setNotification] = useState('');

    // Saved drawings (IndexedDB)
    const [showSaved, setShowSaved] = useState(false);
    const [saved, setSaved] = useState<DrawingProject[]>([]);
    const savedRef = useRef<HTMLDivElement>(null);
    const canvasAreaRef = useRef<HTMLDivElement>(null);

    const notify = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(''), 2000);
    };

    // Fit the grid to the visible width of the canvas area
    const fitToWidth = (w = width) => {
        const area = canvasAreaRef.current;
        if (!area) return;
        const available = area.clientWidth - 32;
        const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.floor((available / (w * CELL)) * 10) / 10));
        setZoom(z);
    };

    useLayoutEffect(() => { fitToWidth(init.w); }, []);

    // --- History Management ---
    const addToHistory = (newGrid: string[][]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newGrid.map(row => [...row]));
        if (newHistory.length > 30) newHistory.shift();
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const undo = () => {
        if (historyIndex > 0) {
            const g = history[historyIndex - 1];
            setHistoryIndex(historyIndex - 1);
            setGrid(g);
            setWidth(g[0].length); setHeight(g.length);
            setWDraft(String(g[0].length)); setHDraft(String(g.length));
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const g = history[historyIndex + 1];
            setHistoryIndex(historyIndex + 1);
            setGrid(g);
            setWidth(g[0].length); setHeight(g.length);
            setWDraft(String(g[0].length)); setHDraft(String(g.length));
        }
    };

    const applySize = () => {
        const w = parseInt(wDraft, 10);
        const h = parseInt(hDraft, 10);
        if (!Number.isFinite(w) || !Number.isFinite(h)) {
            setWDraft(String(width)); setHDraft(String(height));
            return;
        }
        const newW = clampSize(w), newH = clampSize(h);
        setWDraft(String(newW)); setHDraft(String(newH));
        if (newW === width && newH === height) return;
        const newGrid = Array(newH).fill(null).map((_, r) =>
            Array(newW).fill(' ').map((_, c) => (r < grid.length && c < grid[0].length) ? grid[r][c] : ' ')
        );
        setWidth(newW);
        setHeight(newH);
        setGrid(newGrid);
        addToHistory(newGrid);
    };

    const clearCanvas = () => {
        const g = blankGrid(width, height);
        setGrid(g);
        addToHistory(g);
        notify('Cleared (undo available)');
    };

    // Keyboard shortcuts: undo/redo and tools (ignored while typing in a field)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const t = e.target as HTMLElement;
            if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
            const mod = e.ctrlKey || e.metaKey;
            if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
            if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
            if (mod || e.altKey) return;
            const tool = TOOLS.find(x => x.key === e.key.toLowerCase());
            if (tool) setActiveTool(tool.id);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    // Close the saved-drawings menu on outside click
    useEffect(() => {
        if (!showSaved) return;
        const onDown = (e: MouseEvent) => {
            if (savedRef.current && !savedRef.current.contains(e.target as Node)) setShowSaved(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [showSaved]);

    // --- Algorithms ---

    const getSymmetryPoints = (r: number, c: number): { r: number, c: number }[] => {
        const points = [{ r, c }];
        if (symmetry === 'x') points.push({ r, c: width - 1 - c });
        if (symmetry === 'y') points.push({ r: height - 1 - r, c });
        return points;
    };

    const plotLine = (r0: number, c0: number, r1: number, c1: number) => {
        const points: { r: number, c: number }[] = [];
        const dx = Math.abs(c1 - c0);
        const dy = Math.abs(r1 - r0);
        const sx = (c0 < c1) ? 1 : -1;
        const sy = (r0 < r1) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            points.push({ r: r0, c: c0 });
            if ((c0 === c1) && (r0 === r1)) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; c0 += sx; }
            if (e2 < dx) { err += dx; r0 += sy; }
        }
        return points;
    };

    const plotRect = (r0: number, c0: number, r1: number, c1: number) => {
        const points: { r: number, c: number }[] = [];
        const minR = Math.min(r0, r1), maxR = Math.max(r0, r1);
        const minC = Math.min(c0, c1), maxC = Math.max(c0, c1);
        for (let r = minR; r <= maxR; r++) { points.push({ r, c: minC }); points.push({ r, c: maxC }); }
        for (let c = minC; c <= maxC; c++) { points.push({ r: minR, c }); points.push({ r: maxR, c }); }
        return points;
    };

    const plotCircle = (r0: number, c0: number, r1: number, c1: number) => {
        const points: { r: number, c: number }[] = [];
        const radius = Math.floor(Math.sqrt(Math.pow(r1 - r0, 2) + Math.pow(c1 - c0, 2)));
        let x = radius;
        let y = 0;
        let err = 0;
        while (x >= y) {
            points.push({ r: r0 + x, c: c0 + y }, { r: r0 + y, c: c0 + x }, { r: r0 - y, c: c0 + x }, { r: r0 - x, c: c0 + y });
            points.push({ r: r0 - x, c: c0 - y }, { r: r0 - y, c: c0 - x }, { r: r0 + y, c: c0 - x }, { r: r0 + x, c: c0 - y });
            if (err <= 0) { y += 1; err += 2 * y + 1; }
            if (err > 0) { x -= 1; err -= 2 * x + 1; }
        }
        return points;
    };

    const floodFill = (startR: number, startC: number, targetGrid: string[][]) => {
        const targetChar = targetGrid[startR][startC];
        if (targetChar === selectedChar && activeTool !== 'eraser') return targetGrid;
        if (activeTool === 'eraser' && targetChar === ' ') return targetGrid;

        const newGrid = targetGrid.map(row => [...row]);
        const fillChar = activeTool === 'eraser' ? ' ' : selectedChar;
        const stack = [[startR, startC]];

        while (stack.length > 0) {
            const [r, c] = stack.pop()!;
            if (r < 0 || r >= height || c < 0 || c >= width) continue;
            if (newGrid[r][c] !== targetChar) continue;
            newGrid[r][c] = fillChar;
            stack.push([r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]);
        }
        return newGrid;
    };

    // --- Drawing Handlers ---

    const handlePointerDown = (r: number, c: number, e: React.PointerEvent) => {
        e.preventDefault(); // Prevent scroll on touch
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);

        setIsDrawing(true);
        setStartPos({ r, c });
        setCurrentPos({ r, c });

        if (activeTool === 'bucket') {
            const newGrid = floodFill(r, c, grid);
            if (newGrid !== grid) {
                setGrid(newGrid);
                addToHistory(newGrid);
            }
            setIsDrawing(false);
        } else if (activeTool === 'pen' || activeTool === 'eraser') {
            const char = activeTool === 'eraser' ? ' ' : selectedChar;
            const newGrid = grid.map(row => [...row]);
            getSymmetryPoints(r, c).forEach(p => {
                if (p.r >= 0 && p.r < height && p.c >= 0 && p.c < width) newGrid[p.r][p.c] = char;
            });
            setGrid(newGrid);
        }
    };

    const handlePointerEnter = (r: number, c: number) => {
        if (!isDrawing) return;
        setCurrentPos({ r, c });

        if (activeTool === 'pen' || activeTool === 'eraser') {
            const char = activeTool === 'eraser' ? ' ' : selectedChar;
            setGrid(prevGrid => {
                const newGrid = prevGrid.map(row => [...row]);
                getSymmetryPoints(r, c).forEach(p => {
                    if (p.r >= 0 && p.r < height && p.c >= 0 && p.c < width) newGrid[p.r][p.c] = char;
                });
                return newGrid;
            });
        }
    };

    const handlePointerUp = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        if (['line', 'rect', 'circle'].includes(activeTool) && startPos && currentPos) {
            const finalGrid = getPreviewGrid();
            setGrid(finalGrid);
            addToHistory(finalGrid);
        } else if (['pen', 'eraser'].includes(activeTool)) {
            addToHistory(grid);
        }

        setStartPos(null);
        setCurrentPos(null);
    };

    // Visual grid: base grid + shape preview
    const getPreviewGrid = () => {
        if (!isDrawing || !startPos || !currentPos) return grid;
        if (['pen', 'eraser', 'bucket'].includes(activeTool)) return grid;

        const preview = grid.map(row => [...row]);
        let points: { r: number, c: number }[] = [];
        if (activeTool === 'line') points = plotLine(startPos.r, startPos.c, currentPos.r, currentPos.c);
        else if (activeTool === 'rect') points = plotRect(startPos.r, startPos.c, currentPos.r, currentPos.c);
        else if (activeTool === 'circle') points = plotCircle(startPos.r, startPos.c, currentPos.r, currentPos.c);

        points.forEach(pt => {
            getSymmetryPoints(pt.r, pt.c).forEach(symPt => {
                if (symPt.r >= 0 && symPt.r < height && symPt.c >= 0 && symPt.c < width) preview[symPt.r][symPt.c] = selectedChar;
            });
        });
        return preview;
    };

    const displayGrid = getPreviewGrid();

    // --- Actions ---

    const copyToClipboard = () => {
        const text = grid.map(row => row.join('').replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
        navigator.clipboard.writeText(text);
        notify('Copied!');
    };

    const saveProject = async () => {
        try {
            await IDB.saveDrawing({
                name: `Art ${new Date().toLocaleString()}`,
                width, height, data: grid, updatedAt: Date.now()
            });
            notify('Saved in this browser');
            if (showSaved) loadSaved();
        } catch (e) {
            console.error(e);
            notify('Save failed');
        }
    };

    const loadSaved = async () => {
        try {
            const all = await IDB.getAllDrawings();
            setSaved(all.sort((a, b) => b.updatedAt - a.updatedAt));
        } catch (e) {
            console.error(e);
            setSaved([]);
        }
    };

    const openDrawing = (p: DrawingProject) => {
        const g = p.data.map(row => [...row]);
        setWidth(p.width); setHeight(p.height);
        setWDraft(String(p.width)); setHDraft(String(p.height));
        setGrid(g);
        addToHistory(g);
        setShowSaved(false);
        fitToWidth(p.width);
        notify('Drawing opened');
    };

    const removeDrawing = async (id: number) => {
        await IDB.deleteDrawing(id);
        loadSaved();
    };

    const cellPx = CELL * zoom;
    const iconBtn = "p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent";

    return (
        <div className="flex flex-col gap-3 lg:h-[calc(100dvh-6.5rem)] lg:min-h-[560px]" onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>

            {/* Toolbar */}
            <div className="bg-card p-2 rounded-xl border border-border flex flex-wrap items-center gap-2 shrink-0 shadow-sm">

                <div className="flex gap-0.5 p-1 bg-muted/20 rounded-lg border border-border" role="toolbar" aria-label="Drawing tools">
                    {TOOLS.map((tool, i) => (
                        <React.Fragment key={tool.id}>
                            {i === 3 && <div className="w-px bg-border mx-1 self-center h-4" />}
                            <ToolBtn active={activeTool === tool.id} onClick={() => setActiveTool(tool.id)} icon={tool.icon} title={`${tool.title} (${tool.key.toUpperCase()})`} />
                        </React.Fragment>
                    ))}
                </div>

                <select
                    value={symmetry}
                    onChange={e => setSymmetry(e.target.value as SymmetryType)}
                    className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
                    aria-label="Symmetry"
                    title="Symmetry"
                >
                    <option value="none">No symmetry</option>
                    <option value="x">Mirror left / right</option>
                    <option value="y">Mirror top / bottom</option>
                </select>

                <form
                    className="flex items-center gap-1"
                    onSubmit={e => { e.preventDefault(); applySize(); }}
                    title="Grid size in characters (5 to 100)"
                >
                    <label className="text-[10px] uppercase font-bold text-muted-foreground" htmlFor="draw-w">Size</label>
                    <input id="draw-w" inputMode="numeric" value={wDraft} onChange={e => setWDraft(e.target.value.replace(/\D/g, ''))} onBlur={applySize} className="w-11 bg-background border border-border rounded text-xs p-1 text-center text-foreground" aria-label="Width" />
                    <span className="text-muted-foreground/60 text-xs">×</span>
                    <input inputMode="numeric" value={hDraft} onChange={e => setHDraft(e.target.value.replace(/\D/g, ''))} onBlur={applySize} className="w-11 bg-background border border-border rounded text-xs p-1 text-center text-foreground" aria-label="Height" />
                    <button type="submit" className="sr-only" tabIndex={-1}>Apply size</button>
                </form>

                <div className="flex items-center gap-1">
                    <button onClick={() => setZoom(z => Math.max(MIN_ZOOM, Math.round((z - 0.1) * 10) / 10))} className={iconBtn} aria-label="Zoom out" title="Zoom out">−</button>
                    <input type="range" min={MIN_ZOOM} max={MAX_ZOOM} step="0.1" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} className="w-16 sm:w-20 accent-accent" aria-label="Zoom" />
                    <button onClick={() => setZoom(z => Math.min(MAX_ZOOM, Math.round((z + 0.1) * 10) / 10))} className={iconBtn} aria-label="Zoom in" title="Zoom in">+</button>
                    <button onClick={() => fitToWidth()} className="px-2 py-1 text-[10px] font-bold uppercase rounded border border-border text-muted-foreground hover:text-foreground" title="Fit the grid to the width">Fit</button>
                    <span className="text-[10px] font-mono text-muted-foreground w-9 text-right">{Math.round(zoom * 100)}%</span>
                </div>

                <button
                    onClick={() => setShowGridLines(!showGridLines)}
                    aria-pressed={showGridLines}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded border ${showGridLines ? 'border-accent text-accent' : 'border-border text-muted-foreground'}`}
                >
                    Grid
                </button>

                <div className="flex-1"></div>

                <div className="flex items-center gap-1">
                    <button onClick={undo} disabled={historyIndex <= 0} className={iconBtn} aria-label="Undo" title="Undo (Ctrl+Z)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" /></svg></button>
                    <button onClick={redo} disabled={historyIndex >= history.length - 1} className={iconBtn} aria-label="Redo" title="Redo (Ctrl+Y)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 14 5-5-5-5" /><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13" /></svg></button>
                    <div className="w-px bg-border h-6 self-center mx-1"></div>
                    <button onClick={clearCanvas} className="p-2 text-destructive hover:bg-muted rounded" title="Clear the canvas" aria-label="Clear the canvas"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg></button>
                    <button onClick={saveProject} className={iconBtn} title="Save in this browser" aria-label="Save in this browser"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg></button>
                    <div ref={savedRef} className="relative">
                        <button
                            onClick={() => { const next = !showSaved; setShowSaved(next); if (next) loadSaved(); }}
                            className={`${iconBtn} ${showSaved ? 'text-accent' : ''}`}
                            title="Open a saved drawing"
                            aria-label="Open a saved drawing"
                            aria-expanded={showSaved}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                        </button>
                        {showSaved && (
                            <div className="absolute right-0 top-full mt-2 z-50 w-[min(18rem,calc(100vw-2rem))] bg-card border border-border rounded-xl shadow-2xl p-2 max-h-72 overflow-y-auto custom-scrollbar">
                                {saved.length === 0 ? (
                                    <p className="p-2 text-xs text-muted-foreground italic">No saved drawing in this browser yet.</p>
                                ) : saved.map(p => (
                                    <div key={p.id} className="flex items-center gap-1">
                                        <button onClick={() => openDrawing(p)} className="flex-1 min-w-0 text-left px-2 py-1.5 rounded hover:bg-muted text-xs text-foreground">
                                            <span className="block truncate font-bold">{p.name}</span>
                                            <span className="text-[10px] text-muted-foreground">{p.width} × {p.height}</span>
                                        </button>
                                        <button onClick={() => removeDrawing(p.id)} className="px-2 py-1 text-muted-foreground hover:text-destructive" aria-label={`Delete ${p.name}`} title="Delete">×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={copyToClipboard} className="bg-accent text-accent-foreground px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 min-w-[4.5rem]">
                        {notification === 'Copied!' ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>

            {notification && notification !== 'Copied!' && (
                <div className="text-[11px] text-accent font-bold -mt-1 px-1" role="status">{notification}</div>
            )}

            <div className="flex-1 flex flex-col lg:flex-row gap-3 min-h-0">

                {/* Character palette (above the canvas on small screens, on the right on large ones) */}
                <div className="lg:order-2 lg:w-56 shrink-0 bg-card rounded-xl border border-border flex flex-col overflow-hidden">
                    <div className="px-3 py-2 border-b border-border flex items-center gap-3">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Character</span>
                        <span className="w-8 h-8 flex items-center justify-center rounded bg-accent text-accent-foreground text-lg font-mono" aria-label={`Selected character ${selectedChar}`}>{selectedChar}</span>
                        <input
                            maxLength={2}
                            placeholder="Any…"
                            className="ml-auto w-16 h-8 bg-background border border-border rounded text-center text-sm text-foreground focus:border-accent focus:outline-none"
                            onChange={(e) => { const ch = Array.from(e.target.value).pop(); if (ch) setSelectedChar(ch); }}
                            value={DRAWING_CHARS.includes(selectedChar) ? '' : selectedChar}
                            aria-label="Custom character"
                            title="Type any character to draw with it"
                        />
                    </div>
                    <div className="p-2 overflow-y-auto custom-scrollbar max-h-36 lg:max-h-none lg:flex-1 space-y-2">
                        {PALETTE_GROUPS.map(group => (
                            <div key={group.name}>
                                <div className="text-[9px] font-bold uppercase text-muted-foreground/70 mb-1">{group.name}</div>
                                <div className="grid grid-cols-10 sm:grid-cols-12 lg:grid-cols-5 gap-1">
                                    {group.chars.map(char => (
                                        <button
                                            key={char}
                                            onClick={() => setSelectedChar(char)}
                                            aria-pressed={selectedChar === char}
                                            className={`aspect-square flex items-center justify-center rounded text-base font-mono border transition-colors ${selectedChar === char
                                                ? 'bg-accent text-accent-foreground border-accent'
                                                : 'bg-secondary text-muted-foreground border-border hover:bg-muted hover:text-foreground'}`}
                                        >
                                            {char}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Canvas Area: safe centering, the grid starts at the top and scrolls when zoomed */}
                <div ref={canvasAreaRef} className="lg:order-1 flex-1 min-h-[16rem] max-h-[75vh] lg:max-h-none lg:min-h-0 bg-background/50 border border-border rounded-xl overflow-auto custom-scrollbar flex">
                    <div
                        className="mx-auto lg:m-auto p-4 shrink-0"
                    >
                        <div
                            className="grid bg-card shadow-2xl touch-none select-none"
                            style={{
                                width: width * cellPx,
                                height: height * cellPx,
                                gridTemplateColumns: `repeat(${width}, 1fr)`,
                                gridTemplateRows: `repeat(${height}, 1fr)`,
                            }}
                            aria-label={`Drawing grid, ${width} by ${height}`}
                        >
                            {displayGrid.map((row, r) => (
                                row.map((cell, c) => (
                                    <div
                                        key={`${r}-${c}`}
                                        onPointerDown={(e) => handlePointerDown(r, c, e)}
                                        onPointerEnter={() => handlePointerEnter(r, c)}
                                        className={`flex items-center justify-center text-accent hover:bg-muted/50 ${showGridLines ? 'border-[0.5px] border-border/30' : ''}`}
                                        style={{ fontSize: `${Math.round(14 * zoom)}px`, lineHeight: '1' }}
                                    >
                                        {cell}
                                    </div>
                                ))
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-[10px] text-muted-foreground/70 px-1 shrink-0">
                Shortcuts: P pen, E eraser, F fill, L line, R rectangle, C circle, Ctrl+Z undo, Ctrl+Y redo. Drawings are saved in this browser only.
            </p>
        </div>
    );
};

const ToolBtn = ({ active, onClick, icon, title }: { active: boolean, onClick: () => void, icon: React.ReactNode, title: string }) => (
    <button
        onClick={onClick}
        title={title}
        aria-label={title}
        aria-pressed={active}
        className={`p-2 rounded-md transition-colors ${active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
    >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {icon}
        </svg>
    </button>
);

export default DrawingCanvas;
