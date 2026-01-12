import React, { useState, useEffect, useCallback } from 'react';
import { DRAWING_CHARS } from '../constants';
import { IDB } from '../services/db';

const DEFAULT_W = 40;
const DEFAULT_H = 20;

type ToolType = 'pen' | 'eraser' | 'bucket' | 'line' | 'rect' | 'circle';
type SymmetryType = 'none' | 'x' | 'y';

const DrawingCanvas: React.FC = () => {
  // Grid State
  const [width, setWidth] = useState(DEFAULT_W);
  const [height, setHeight] = useState(DEFAULT_H);
  const [grid, setGrid] = useState<string[][]>([]);
  
  // Editor State
  const [selectedChar, setSelectedChar] = useState('█');
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [symmetry, setSymmetry] = useState<SymmetryType>('none');
  const [zoom, setZoom] = useState(1);
  const [showGridLines, setShowGridLines] = useState(true);
  
  // Interaction State
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{r: number, c: number} | null>(null);
  const [currentPos, setCurrentPos] = useState<{r: number, c: number} | null>(null);
  
  // History & UX
  const [history, setHistory] = useState<string[][][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [notification, setNotification] = useState('');

  // Initialize Grid
  useEffect(() => {
    if (grid.length === 0) {
        resetGrid(DEFAULT_W, DEFAULT_H);
    }
  }, []);

  const resetGrid = (w: number, h: number) => {
      const newGrid = Array(h).fill(null).map(() => Array(w).fill(' '));
      setGrid(newGrid);
      setHistory([newGrid]);
      setHistoryIndex(0);
  };

  const handleResize = (newW: number, newH: number) => {
      if (newW < 5 || newH < 5 || newW > 100 || newH > 100) return;
      const newGrid = Array(newH).fill(null).map((_, r) => 
          Array(newW).fill(' ').map((_, c) => {
              if (r < grid.length && c < grid[0].length) return grid[r][c];
              return ' ';
          })
      );
      setWidth(newW);
      setHeight(newH);
      setGrid(newGrid);
      addToHistory(newGrid);
  };

  // --- History Management ---
  const addToHistory = (newGrid: string[][]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newGrid)));
    if (newHistory.length > 30) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setGrid(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
        setHistoryIndex(historyIndex + 1);
        setGrid(history[historyIndex + 1]);
    }
  };

  // --- Algorithms ---
  
  const getSymmetryPoints = (r: number, c: number): {r: number, c: number}[] => {
      const points = [{r, c}];
      if (symmetry === 'x') points.push({r, c: width - 1 - c});
      if (symmetry === 'y') points.push({r: height - 1 - r, c});
      return points;
  };

  const plotLine = (r0: number, c0: number, r1: number, c1: number) => {
      const points: {r: number, c: number}[] = [];
      let dx = Math.abs(c1 - c0);
      let dy = Math.abs(r1 - r0);
      let sx = (c0 < c1) ? 1 : -1;
      let sy = (r0 < r1) ? 1 : -1;
      let err = dx - dy;

      while(true) {
          points.push({r: r0, c: c0});
          if ((c0 === c1) && (r0 === r1)) break;
          let e2 = 2 * err;
          if (e2 > -dy) { err -= dy; c0 += sx; }
          if (e2 < dx) { err += dx; r0 += sy; }
      }
      return points;
  };

  const plotRect = (r0: number, c0: number, r1: number, c1: number) => {
      const points: {r: number, c: number}[] = [];
      const minR = Math.min(r0, r1), maxR = Math.max(r0, r1);
      const minC = Math.min(c0, c1), maxC = Math.max(c0, c1);
      
      for(let r = minR; r <= maxR; r++) {
          points.push({r, c: minC});
          points.push({r, c: maxC});
      }
      for(let c = minC; c <= maxC; c++) {
          points.push({r: minR, c});
          points.push({r: maxR, c});
      }
      return points;
  };

  const plotCircle = (r0: number, c0: number, r1: number, c1: number) => {
      const points: {r: number, c: number}[] = [];
      const radius = Math.floor(Math.sqrt(Math.pow(r1 - r0, 2) + Math.pow(c1 - c0, 2)));
      
      let x = radius;
      let y = 0;
      let err = 0;

      while (x >= y) {
        points.push({ r: r0 + x, c: c0 + y });
        points.push({ r: r0 + y, c: c0 + x });
        points.push({ r: r0 - y, c: c0 + x });
        points.push({ r: r0 - x, c: c0 + y });
        points.push({ r: r0 - x, c: c0 - y });
        points.push({ r: r0 - y, c: c0 - x });
        points.push({ r: r0 + y, c: c0 - x });
        points.push({ r: r0 + x, c: c0 - y });

        if (err <= 0) {
            y += 1;
            err += 2 * y + 1;
        }
        if (err > 0) {
            x -= 1;
            err -= 2 * x + 1;
        }
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
          stack.push([r + 1, c]);
          stack.push([r - 1, c]);
          stack.push([r, c + 1]);
          stack.push([r, c - 1]);
      }
      return newGrid;
  };

  // --- Drawing Handlers ---

  const handlePointerDown = (r: number, c: number, e: React.PointerEvent) => {
      e.preventDefault(); // Prevent scroll on touch
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      
      setIsDrawing(true);
      setStartPos({r, c});
      setCurrentPos({r, c});

      if (activeTool === 'bucket') {
          const newGrid = floodFill(r, c, grid);
          if (newGrid) {
              setGrid(newGrid);
              addToHistory(newGrid);
          }
          setIsDrawing(false); // Immediate action
      } else if (activeTool === 'pen' || activeTool === 'eraser') {
          // Immediate draw for pen/eraser
          const char = activeTool === 'eraser' ? ' ' : selectedChar;
          const newGrid = grid.map(row => [...row]);
          
          getSymmetryPoints(r, c).forEach(p => {
              if (p.r >= 0 && p.r < height && p.c >= 0 && p.c < width) {
                  newGrid[p.r][p.c] = char;
              }
          });
          setGrid(newGrid);
      }
  };

  const handlePointerEnter = (r: number, c: number) => {
      if (!isDrawing) return;
      setCurrentPos({r, c});

      if (activeTool === 'pen' || activeTool === 'eraser') {
          const char = activeTool === 'eraser' ? ' ' : selectedChar;
          // Optimize: Modify existing grid in state directly if we want super speed, 
          // but React state immutability is safer. 
          // For pen, we continuously update grid.
          setGrid(prevGrid => {
              const newGrid = prevGrid.map(row => [...row]);
              getSymmetryPoints(r, c).forEach(p => {
                if (p.r >= 0 && p.r < height && p.c >= 0 && p.c < width) {
                    newGrid[p.r][p.c] = char;
                }
              });
              return newGrid;
          });
      }
  };

  const handlePointerUp = () => {
      if (!isDrawing) return;
      setIsDrawing(false);

      if (['line', 'rect', 'circle'].includes(activeTool) && startPos && currentPos) {
          // Commit shape
          const finalGrid = getPreviewGrid();
          setGrid(finalGrid);
          addToHistory(finalGrid);
      } else if (['pen', 'eraser'].includes(activeTool)) {
          // Commit pen stroke
          addToHistory(grid);
      }

      setStartPos(null);
      setCurrentPos(null);
  };

  // Generate the visual grid (combining base grid + shape preview)
  const getPreviewGrid = () => {
      if (!isDrawing || !startPos || !currentPos) return grid;
      if (['pen', 'eraser', 'bucket'].includes(activeTool)) return grid;

      const preview = grid.map(row => [...row]);
      const char = selectedChar;
      
      let points: {r: number, c: number}[] = [];

      if (activeTool === 'line') {
          points = plotLine(startPos.r, startPos.c, currentPos.r, currentPos.c);
      } else if (activeTool === 'rect') {
          points = plotRect(startPos.r, startPos.c, currentPos.r, currentPos.c);
      } else if (activeTool === 'circle') {
          points = plotCircle(startPos.r, startPos.c, currentPos.r, currentPos.c);
      }

      // Apply symmetry to shape points
      points.forEach(pt => {
          getSymmetryPoints(pt.r, pt.c).forEach(symPt => {
              if (symPt.r >= 0 && symPt.r < height && symPt.c >= 0 && symPt.c < width) {
                  preview[symPt.r][symPt.c] = char;
              }
          });
      });

      return preview;
  };

  const displayGrid = getPreviewGrid();

  // --- Actions ---

  const copyToClipboard = () => {
      const text = grid.map(row => row.join('')).join('\n');
      navigator.clipboard.writeText(text);
      setNotification('Copied!');
      setTimeout(() => setNotification(''), 2000);
  };

  const saveProject = async () => {
      try {
          await IDB.saveDrawing({
              name: `Art ${new Date().toLocaleTimeString()}`,
              width: width,
              height: height,
              data: grid,
              updatedAt: Date.now()
          });
          setNotification('Saved!');
          setTimeout(() => setNotification(''), 2000);
      } catch (e) {
          console.error(e);
      }
  };

  return (
    <div className="flex flex-col h-full gap-4 min-h-0" onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
      
      {/* Toolbar */}
      <div className="bg-terminal-paper p-2 rounded-xl border border-slate-700 flex flex-wrap items-center gap-4 shrink-0 shadow-sm">
         
         {/* Tools Group */}
         <div className="flex gap-1 p-1 bg-slate-900/50 rounded-lg border border-slate-800">
             <ToolBtn active={activeTool === 'pen'} onClick={() => setActiveTool('pen')} icon={<path d="M12 19l7-7 3 3-7 7-3-3z"/>} title="Pen" />
             <ToolBtn active={activeTool === 'eraser'} onClick={() => setActiveTool('eraser')} icon={<path d="M20 20H7L3 16C2 15 2 13 3 12L13 2L22 11L20 20Z"/>} title="Eraser" />
             <ToolBtn active={activeTool === 'bucket'} onClick={() => setActiveTool('bucket')} icon={<path d="M19 11L11 3L2.4 11.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/>} title="Fill" />
             <div className="w-px bg-slate-700 mx-1 self-center h-4"/>
             <ToolBtn active={activeTool === 'line'} onClick={() => setActiveTool('line')} icon={<line x1="5" y1="19" x2="19" y2="5"/>} title="Line" />
             <ToolBtn active={activeTool === 'rect'} onClick={() => setActiveTool('rect')} icon={<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>} title="Rectangle" />
             <ToolBtn active={activeTool === 'circle'} onClick={() => setActiveTool('circle')} icon={<circle cx="12" cy="12" r="10"/>} title="Circle" />
         </div>

         {/* Symmetry & Config */}
         <div className="flex items-center gap-3">
             <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
                 <button onClick={() => setSymmetry(symmetry === 'none' ? 'x' : symmetry === 'x' ? 'y' : 'none')} className={`px-2 py-1 text-xs font-bold rounded ${symmetry !== 'none' ? 'bg-terminal-accent text-terminal-bg' : 'text-slate-400'}`}>
                    {symmetry === 'none' ? 'No Sym' : symmetry === 'x' ? 'Sym X' : 'Sym Y'}
                 </button>
             </div>
             
             <div className="flex items-center gap-2">
                 <label className="text-[10px] uppercase font-bold text-slate-500">Size</label>
                 <input type="number" value={width} onChange={e => handleResize(parseInt(e.target.value), height)} className="w-12 bg-slate-900 border border-slate-700 rounded text-xs p-1 text-center" />
                 <span className="text-slate-600">x</span>
                 <input type="number" value={height} onChange={e => handleResize(width, parseInt(e.target.value))} className="w-12 bg-slate-900 border border-slate-700 rounded text-xs p-1 text-center" />
             </div>

             <div className="flex items-center gap-2">
                 <label className="text-[10px] uppercase font-bold text-slate-500 hidden sm:inline">Zoom</label>
                 <input type="range" min="0.5" max="2" step="0.1" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} className="w-20 accent-slate-500 h-1 bg-slate-800 rounded appearance-none" />
             </div>
         </div>

         <div className="flex-1"></div>

         {/* History & Actions */}
         <div className="flex gap-2">
             <button onClick={undo} disabled={historyIndex <= 0} className="p-2 text-slate-400 hover:text-white disabled:opacity-30"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg></button>
             <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 text-slate-400 hover:text-white disabled:opacity-30"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"/></svg></button>
             <div className="w-px bg-slate-700 h-6 self-center mx-1"></div>
             <button onClick={() => resetGrid(width, height)} className="p-2 text-red-400 hover:bg-slate-800 rounded" title="Clear"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
             <button onClick={saveProject} className="p-2 text-slate-400 hover:bg-slate-800 rounded" title="Save"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg></button>
             <button onClick={copyToClipboard} className="bg-terminal-accent text-terminal-bg px-3 py-1 rounded text-xs font-bold hover:bg-emerald-400 flex items-center gap-1">
                 {notification || 'Copy'}
             </button>
         </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        
        {/* Canvas Area */}
        <div className="flex-1 bg-black/50 border border-slate-800 rounded-xl overflow-auto relative custom-scrollbar flex items-center justify-center">
             <div 
                className="relative bg-slate-900 shadow-2xl transition-transform duration-75 ease-out origin-center"
                style={{ 
                    width: width * 24, 
                    height: height * 24,
                    transform: `scale(${zoom})`,
                }}
             >
                 {/* Grid Rendering */}
                 <div 
                    className="grid absolute inset-0"
                    style={{ 
                        gridTemplateColumns: `repeat(${width}, 1fr)`,
                        gridTemplateRows: `repeat(${height}, 1fr)`,
                    }}
                 >
                     {displayGrid.map((row, r) => (
                         row.map((cell, c) => (
                             <div 
                                key={`${r}-${c}`}
                                onPointerDown={(e) => handlePointerDown(r, c, e)}
                                onPointerEnter={() => handlePointerEnter(r, c)}
                                className={`
                                    flex items-center justify-center text-emerald-400 select-none
                                    ${showGridLines ? 'border-[0.5px] border-slate-800/30' : ''}
                                    hover:bg-slate-800/50
                                `}
                                style={{ fontSize: '14px', lineHeight: '1' }}
                             >
                                 {cell}
                             </div>
                         ))
                     ))}
                 </div>
             </div>
        </div>

        {/* Sidebar Palette */}
        <div className="w-16 md:w-20 bg-terminal-paper rounded-xl border border-slate-700 flex flex-col overflow-hidden shrink-0">
             <div className="p-2 border-b border-slate-700 text-center">
                 <span className="text-[10px] font-bold text-slate-500 uppercase">Chars</span>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                 {DRAWING_CHARS.map((char, i) => (
                     <button
                        key={i}
                        onClick={() => setSelectedChar(char)}
                        className={`w-full aspect-square flex items-center justify-center rounded text-lg font-mono border transition-all ${
                            selectedChar === char
                            ? 'bg-terminal-accent text-terminal-bg border-terminal-accent shadow-lg scale-105'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                        }`}
                     >
                         {char === ' ' ? <span className="text-[10px] opacity-40">SPC</span> : char}
                     </button>
                 ))}
                 
                 {/* Custom Char Input */}
                 <div className="pt-2 border-t border-slate-700/50">
                     <input 
                        maxLength={1}
                        placeholder="+"
                        className="w-full h-10 bg-slate-900 border border-slate-700 rounded text-center text-white focus:border-terminal-accent focus:outline-none"
                        onChange={(e) => { if(e.target.value) setSelectedChar(e.target.value); }}
                        value={DRAWING_CHARS.includes(selectedChar) ? '' : selectedChar}
                     />
                 </div>
             </div>
             <div className="p-2 border-t border-slate-700">
                <button onClick={() => setShowGridLines(!showGridLines)} className="w-full py-1 text-[10px] text-slate-500 hover:text-white bg-slate-900 rounded">
                    {showGridLines ? 'Hide Grid' : 'Show Grid'}
                </button>
             </div>
        </div>
      </div>

    </div>
  );
};

const ToolBtn = ({ active, onClick, icon, title }: { active: boolean, onClick: () => void, icon: React.ReactNode, title: string }) => (
    <button 
        onClick={onClick} 
        title={title}
        className={`p-2 rounded-md transition-colors ${active ? 'bg-terminal-accent text-terminal-bg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
    >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {icon}
        </svg>
    </button>
);

export default DrawingCanvas;