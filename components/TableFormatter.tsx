
import React, { useState, useMemo, useEffect } from 'react';

type BorderStyle = 'simple' | 'double' | 'markdown' | 'compact' | 'none' | 'mysql' | 'rounded' | 'heavy' | 'dots';
type Alignment = 'left' | 'center' | 'right';

interface ColumnConfig {
    alignment: Alignment;
    maxWidth: number; // 0 for auto
}

const TableFormatter: React.FC = () => {
    const [inputData, setInputData] = useState('Name, Role, Level, Status\nAlice, Developer, Senior, Active\nBob, Designer, Mid, Active\nCharlie, Manager, Lead, Leave');
    const [inputType, setInputType] = useState<'auto' | 'csv' | 'json'>('auto');

    // Style settings
    const [borderStyle, setBorderStyle] = useState<BorderStyle>('simple');
    const [padding, setPadding] = useState(1);
    const [verticalPadding, setVerticalPadding] = useState(0);
    const [globalAlignment, setGlobalAlignment] = useState<Alignment>('left');
    const [mergeCells, setMergeCells] = useState(false);

    // Column specific settings
    const [colConfigs, setColConfigs] = useState<ColumnConfig[]>([]);
    const [forceColSync, setForceColSync] = useState(0); // Trigger to force re-calc

    const [error, setError] = useState('');

    // SAMPLES
    const loadSample = (type: 'users' | 'sales' | 'inventory') => {
        const samples = {
            users: 'Name, Role, Level, Status\nAlice, Developer, Senior, Active\nBob, Designer, Mid, Active\nCharlie, Manager, Lead, Leave',
            sales: 'Product\tQ1\tQ2\tQ3\tTotal\nWidget A\t150\t200\t180\t530\nWidget B\t90\t110\t95\t295\nGadget X\t300\t310\t320\t930',
            inventory: `[
  {"id": 101, "item": "Keyboard", "stock": 45, "price": "$120"},
  {"id": 102, "item": "Mouse", "stock": 12, "price": "$65"},
  {"id": 103, "item": "Monitor", "stock": 8, "price": "$350"}
]`
        };
        setInputData(samples[type]);
        setInputType(type === 'inventory' ? 'json' : 'auto');
    };

    const parsedData = useMemo(() => {
        setError('');
        try {
            let headers: string[] = [];
            let rows: string[][] = [];

            const isJson = inputType === 'json' || (inputType === 'auto' && inputData.trim().startsWith('['));

            if (isJson) {
                const json = JSON.parse(inputData);
                if (Array.isArray(json) && json.length > 0) {
                    headers = Object.keys(json[0]);
                    rows = json.map(obj => headers.map(h => String(obj[h] ?? '')));
                } else if (Array.isArray(json)) {
                    headers = []; rows = [];
                } else {
                    throw new Error("JSON must be an array of objects");
                }
            } else {
                // CSV / TSV Parsing
                const lines = inputData.split('\n').filter(l => l.trim() !== '');
                if (lines.length === 0) return { headers: [], rows: [] };

                // Detect Separator: Check first line
                const firstLine = lines[0];
                const tabCount = (firstLine.match(/\t/g) || []).length;
                const commaCount = (firstLine.match(/,/g) || []).length;
                const separator = tabCount > commaCount ? '\t' : ',';

                const parseLine = (line: string) => {
                    if (separator === '\t') return line.split('\t').map(c => c.trim());

                    // Simple CSV regex for quoted strings
                    const result = [];
                    let current = '';
                    let inQuote = false;
                    for (let i = 0; i < line.length; i++) {
                        const char = line[i];
                        if (char === '"') { inQuote = !inQuote; continue; }
                        if (char === ',' && !inQuote) {
                            result.push(current.trim());
                            current = '';
                        } else {
                            current += char;
                        }
                    }
                    result.push(current.trim());
                    return result;
                };

                const parsedRows = lines.map(parseLine);
                headers = parsedRows[0];
                rows = parsedRows.slice(1);
            }

            return { headers, rows };
        } catch (e) {
            setError((e as Error).message);
            return { headers: [], rows: [] };
        }
    }, [inputData, inputType]);

    // Sync Column Configs when headers change
    useEffect(() => {
        setColConfigs(prev => {
            const newConfigs: ColumnConfig[] = [];
            parsedData.headers.forEach((_, i) => {
                // Preserve existing config if possible, else default
                if (prev[i]) newConfigs.push(prev[i]);
                else newConfigs.push({ alignment: 'left', maxWidth: 0 });
            });
            return newConfigs;
        });
    }, [parsedData.headers.length, forceColSync]);

    // Bulk update alignment when global changes, but allow overrides later
    useEffect(() => {
        setColConfigs(prev => prev.map(c => ({ ...c, alignment: globalAlignment })));
    }, [globalAlignment]);

    const toggleColAlign = (index: number) => {
        setColConfigs(prev => prev.map((c, i) => {
            if (i !== index) return c;
            const next = c.alignment === 'left' ? 'center' : (c.alignment === 'center' ? 'right' : 'left');
            return { ...c, alignment: next };
        }));
    };

    const outputTable = useMemo(() => {
        if (parsedData.headers.length === 0) return '';

        const { headers, rows } = parsedData;
        const allRows = [headers, ...rows];

        // 1. Calculate Column Widths
        const colWidths = headers.map((_, colIndex) => {
            let max = 0;
            const config = colConfigs[colIndex] || { maxWidth: 0 };

            allRows.forEach(row => {
                let text = row[colIndex] || '';
                // Truncate if maxWidth is set
                if (config.maxWidth > 0 && text.length > config.maxWidth) {
                    text = text.substring(0, config.maxWidth) + '…';
                }
                if (text.length > max) max = text.length;
            });
            return max;
        });

        const alignText = (text: string, width: number, align: Alignment) => {
            const len = text.length;
            const diff = Math.max(0, width - len);
            if (align === 'left') return text + ' '.repeat(diff);
            if (align === 'right') return ' '.repeat(diff) + text;
            const left = Math.floor(diff / 2);
            return ' '.repeat(left) + text + ' '.repeat(diff - left);
        };

        const renderRow = (row: string[], isHeader = false) => {
            // Determine merges for this row
            const merges: boolean[] = new Array(row.length).fill(false);
            if (mergeCells && !isHeader) {
                for (let i = 1; i < row.length; i++) {
                    if (row[i] === row[i - 1]) merges[i] = true;
                }
            }

            const renderLineString = (rowData: string[]) => {
                let line = '';

                // Border Chars
                const styles = getBorderChars(borderStyle);
                const sep = styles.v;

                if (borderStyle === 'markdown') return `|${rowData.map((c, i) => {
                    const conf = colConfigs[i] || { alignment: 'left', maxWidth: 0 };
                    let txt = c;
                    if (conf.maxWidth > 0 && txt.length > conf.maxWidth) txt = txt.substring(0, conf.maxWidth) + '…';
                    return ' ' + alignText(txt, colWidths[i], conf.alignment) + ' ';
                }).join('|')}|`;

                if (borderStyle !== 'none') line += sep;

                for (let i = 0; i < rowData.length; i++) {
                    const config = colConfigs[i] || { alignment: 'left', maxWidth: 0 };
                    let cellContent = rowData[i];

                    // Truncate logic for display
                    if (config.maxWidth > 0 && cellContent.length > config.maxWidth && cellContent.trim() !== '') {
                        cellContent = cellContent.substring(0, config.maxWidth) + '…';
                    }

                    if (i > 0) {
                        if (merges[i]) {
                            line += (borderStyle === 'none' ? ' ' : ' ');
                            cellContent = '';
                        } else {
                            line += (borderStyle === 'none' ? '  ' : sep);
                        }
                    }

                    line += ' '.repeat(padding) + alignText(cellContent, colWidths[i], config.alignment) + ' '.repeat(padding);
                }
                if (borderStyle !== 'none') line += sep;
                return line;
            };

            const lines = [];
            const emptyRow = row.map(() => '');

            // Top Vertical Padding
            for (let k = 0; k < verticalPadding; k++) lines.push(renderLineString(emptyRow));

            // Content
            lines.push(renderLineString(row));

            // Bottom Vertical Padding
            for (let k = 0; k < verticalPadding; k++) lines.push(renderLineString(emptyRow));

            return lines.join('\n');
        };

        const buildSeparator = (position: 'top' | 'mid' | 'bot' | 'header') => {
            if (borderStyle === 'none') return '';
            if (borderStyle === 'markdown') {
                if (position !== 'header') return '';
                return `|${colWidths.map((w, i) => {
                    const align = colConfigs[i]?.alignment || 'left';
                    const d = '-'.repeat(w + padding * 2);
                    if (align === 'center') return `:${d.slice(2)}:`;
                    if (align === 'right') return `${d.slice(1)}:`;
                    return d;
                }).join('|')}|`;
            }

            const s = getBorderChars(borderStyle);
            if (borderStyle === 'compact' && position !== 'header') return '';
            if (borderStyle === 'compact' && position === 'header') return colWidths.map(w => '─'.repeat(w + padding * 2)).join(' ');

            let left, mid, right, line;
            switch (position) {
                case 'top': left = s.tl; mid = s.tm; right = s.tr; line = s.h; break;
                case 'bot': left = s.bl; mid = s.bm; right = s.br; line = s.h; break;
                case 'mid':
                case 'header':
                default: left = s.lm; mid = s.mm; right = s.rm; line = s.h; break;
            }

            const segments = colWidths.map(w => line.repeat(w + padding * 2));
            return `${left}${segments.join(mid)}${right}`;
        };

        const lines = [];

        // Top
        const top = buildSeparator('top');
        if (top) lines.push(top);

        // Header
        lines.push(renderRow(headers, true));

        // Header Sep
        const headerSep = buildSeparator('header');
        if (headerSep) lines.push(headerSep);

        // Rows
        rows.forEach((row, idx) => {
            lines.push(renderRow(row));
            if (borderStyle !== 'markdown' && borderStyle !== 'compact' && borderStyle !== 'none' && idx < rows.length - 1) {
                lines.push(buildSeparator('mid'));
            }
        });

        // Bot
        const bot = buildSeparator('bot');
        if (bot) lines.push(bot);

        return lines.join('\n');

    }, [parsedData, colConfigs, borderStyle, padding, verticalPadding, mergeCells]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(outputTable);
    };

    return (
        <div className="flex flex-col h-full gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-0">

                {/* --- LEFT COLUMN: Input & Config --- */}
                <div className="flex flex-col gap-4 h-full min-h-0 overflow-hidden">

                    {/* 1. Input Source */}
                    <div className="bg-card p-4 rounded-xl border border-border shrink-0">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-accent font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                Data Source
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={() => loadSample('users')} className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300">Users</button>
                                <button onClick={() => loadSample('sales')} className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300">Sales (Excel)</button>
                                <button onClick={() => loadSample('inventory')} className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300">JSON</button>
                            </div>
                        </div>

                        <textarea
                            value={inputData}
                            onChange={(e) => setInputData(e.target.value)}
                            className="w-full h-32 bg-background border border-border rounded-lg p-3 font-mono text-xs text-foreground focus:outline-none focus:border-accent resize-none custom-scrollbar whitespace-nowrap"
                            placeholder="Paste CSV, Excel data, or JSON here..."
                        />
                        {error && <p className="text-destructive text-xs mt-2 flex items-center gap-1"><span className="font-bold">Error:</span> {error}</p>}
                    </div>

                    {/* 2. Column Controls (Visual) */}
                    {parsedData.headers.length > 0 && (
                        <div className="bg-card p-3 rounded-xl border border-border shrink-0">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Column Alignment</h4>
                            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                                {parsedData.headers.map((h, i) => (
                                    <button
                                        key={i}
                                        onClick={() => toggleColAlign(i)}
                                        className="flex-shrink-0 px-3 py-1.5 bg-secondary border border-border rounded-md text-xs font-mono text-muted-foreground hover:border-accent transition-colors flex items-center gap-2 group"
                                        title="Click to toggle alignment"
                                    >
                                        <span>{h}</span>
                                        <span className={`text-[10px] font-bold ${colConfigs[i]?.alignment !== 'left' ? 'text-accent' : 'text-slate-600'}`}>
                                            {colConfigs[i]?.alignment === 'left' ? 'L' : colConfigs[i]?.alignment === 'center' ? 'C' : 'R'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. Global Settings */}
                    <div className="bg-card p-4 rounded-xl border border-border flex-1 overflow-y-auto custom-scrollbar">
                        <h3 className="text-accent font-bold mb-4 text-sm uppercase tracking-wider">Style Settings</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground font-bold">Border Style</label>
                                <select
                                    value={borderStyle}
                                    onChange={(e) => setBorderStyle(e.target.value as BorderStyle)}
                                    className="w-full bg-background border border-border rounded p-2 text-sm focus:outline-none focus:border-accent"
                                >
                                    <option value="simple">Simple</option>
                                    <option value="double">Double</option>
                                    <option value="heavy">Heavy</option>
                                    <option value="rounded">Rounded</option>
                                    <option value="markdown">Markdown</option>
                                    <option value="mysql">MySQL</option>
                                    <option value="dots">Dots</option>
                                    <option value="compact">Compact</option>
                                    <option value="none">None</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground font-bold">Default Alignment</label>
                                <select
                                    value={globalAlignment}
                                    onChange={(e) => setGlobalAlignment(e.target.value as Alignment)}
                                    className="w-full bg-background border border-border rounded p-2 text-sm focus:outline-none focus:border-accent"
                                >
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-xs text-muted-foreground">Horizontal Padding</label>
                                    <span className="text-xs text-accent">{padding}</span>
                                </div>
                                <input
                                    type="range" min="0" max="6"
                                    value={padding}
                                    onChange={(e) => setPadding(parseInt(e.target.value))}
                                    className="w-full accent-accent h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-xs text-muted-foreground">Vertical Padding</label>
                                    <span className="text-xs text-accent">{verticalPadding}</span>
                                </div>
                                <input
                                    type="range" min="0" max="2"
                                    value={verticalPadding}
                                    onChange={(e) => setVerticalPadding(parseInt(e.target.value))}
                                    className="w-full accent-accent h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="flex items-center gap-3 cursor-pointer bg-muted/50 p-2 rounded-lg border border-border hover:border-muted-foreground/30 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={mergeCells}
                                        onChange={(e) => setMergeCells(e.target.checked)}
                                        className="w-4 h-4 text-accent rounded focus:ring-accent bg-background border-border"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-foreground">Smart Merge</span>
                                        <span className="text-[9px] text-muted-foreground">Merges identical adjacent cells horizontally</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: Output --- */}
                <div className="flex flex-col h-full bg-background rounded-xl border border-border overflow-hidden relative group">
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <span className="px-2 py-1 rounded bg-muted/80 text-[10px] text-muted-foreground border border-border">
                            {outputTable.length} chars
                        </span>
                        <button
                            onClick={copyToClipboard}
                            className="bg-accent text-accent-foreground px-4 py-1.5 rounded-lg font-bold text-xs hover:opacity-90 flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                        >
                            Copy
                        </button>
                    </div>

                    {/* Preview Header */}
                    <div className="h-8 bg-muted border-b border-border flex items-center px-4">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-destructive/20"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                        </div>
                        <div className="mx-auto text-[10px] text-muted-foreground/60 font-mono uppercase tracking-widest">Table Preview</div>
                    </div>

                    <div className="p-6 overflow-auto custom-scrollbar flex items-start justify-center min-h-0 flex-1">
                        <pre className="font-mono text-accent text-xs md:text-sm whitespace-pre leading-relaxed drop-shadow-[0_0_8px_rgba(var(--accent-rgb),0.15)]">
                            {outputTable}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper: Border Maps
const getBorderChars = (style: BorderStyle) => {
    switch (style) {
        case 'double': return { h: '═', v: '║', tl: '╔', tr: '╗', bl: '╚', br: '╝', tm: '╦', bm: '╩', lm: '╠', rm: '╣', mm: '╬' };
        case 'rounded': return { h: '─', v: '│', tl: '╭', tr: '╮', bl: '╰', br: '╯', tm: '┬', bm: '┴', lm: '├', rm: '┤', mm: '┼' };
        case 'heavy': return { h: '━', v: '┃', tl: '┏', tr: '┓', bl: '┗', br: '┛', tm: '┳', bm: '┻', lm: '┣', rm: '┫', mm: '╋' };
        case 'mysql': return { h: '-', v: '|', tl: '+', tr: '+', bl: '+', br: '+', tm: '+', bm: '+', lm: '+', rm: '+', mm: '+' };
        case 'dots': return { h: '.', v: ':', tl: '.', tr: '.', bl: ':', br: ':', tm: '.', bm: ':', lm: ':', rm: ':', mm: ':' };
        case 'compact': return { h: '─', v: ' ', tl: ' ', tr: ' ', bl: ' ', br: ' ', tm: ' ', bm: ' ', lm: ' ', rm: ' ', mm: ' ' };
        case 'none': return { h: '', v: '', tl: '', tr: '', bl: '', br: '', tm: '', bm: '', lm: '', rm: '', mm: '' };
        case 'simple':
        default: return { h: '─', v: '│', tl: '┌', tr: '┐', bl: '└', br: '┘', tm: '┬', bm: '┴', lm: '├', rm: '┤', mm: '┼' };
    }
}

export default TableFormatter;
