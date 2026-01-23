
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
    const [borderStyle, setBorderStyle] = useState<BorderStyle>('double');
    const [padding, setPadding] = useState(1);
    const [verticalPadding, setVerticalPadding] = useState(0);
    const [globalAlignment, setGlobalAlignment] = useState<Alignment>('left');
    const [mergeCells, setMergeCells] = useState(false);

    // Output state for manual editing
    const [manualOutput, setManualOutput] = useState('');

    // Column specific settings
    const [colConfigs, setColConfigs] = useState<ColumnConfig[]>([]);
    const [copied, setCopied] = useState(false);

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

                // Detect Separator
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

    // Transpose Function
    const handleTranspose = () => {
        const { headers, rows } = parsedData;
        if (headers.length === 0) return;

        const allData = [headers, ...rows];
        const newRows = allData[0].map((_, colIndex) => allData.map(row => row[colIndex]));

        // Convert back to CSV string for simplicity
        const newCsv = newRows.map(row => row.join(', ')).join('\n');
        setInputData(newCsv);
        setInputType('auto'); // Reset to auto/csv
    };

    // Compact Mode
    const handleCompact = () => {
        setPadding(0);
        setVerticalPadding(0);
        setBorderStyle('compact');
    };

    // Sync Column Configs when headers change
    useEffect(() => {
        setColConfigs(prev => {
            const newConfigs: ColumnConfig[] = [];
            parsedData.headers.forEach((_, i) => {
                if (prev[i]) newConfigs.push(prev[i]);
                else newConfigs.push({ alignment: globalAlignment, maxWidth: 0 });
            });
            return newConfigs;
        });
    }, [parsedData.headers.length]);

    const toggleColAlign = (index: number) => {
        setColConfigs(prev => prev.map((c, i) => {
            if (i !== index) return c;
            const next = c.alignment === 'left' ? 'center' : (c.alignment === 'center' ? 'right' : 'left');
            return { ...c, alignment: next };
        }));
    };

    const generatedTable = useMemo(() => {
        if (parsedData.headers.length === 0) return '';

        const { headers, rows } = parsedData;
        const allRows = [headers, ...rows];

        // Calculate actual character width (accounting for Unicode)
        const getDisplayWidth = (str: string): number => {
            return str.length;
        };

        // 1. Calculate Column Widths
        const colWidths = headers.map((_, colIndex) => {
            let max = 0;
            const config = colConfigs[colIndex] || { maxWidth: 0 };

            allRows.forEach(row => {
                let text = row[colIndex] || '';
                // Truncate if maxWidth is set
                if (config.maxWidth > 0 && getDisplayWidth(text) > config.maxWidth) {
                    text = text.substring(0, config.maxWidth - 1) + '…';
                }
                const width = getDisplayWidth(text);
                if (width > max) max = width;
            });
            return max;
        });

        const alignText = (text: string, width: number, align: Alignment) => {
            const len = getDisplayWidth(text);
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
                const styles = getBorderChars(borderStyle);
                const sep = styles.v;

                if (borderStyle === 'markdown') {
                    return `|${rowData.map((c, i) => {
                        const conf = colConfigs[i] || { alignment: 'left', maxWidth: 0 };
                        let txt = c;
                        if (conf.maxWidth > 0 && getDisplayWidth(txt) > conf.maxWidth) {
                            txt = txt.substring(0, conf.maxWidth - 1) + '…';
                        }
                        return ' ' + alignText(txt, colWidths[i], conf.alignment) + ' ';
                    }).join('|')}|`;
                }

                if (borderStyle !== 'none') line += sep;

                for (let i = 0; i < rowData.length; i++) {
                    const config = colConfigs[i] || { alignment: 'left', maxWidth: 0 };
                    let cellContent = rowData[i];

                    // Truncate logic
                    if (config.maxWidth > 0 && getDisplayWidth(cellContent) > config.maxWidth && cellContent.trim() !== '') {
                        cellContent = cellContent.substring(0, config.maxWidth - 1) + '…';
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

    // Update manual output when generated table changes
    useEffect(() => {
        setManualOutput(generatedTable);
    }, [generatedTable]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(manualOutput);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const exportAsFile = () => {
        const blob = new Blob([manualOutput], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'table.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col gap-6 pb-12">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <span className="text-2xl">📊</span>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Table Maker</h1>
                    <p className="text-sm text-muted-foreground">Convert CSV/JSON to beautiful ASCII tables</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* --- LEFT COLUMN: Input & Config --- */}
                <div className="flex flex-col gap-4">

                    {/* 1. Input Source */}
                    <div className="bg-card p-4 rounded-xl border border-border">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-accent font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                                Data Source
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={() => loadSample('users')} className="text-[10px] bg-muted hover:bg-muted/80 px-2 py-1 rounded text-foreground transition-colors">Users</button>
                                <button onClick={() => loadSample('sales')} className="text-[10px] bg-muted hover:bg-muted/80 px-2 py-1 rounded text-foreground transition-colors">Sales</button>
                                <button onClick={() => loadSample('inventory')} className="text-[10px] bg-muted hover:bg-muted/80 px-2 py-1 rounded text-foreground transition-colors">JSON</button>
                            </div>
                        </div>

                        <div className="relative">
                            <textarea
                                value={inputData}
                                onChange={(e) => setInputData(e.target.value)}
                                className="w-full h-40 bg-background border border-border rounded-lg p-3 font-mono text-xs text-foreground focus:outline-none focus:border-accent resize-none custom-scrollbar"
                                placeholder="Paste CSV, TSV, or JSON here..."
                            />

                            {/* Transpose Tool */}
                            <button
                                onClick={handleTranspose}
                                className="absolute bottom-2 right-2 p-1.5 bg-muted/90 hover:bg-accent text-foreground hover:text-white rounded shadow-md border border-border transition-all"
                                title="Transpose Rows/Columns"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l-6 6 6 6" /><path d="M18 8l-6 6 6 6" /><path d="M12 2v20" /><path d="M18 8v14" /></svg>
                            </button>
                        </div>

                        {error && <p className="text-destructive text-xs mt-2 flex items-center gap-1"><span className="font-bold">Error:</span> {error}</p>}
                    </div>

                    {/* 2. Column Controls */}
                    {parsedData.headers.length > 0 && (
                        <div className="bg-card p-3 rounded-xl border border-border">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Column Alignment</h4>
                            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                                {parsedData.headers.map((h, i) => (
                                    <button
                                        key={i}
                                        onClick={() => toggleColAlign(i)}
                                        className="flex-shrink-0 px-3 py-1.5 bg-secondary border border-border rounded-md text-xs font-mono text-muted-foreground hover:border-accent transition-colors flex items-center gap-2"
                                        title="Click to toggle alignment"
                                    >
                                        <span className="truncate max-w-[100px]">{h}</span>
                                        <span className={`text-[10px] font-bold ${colConfigs[i]?.alignment !== 'left' ? 'text-accent' : 'text-muted-foreground/50'}`}>
                                            {colConfigs[i]?.alignment === 'left' ? '◀' : colConfigs[i]?.alignment === 'center' ? '▣' : '▶'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. Style Settings */}
                    <div className="bg-card p-4 rounded-xl border border-border">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-accent font-bold text-sm uppercase tracking-wider">Style Settings</h3>
                            <button
                                onClick={handleCompact}
                                className="text-[10px] bg-muted border border-border px-2 py-1 rounded text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                            >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" /></svg>
                                Compact Mode
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                                    <span className="text-xs text-accent font-mono">{padding}</span>
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
                                    <span className="text-xs text-accent font-mono">{verticalPadding}</span>
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
                <div className="flex flex-col bg-background rounded-xl border border-border overflow-hidden relative h-[600px]">
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <span className="px-2 py-1 rounded bg-muted/80 text-[10px] text-muted-foreground border border-border font-mono pointer-events-none">
                            {manualOutput.split('\n').length} lines
                        </span>
                        <button
                            onClick={exportAsFile}
                            className="bg-muted text-foreground px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-muted/80 flex items-center gap-1 transition-all"
                            title="Download as .txt file"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        </button>
                        <button
                            onClick={copyToClipboard}
                            className={`px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all ${copied ? 'bg-green-500 text-white' : 'bg-accent text-accent-foreground hover:opacity-90'
                                }`}
                        >
                            {copied ? '✓ Copied' : 'Copy'}
                        </button>
                    </div>

                    {/* Preview Header */}
                    <div className="h-8 bg-muted border-b border-border flex items-center px-4 shrink-0">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/30"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/30"></div>
                        </div>
                        <div className="mx-auto text-[10px] text-muted-foreground/60 font-mono uppercase tracking-widest flex items-center gap-2">
                            <span>Editable Preview</span>
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[8px] font-bold">NEW</span>
                        </div>
                    </div>

                    <div className="p-0 flex-1 relative">
                        <textarea
                            value={manualOutput}
                            onChange={(e) => setManualOutput(e.target.value)}
                            className="w-full h-full bg-transparent p-6 font-mono text-accent text-xs leading-relaxed resize-none focus:outline-none custom-scrollbar whitespace-pre"
                            spellCheck={false}
                            placeholder="Your table will appear here..."
                        />
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
