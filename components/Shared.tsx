
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { KPICardData, DetailKPICardData, MonthlyTrendData, BreakdownData, ClientTrendData, DailyTrendData, MultiLineTrendData } from '../types';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell, 
    Sankey,
    LineChart, 
    Line, 
    ComposedChart,
    LabelList
} from 'recharts';
import type { NodeProps as SankeyNodeProps, LinkProps as SankeyLinkProps } from 'recharts/types/chart/Sankey';
import { TrendingUpIcon, TrendingDownIcon, DownloadIcon, ZoomIcon } from './Icons';

// --- UTILITIES ---

/**
 * Downloads a chart container's SVG content as a PNG file.
 */
const downloadElementAsPNG = (element: HTMLElement | null, filename: string) => {
  if (!element) return;
  const svg = element.querySelector('svg');
  if (!svg) return;

  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  const svgSize = svg.getBoundingClientRect();
  
  // High-DPI scaling (2x)
  canvas.width = svgSize.width * 2;
  canvas.height = svgSize.height * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };
  img.src = url;
};

/**
 * Noticeable bottom-left controls for all charts.
 */
const ChartControls: React.FC<{ onDownload: () => void }> = ({ onDownload }) => (
  <div className="flex items-center space-x-3 mt-6 ml-0.5">
    <button 
      className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-full transition-all shadow-sm bg-white active:scale-95"
      title="Zoom / View Details"
    >
      <ZoomIcon className="w-5 h-5" />
    </button>
    <button 
      onClick={(e) => { e.stopPropagation(); onDownload(); }}
      className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-full transition-all shadow-sm bg-white active:scale-95"
      title="Download as PNG"
    >
      <DownloadIcon className="w-5 h-5" />
    </button>
  </div>
);

// --- P&L SPECIFIC COMPONENTS ---

export const AchievementBanner: React.FC<{
  percentage: number;
  targetAmount: string;
  actualAmount: string;
  trend: number;
}> = ({ percentage, targetAmount, actualAmount, trend }) => {
  const displayPercentage = Math.min(percentage, 100);
  
  return (
    <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 mb-8 animate-fade-in">
      {/* Title Row */}
      <div className="flex items-center space-x-3 mb-10">
        <div className="bg-orange-50 p-2.5 rounded-xl border border-orange-100">
           <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="6" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
           </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-700">Achievement</h3>
      </div>

      {/* Main Stats Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Side: Income Before Tax */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Income Before Tax</p>
          <div className="flex items-baseline space-x-4 mb-8">
            <span className="text-4xl md:text-5xl lg:text-7xl font-bold text-orange-500 tracking-tighter">{percentage.toFixed(2)}%</span>
            <div className="flex items-center text-orange-600 font-bold text-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              <span>to target</span>
            </div>
          </div>
          {/* Progress Bar for Left Side */}
          <div className="relative w-full pr-12 mt-4">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${displayPercentage}%` }}
              />
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-0">
               <span className="text-[11px] font-bold text-gray-400">100%</span>
            </div>
          </div>
        </div>

        {/* Right Side: Target Amount */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Target Amount</p>
          <div className="flex items-baseline space-x-3 mb-8">
            <span className="text-4xl md:text-5xl lg:text-7xl font-bold text-slate-800 tracking-tight">{targetAmount}</span>
          </div>
          {/* Actual Box for Right Side */}
          <div className="bg-orange-50/50 px-6 py-4 rounded-2xl border border-orange-100/50 flex items-center space-x-4 max-w-sm">
             <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
             </svg>
             <p className="text-base font-bold text-orange-700">Actual: {actualAmount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PNLKPICard: React.FC<{ label: string; value: string; colorClass?: string }> = ({ label, value }) => (
  <div className="bg-white px-7 py-8 rounded-[28px] shadow-sm border border-slate-100 transition-all min-h-[150px] flex flex-col justify-center">
    <p className="text-xl font-bold text-[#233a5c] tracking-tight mb-3">{label}</p>
    <p className="text-[28px] md:text-[30px] font-black text-[#0f172a] tracking-tight leading-tight">{value}</p>
  </div>
);

type ProfitLossFlowTooltipData = {
    label: string;
    value: number;
    percentOfParent: number;
    parentLabel: string;
};

type ProfitLossFlowNodeDatum = {
    key: string;
    label: string;
    value: number;
    displayValue?: number;
    x: number;
    y: number;
    height: number;
    color: string;
    cardWidth: number;
    cardHeight: number;
    cardX: number;
    cardY: number;
    labelColor?: string;
    valueColor?: string;
    cardFill?: string;
    cardStroke?: string;
    cardStrokeDasharray?: string;
    opacity?: number;
    tooltip: ProfitLossFlowTooltipData;
};

type ProfitLossFlowLinkDatum = {
    key: string;
    sourceX: number;
    targetX: number;
    sourceTop: number;
    sourceBottom: number;
    targetTop: number;
    targetBottom: number;
    color: string;
    opacity?: number;
    tooltip: ProfitLossFlowTooltipData;
};

const formatFlowBillions = (value: number) => formatCurrency(value, 'IDR');
const formatFlowLabel = (label: string) => label.replace("Broker's", "Broker’s");

const splitFlowLabel = (label: string, maxLineLength = 20) => {
    const normalizedLabel = formatFlowLabel(label);
    if (normalizedLabel.length <= maxLineLength) {
        return [normalizedLabel];
    }

    const words = normalizedLabel.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
        const nextLine = currentLine ? `${currentLine} ${word}` : word;
        if (nextLine.length > maxLineLength && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = nextLine;
        }
    });

    if (currentLine) lines.push(currentLine);
    return lines.slice(0, 2);
};

const ProfitLossFlowTooltip: React.FC<{
    tooltip: ProfitLossFlowTooltipData | null;
    position: { x: number; y: number } | null;
}> = ({ tooltip, position }) => {
    if (!tooltip || !position) return null;

    return (
        <div
            className="pointer-events-none absolute z-20 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl"
            style={{
                left: position.x,
                top: position.y,
                transform: 'translate(0, -100%)',
            }}
        >
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">{tooltip.label}</p>
            <p className="mt-2 text-sm font-black text-slate-900">
                {tooltip.label} — {formatFlowBillions(tooltip.value)} — {tooltip.percentOfParent.toFixed(2)}% of {tooltip.parentLabel}
            </p>
        </div>
    );
};

export const PNLProfitLossFlowChart: React.FC<{
    revenueData: BreakdownData[];
    expenseData: BreakdownData[];
    revenueTotal: number;
    expenseTotal: number;
    incomeBeforeTax: number;
}> = ({ revenueData, expenseData, revenueTotal, expenseTotal, incomeBeforeTax }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [tooltip, setTooltip] = useState<ProfitLossFlowTooltipData | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

    const flowModel = useMemo(() => {
        const revenueEntries = revenueData
            .map((item) => ({
                ...item,
                valueInBillions: item.value / 1e9,
                absoluteValue: Math.abs(item.value / 1e9),
                isNegative: item.value < 0,
            }))
            .sort((left, right) => {
                if (left.isNegative !== right.isNegative) {
                    return Number(left.isNegative) - Number(right.isNegative);
                }
                return right.absoluteValue - left.absoluteValue;
            });

        const expenseEntries = expenseData
            .map((item) => ({
                ...item,
                valueInBillions: item.value / 1e9,
            }))
            .sort((left, right) => right.valueInBillions - left.valueInBillions);

        const listedExpenseTotal = expenseEntries.reduce((sum, item) => sum + item.valueInBillions, 0);
        if (expenseTotal - listedExpenseTotal > 0.01) {
            expenseEntries.push({
                name: 'Other expenses',
                value: (expenseTotal - listedExpenseTotal) * 1e9,
                valueInBillions: Number((expenseTotal - listedExpenseTotal).toFixed(2)),
            });
        }

        const svgWidth = 1260;
        const svgHeight = 520;
        const topPadding = 30;
        const bottomPadding = 28;
        const leftGap = 18;
        const rightGap = 12;
        const branchGap = 36;
        const availableHeight = svgHeight - topPadding - bottomPadding;

        const scale = Math.min(
            (availableHeight - leftGap * Math.max(revenueEntries.length - 1, 0)) / Math.max(revenueTotal, 1),
            (availableHeight - rightGap * Math.max(expenseEntries.length - 1, 0)) / Math.max(expenseTotal, 1),
            (availableHeight - branchGap) / Math.max(revenueTotal, 1),
        );

        const revenueHeight = revenueTotal * scale;
        const expenseHeight = expenseTotal * scale;
        const incomeHeight = incomeBeforeTax * scale;

        const sourceBarX = 58;
        const revenueBarX = 382;
        const expenseBarX = 718;
        const terminalBarX = 1036;
        const barWidth = 14;

        const sourceCardX = sourceBarX + 24;
        const revenueCardX = revenueBarX + 22;
        const expenseCardX = expenseBarX + 20;
        const terminalCardX = terminalBarX + 20;

        const revenueY = (svgHeight - revenueHeight) / 2;
        const incomeY = revenueY + revenueHeight * 0.08;
        const expenseY = revenueY + incomeHeight + branchGap;

        const leftStackHeight =
            revenueEntries.reduce((sum, item) => sum + item.absoluteValue * scale, 0) +
            leftGap * Math.max(revenueEntries.length - 1, 0);
        const leftStartY = (svgHeight - leftStackHeight) / 2;

        const rightStackHeight =
            expenseEntries.reduce((sum, item) => sum + item.valueInBillions * scale, 0) +
            rightGap * Math.max(expenseEntries.length - 1, 0);
        const expenseTargetsStartY = expenseY + (expenseHeight - rightStackHeight) / 2;

        const sourceNodes: ProfitLossFlowNodeDatum[] = [];
        const expenseNodes: ProfitLossFlowNodeDatum[] = [];
        const summaryNodes: ProfitLossFlowNodeDatum[] = [];
        const links: ProfitLossFlowLinkDatum[] = [];

        let leftCursor = leftStartY;
        let revenueCursor = revenueY;

        revenueEntries.forEach((entry, index) => {
            const height = entry.absoluteValue * scale;
            const positiveColor = ['#3b82f6', '#8b5cf6', '#2563eb', '#38bdf8', '#14b8a6', '#6366f1'][index % 6];
            const negativeColor = ['#ef4444', '#fb7185', '#f97316'][index % 3];
            const color = entry.isNegative ? negativeColor : positiveColor;
            const prominence = Math.max(0.45, Math.min(1, entry.absoluteValue / 110));
            const cardHeight = Math.max(38, Math.min(50, height + 10));
            const sourceTop = leftCursor;
            const sourceBottom = sourceTop + height;
            const targetTop = revenueCursor;
            const targetBottom = targetTop + height;
            const displayValue = entry.isNegative ? -entry.absoluteValue : entry.absoluteValue;
            const tooltipData = {
                label: entry.name,
                value: displayValue,
                percentOfParent: (entry.absoluteValue / revenueTotal) * 100,
                parentLabel: 'Revenue',
            };

            sourceNodes.push({
                key: `revenue-source-${entry.name}`,
                label: entry.name,
                value: entry.absoluteValue,
                displayValue,
                x: sourceBarX,
                y: sourceTop,
                height,
                color,
                cardWidth: 156,
                cardHeight,
                cardX: sourceCardX,
                cardY: sourceTop + (height - cardHeight) / 2,
                labelColor: entry.isNegative ? '#881337' : '#0f172a',
                valueColor: entry.isNegative ? '#e11d48' : '#51637f',
                cardFill: entry.isNegative ? '#fff1f2' : '#ffffff',
                cardStroke: entry.isNegative ? '#fecdd3' : '#dbe5f1',
                cardStrokeDasharray: entry.isNegative ? '3 2' : undefined,
                opacity: prominence,
                tooltip: tooltipData,
            });

            links.push({
                key: `revenue-link-${entry.name}`,
                sourceX: sourceBarX + barWidth,
                targetX: revenueBarX,
                sourceTop,
                sourceBottom,
                targetTop,
                targetBottom,
                color: entry.isNegative ? 'rgba(244,114,182,0.58)' : 'rgba(96,165,250,0.54)',
                opacity: entry.isNegative ? 0.9 : prominence,
                tooltip: tooltipData,
            });

            leftCursor = sourceBottom + leftGap;
            revenueCursor = targetBottom;
        });

        const revenueTooltip = {
            label: 'Revenue',
            value: revenueTotal,
            percentOfParent: 100,
            parentLabel: 'Revenue',
        };
        const incomeTooltip = {
            label: 'Income Before Tax',
            value: incomeBeforeTax,
            percentOfParent: (incomeBeforeTax / revenueTotal) * 100,
            parentLabel: 'Revenue',
        };
        const expenseTooltip = {
            label: 'Expense',
            value: expenseTotal,
            percentOfParent: (expenseTotal / revenueTotal) * 100,
            parentLabel: 'Revenue',
        };

        summaryNodes.push(
            {
                key: 'summary-revenue',
                label: 'Revenue',
                value: revenueTotal,
                x: revenueBarX,
                y: revenueY,
                height: revenueHeight,
                color: '#2563eb',
                cardWidth: 158,
                cardHeight: 58,
                cardX: revenueCardX,
                cardY: revenueY + revenueHeight / 2 - 29,
                labelColor: '#0f172a',
                valueColor: '#51637f',
                cardFill: '#ffffff',
                cardStroke: '#dbe5f1',
                tooltip: revenueTooltip,
            },
            {
                key: 'summary-expense',
                label: 'Expense',
                value: expenseTotal,
                x: expenseBarX,
                y: expenseY,
                height: expenseHeight,
                color: '#f97316',
                cardWidth: 148,
                cardHeight: 56,
                cardX: expenseCardX,
                cardY: expenseY + expenseHeight / 2 - 28,
                labelColor: '#7c2d12',
                valueColor: '#c2410c',
                cardFill: '#ffffff',
                cardStroke: '#fed7aa',
                tooltip: expenseTooltip,
            },
            {
                key: 'summary-income',
                label: 'Income Before Tax',
                value: incomeBeforeTax,
                x: terminalBarX,
                y: incomeY,
                height: incomeHeight,
                color: '#22c55e',
                cardWidth: 170,
                cardHeight: 58,
                cardX: terminalCardX,
                cardY: incomeY + incomeHeight / 2 - 29,
                labelColor: '#14532d',
                valueColor: '#166534',
                cardFill: '#f0fdf4',
                cardStroke: '#bbf7d0',
                tooltip: incomeTooltip,
            },
        );

        links.push(
            {
                key: 'revenue-to-income',
                sourceX: revenueBarX + barWidth,
                targetX: terminalBarX,
                sourceTop: revenueY,
                sourceBottom: revenueY + incomeHeight,
                targetTop: incomeY,
                targetBottom: incomeY + incomeHeight,
                color: 'rgba(74, 222, 128, 0.45)',
                opacity: 1,
                tooltip: incomeTooltip,
            },
            {
                key: 'revenue-to-expense',
                sourceX: revenueBarX + barWidth,
                targetX: expenseBarX,
                sourceTop: revenueY + incomeHeight,
                sourceBottom: revenueY + incomeHeight + expenseHeight,
                targetTop: expenseY,
                targetBottom: expenseY + expenseHeight,
                color: 'rgba(251, 146, 60, 0.40)',
                opacity: 0.96,
                tooltip: expenseTooltip,
            },
        );

        let expenseSourceCursor = expenseY;
        let rightCursor = expenseTargetsStartY;

        expenseEntries.forEach((entry, index) => {
            const height = entry.valueInBillions * scale;
            const prominence = Math.max(0.42, Math.min(1, entry.valueInBillions / 140));
            const color = ['#fb7185', '#f97316', '#f59e0b', '#fb923c', '#fdba74', '#ea580c', '#fca5a5'][index % 7];
            const tooltipData = {
                label: entry.name,
                value: entry.valueInBillions,
                percentOfParent: (entry.valueInBillions / expenseTotal) * 100,
                parentLabel: 'Expense',
            };
            const cardHeight = Math.max(36, Math.min(46, height + 8));
            const sourceTop = expenseSourceCursor;
            const sourceBottom = sourceTop + height;
            const targetTop = rightCursor;
            const targetBottom = targetTop + height;

            expenseNodes.push({
                key: `expense-${entry.name}`,
                label: entry.name,
                value: entry.valueInBillions,
                x: terminalBarX,
                y: targetTop,
                height,
                color,
                cardWidth: 160,
                cardHeight,
                cardX: terminalCardX,
                cardY: targetTop + (height - cardHeight) / 2,
                labelColor: '#7c2d12',
                valueColor: '#c2410c',
                cardFill: '#ffffff',
                cardStroke: '#dbe5f1',
                opacity: prominence,
                tooltip: tooltipData,
            });

            links.push({
                key: `expense-link-${entry.name}`,
                sourceX: expenseBarX + barWidth,
                targetX: terminalBarX,
                sourceTop,
                sourceBottom,
                targetTop,
                targetBottom,
                color,
                opacity: prominence,
                tooltip: tooltipData,
            });

            expenseSourceCursor = sourceBottom;
            rightCursor = targetBottom + rightGap;
        });

        return {
            svgWidth,
            svgHeight,
            nodes: [...sourceNodes, ...summaryNodes, ...expenseNodes],
            links,
        };
    }, [expenseData, expenseTotal, incomeBeforeTax, revenueData, revenueTotal]);

    const updateTooltipPosition = (event: React.MouseEvent<SVGElement | HTMLDivElement>, data: ProfitLossFlowTooltipData) => {
        const bounds = containerRef.current?.getBoundingClientRect();
        if (!bounds) return;

        setTooltip(data);
        setTooltipPosition({
            x: event.clientX - bounds.left + 16,
            y: event.clientY - bounds.top - 12,
        });
    };

    const hideTooltip = () => {
        setTooltip(null);
        setTooltipPosition(null);
    };

    const createRibbonPath = (link: ProfitLossFlowLinkDatum) => {
        const curve = (link.targetX - link.sourceX) * 0.52;
        return [
            `M ${link.sourceX} ${link.sourceTop}`,
            `C ${link.sourceX + curve} ${link.sourceTop}, ${link.targetX - curve} ${link.targetTop}, ${link.targetX} ${link.targetTop}`,
            `L ${link.targetX} ${link.targetBottom}`,
            `C ${link.targetX - curve} ${link.targetBottom}, ${link.sourceX + curve} ${link.sourceBottom}, ${link.sourceX} ${link.sourceBottom}`,
            'Z',
        ].join(' ');
    };

    return (
        <div ref={containerRef} className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-700">Profit and Loss Flow</h3>
            <p className="mt-1 text-sm font-semibold text-slate-400">P&amp;L Journey from Revenue to Income Before Tax</p>

            <div className="mt-6 md:hidden">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                        { label: 'Revenue', value: revenueTotal, valueClass: 'text-blue-600' },
                        { label: 'Expense', value: expenseTotal, valueClass: 'text-orange-500' },
                        { label: 'Income Before Tax', value: incomeBeforeTax, valueClass: 'text-emerald-600' },
                    ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/70 px-5 py-4">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                            <p className={`mt-3 text-2xl font-black ${item.valueClass}`}>{formatFlowBillions(item.value)}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative mt-6 hidden md:block">
                <div className="h-[500px] w-full overflow-hidden rounded-[28px] border border-slate-100 bg-slate-50/40 p-3">
                    <svg viewBox={`0 0 ${flowModel.svgWidth} ${flowModel.svgHeight}`} className="h-full w-full">
                        {flowModel.links.map((link) => (
                            <path
                                key={link.key}
                                d={createRibbonPath(link)}
                                fill={link.color}
                                opacity={link.opacity ?? 0.82}
                                onMouseMove={(event) => updateTooltipPosition(event, link.tooltip)}
                                onMouseLeave={hideTooltip}
                            />
                        ))}

                        {flowModel.nodes.map((node) => (
                            <g
                                key={node.key}
                                onMouseMove={(event) => updateTooltipPosition(event, node.tooltip)}
                                onMouseLeave={hideTooltip}
                                className="cursor-default"
                            >
                                <rect
                                    x={node.x}
                                    y={node.y}
                                    width={16}
                                    height={Math.max(node.height, 6)}
                                    rx={6}
                                    ry={6}
                                    fill={node.color}
                                    opacity={node.opacity ?? 1}
                                />
                                <rect
                                    x={node.cardX}
                                    y={node.cardY}
                                    width={node.cardWidth}
                                    height={node.cardHeight}
                                    rx={14}
                                    ry={14}
                                    fill={node.cardFill ?? '#ffffff'}
                                    stroke={node.cardStroke ?? '#dbe5f1'}
                                    strokeWidth={1.2}
                                    strokeDasharray={node.cardStrokeDasharray}
                                />
                                {splitFlowLabel(node.label, node.cardWidth <= 160 ? 17 : 20).map((line, index) => (
                                    <text
                                        key={`${node.key}-label-${index}`}
                                        x={node.cardX + 14}
                                        y={node.cardY + 18 + index * 12}
                                        fontSize={10}
                                        fontWeight={900}
                                        fill={node.labelColor ?? '#0f172a'}
                                    >
                                        {line}
                                    </text>
                                ))}
                                <text
                                    x={node.cardX + 14}
                                    y={node.cardY + (splitFlowLabel(node.label, node.cardWidth <= 160 ? 17 : 20).length > 1 ? 40 : 34)}
                                    fontSize={9}
                                    fontWeight={700}
                                    fill={node.valueColor ?? '#51637f'}
                                >
                                    {formatFlowBillions(node.displayValue ?? node.value)}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>
            </div>

            <ProfitLossFlowTooltip tooltip={tooltip} position={tooltipPosition} />
        </div>
    );
};

type RevenueSankeyNodeDatum = {
    name: string;
    color: string;
    amount: number;
    role: 'positive-source' | 'negative-sink' | 'summary';
};

const getRevenueSankeyNodeColor = (name: string, role: RevenueSankeyNodeDatum['role']) => {
    if (role === 'summary') {
        if (name === 'Total Revenue') return '#ec4899';
        if (name === 'Net Revenue') return '#d946ef';
        if (name === 'Negative') return '#f87171';
    }

    const colorMap: Record<string, string> = {
        'Brokerage commission': '#3b82f6',
        "Interest on Broker's Loans": '#8b5cf6',
        'Interest on deposits': '#a3e635',
        'Others': '#2dd4bf',
        'Fund Sales Revenue': '#ef4444',
        'FI Sales Revenue': '#f97316',
        'IB Revenue': '#ec4899',
        'PI': '#fb7185',
        'FI Trading For Portfolio': '#f43f5e',
    };

    return colorMap[name] || (role === 'negative-sink' ? '#ef4444' : '#64748b');
};

const buildRevenueSankeyData = (data: BreakdownData[]) => {
    const positiveEntries = data.filter((item) => item.value > 0);
    const negativeEntries = data.filter((item) => item.value < 0);
    const positiveTotal = positiveEntries.reduce((sum, item) => sum + item.value, 0);
    const negativeTotal = negativeEntries.reduce((sum, item) => sum + Math.abs(item.value), 0);
    const netTotal = positiveTotal - negativeTotal;

    const nodes: RevenueSankeyNodeDatum[] = [];
    const links: { source: number; target: number; value: number }[] = [];

    positiveEntries.forEach((item) => {
        nodes.push({
            name: item.name,
            amount: item.value,
            role: 'positive-source',
            color: getRevenueSankeyNodeColor(item.name, 'positive-source'),
        });
    });

    const totalRevenueIndex = nodes.push({
        name: 'Total Revenue',
        amount: positiveTotal,
        role: 'summary',
        color: getRevenueSankeyNodeColor('Total Revenue', 'summary'),
    }) - 1;

    const netRevenueIndex = nodes.push({
        name: 'Net Revenue',
        amount: netTotal,
        role: 'summary',
        color: getRevenueSankeyNodeColor('Net Revenue', 'summary'),
    }) - 1;

    positiveEntries.forEach((item, index) => {
        links.push({
            source: index,
            target: totalRevenueIndex,
            value: item.value,
        });
    });

    links.push({
        source: totalRevenueIndex,
        target: netRevenueIndex,
        value: positiveTotal,
    });

    if (negativeEntries.length > 0) {
        const negativeIndex = nodes.push({
            name: 'Negative',
            amount: -negativeTotal,
            role: 'summary',
            color: getRevenueSankeyNodeColor('Negative', 'summary'),
        }) - 1;

        links.push({
            source: netRevenueIndex,
            target: negativeIndex,
            value: negativeTotal,
        });

        negativeEntries.forEach((item) => {
            const nodeIndex = nodes.push({
                name: item.name,
                amount: item.value,
                role: 'negative-sink',
                color: getRevenueSankeyNodeColor(item.name, 'negative-sink'),
            }) - 1;

            links.push({
                source: negativeIndex,
                target: nodeIndex,
                value: Math.abs(item.value),
            });
        });
    }

    return {
        nodes,
        links,
        positiveTotal,
        negativeTotal,
        netTotal,
    };
};

const RevenueSankeyNode = ({ x, y, width, height, payload }: SankeyNodeProps) => {
    const node = payload as unknown as RevenueSankeyNodeDatum & { depth?: number; x?: number; y?: number };
    const accentWidth = Math.max(width, 12);
    const accentHeight = Math.max(height, 20);
    const cardWidth = node.role === 'positive-source' ? 172 : node.role === 'negative-sink' ? 118 : 156;
    const cardHeight = node.role === 'negative-sink' ? 48 : 54;
    const cardX = x + accentWidth + 10;
    const cardY = y + Math.max((accentHeight - cardHeight) / 2, -12);
    const titleX = cardX + 14;
    const titleY = cardY + 21;
    const labelColor = '#0f172a';
    const amountColor = node.role === 'negative-sink' ? '#dc2626' : '#51637f';
    const displayAmount = formatCurrency(node.amount, 'IDR ', 2);

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={accentWidth}
                height={accentHeight}
                rx={6}
                ry={6}
                fill={node.color}
                fillOpacity={0.95}
            />
            <rect
                x={cardX}
                y={cardY}
                width={cardWidth}
                height={cardHeight}
                rx={14}
                ry={14}
                fill="#ffffff"
                stroke="#dbe5f1"
                strokeWidth={1.25}
            />
            <text
                x={titleX}
                y={titleY}
                textAnchor="start"
                fontSize={10}
                fontWeight={900}
                fill={labelColor}
            >
                {node.name}
            </text>
            <text
                x={titleX}
                y={titleY + 18}
                textAnchor="start"
                fontSize={9}
                fontWeight={700}
                fill={amountColor}
            >
                {displayAmount}
            </text>
        </g>
    );
};

const RevenueSankeyLink = ({
    sourceX,
    targetX,
    sourceY,
    targetY,
    sourceControlX,
    targetControlX,
    linkWidth,
    payload,
}: SankeyLinkProps) => {
    const sourceName = payload?.source?.name ?? '';
    const targetName = payload?.target?.name ?? '';
    const targetNode = payload?.target as unknown as (RevenueSankeyNodeDatum & { name?: string }) | undefined;
    const isNegativePath =
        sourceName === 'Negative' ||
        targetName === 'Negative' ||
        targetNode?.role === 'negative-sink';
    const stroke = isNegativePath ? 'rgba(251, 113, 133, 0.5)' : 'rgba(148, 163, 184, 0.62)';
    const path = `
      M${sourceX},${sourceY}
      C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
    `;

    return (
        <path
            d={path}
            fill="none"
            stroke={stroke}
            strokeWidth={Math.max(linkWidth, 2)}
            strokeLinecap="butt"
            strokeLinejoin="miter"
            opacity={0.95}
        />
    );
};

const RevenueSankeyTooltip: React.FC<any> = ({ active, payload }) => {
    const item = payload?.[0]?.payload;
    if (!active || !item) return null;

    const isLink = typeof item.source === 'object' && typeof item.target === 'object';

    if (isLink) {
        return (
            <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                    {item.source.name} to {item.target.name}
                </p>
                <p className="mt-2 text-sm font-black text-slate-800">
                    {formatCurrency(item.value, 'IDR ')}
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">{item.name}</p>
            <p className="mt-2 text-sm font-black text-slate-800">
                {formatCurrency(item.amount ?? item.value ?? 0, 'IDR ')}
            </p>
        </div>
    );
};

export const PNLRevenueSankeyChart: React.FC<{ data: BreakdownData[]; title: string; onClick?: () => void }> = ({ data, title, onClick }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const displayTitle = title;
    const chartColors = ['#3b82f6', '#8b5cf6', '#a3e635', '#2dd4bf', '#f97316', '#ec4899', '#f59e0b'];
    const positiveData = useMemo(
        () => data.filter((item) => item.value > 0).map((item) => ({ ...item, chartValue: item.value })),
        [data]
    );
    const negativeData = useMemo(
        () => data.filter((item) => item.value < 0),
        [data]
    );
    const positiveTotal = positiveData.reduce((sum, item) => sum + item.value, 0);
    const positiveContributionPercentages = useMemo(() => {
        if (positiveData.length === 0 || positiveTotal <= 0) {
            return new Map<string, string>();
        }

        const rawBasisPoints = positiveData.map((item) => (item.value / positiveTotal) * 10000);
        const flooredBasisPoints = rawBasisPoints.map((value) => Math.floor(value));
        let remainingBasisPoints = 10000 - flooredBasisPoints.reduce((sum, value) => sum + value, 0);

        const rankedFractions = rawBasisPoints
            .map((value, index) => ({
                index,
                fraction: value - flooredBasisPoints[index],
                weight: positiveData[index].value,
            }))
            .sort((a, b) => {
                if (b.fraction !== a.fraction) {
                    return b.fraction - a.fraction;
                }

                return b.weight - a.weight;
            });

        const normalizedBasisPoints = [...flooredBasisPoints];
        for (let index = 0; index < remainingBasisPoints; index += 1) {
            normalizedBasisPoints[rankedFractions[index % rankedFractions.length].index] += 1;
        }

        return new Map(
            positiveData.map((item, index) => [
                item.name,
                `${(normalizedBasisPoints[index] / 100).toFixed(2)}%`,
            ])
        );
    }, [positiveData, positiveTotal]);

    return (
        <div
            ref={containerRef}
            className={`bg-white p-6 rounded-[30px] shadow-sm border border-slate-100 transition-all flex flex-col h-full min-h-[440px] ${onClick ? 'hover:shadow-lg group' : ''}`}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-tight flex-1">{displayTitle}</h3>
                {onClick && (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onClick();
                        }}
                        className="ml-3 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 shrink-0"
                        title="View detailed breakdown"
                        aria-label={`Open detailed breakdown for ${title}`}
                    >
                        <span>View Detailed Breakdown</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="flex-1 rounded-[32px] border border-slate-100 bg-white p-4 sm:p-5">
                <div className="mx-auto w-full max-w-[280px]">
                    <div className="aspect-square">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={positiveData}
                                    dataKey="chartValue"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="62%"
                                    outerRadius="92%"
                                    stroke="#ffffff"
                                    strokeWidth={4}
                                    paddingAngle={2}
                                    labelLine={false}
                                    isAnimationActive={true}
                                >
                                    {positiveData.map((item, index) => (
                                        <Cell key={item.name} fill={chartColors[index % chartColors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '8px 12px' }}
                                    formatter={(_value: number, _name: string, item: { payload?: BreakdownData }) => {
                                        const signedValue = item?.payload?.value ?? 0;
                                        return [formatCurrency(signedValue, 'IDR '), 'Value'];
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <div>
                        <p className="mb-4 text-sm font-black text-slate-800">Positive Contributions</p>
                        <div className="space-y-3">
                            {positiveData.map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span
                                            className="h-3 w-3 shrink-0 rounded-full"
                                            style={{ backgroundColor: chartColors[index % chartColors.length] }}
                                        ></span>
                                        <span className="truncate text-sm font-bold text-slate-700" title={item.name}>
                                            {item.name}
                                        </span>
                                      </div>
                                      <span className="shrink-0 text-sm font-black text-slate-900">
                                          {positiveContributionPercentages.get(item.name) ?? '0.00%'}
                                      </span>
                                  </div>
                              ))}
                          </div>
                    </div>

                    <div>
                        <p className="mb-4 text-sm font-black text-slate-800">Negative Contributions</p>
                        <div className="rounded-[24px] border border-red-200 bg-red-50/60 p-4">
                            <div className="space-y-4">
                                {negativeData.map((item) => (
                                    <div key={item.name} className="flex items-start justify-between gap-4">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
                                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 14.5a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 11.086l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 14.5z" />
                                                </svg>
                                            </div>
                                              <div className="min-w-0">
                                                  <p className="truncate text-sm font-black text-red-900" title={item.name}>{item.name}</p>
                                                  <p className="mt-1 text-sm font-bold text-red-600">{formatCurrency(item.value, 'IDR ')}</p>
                                              </div>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                    </div>
                </div>
            </div>

            <ChartControls onDownload={() => downloadElementAsPNG(containerRef.current, title)} />
        </div>
    );
};

export const PNLDonutChart: React.FC<{ data: BreakdownData[]; title: string; onClick?: () => void }> = ({ data, title, onClick }) => {
    const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#6366f1', '#14b8a6', '#f59e0b', '#64748b'];
    const containerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [openBreakdown, setOpenBreakdown] = useState<{
        item: BreakdownData;
        left: number;
        top: number;
        width: number;
        placement: 'top' | 'bottom';
    } | null>(null);
    const hasNegativeValues = data.some((item) => item.value < 0);
    const positiveData = data
        .filter((item) => item.value > 0)
        .map((item) => ({ ...item, chartValue: item.value }));
    const negativeData = data.filter((item) => item.value < 0);
    const chartData = hasNegativeValues
        ? positiveData
        : data.map((item) => ({ ...item, chartValue: item.value }));
    const signedTotal = data.reduce((sum, item) => sum + item.value, 0);
    const percentageBase = signedTotal !== 0
        ? signedTotal
        : data.reduce((sum, item) => sum + Math.abs(item.value), 0);
    const displayTitle = hasNegativeValues
        ? `Positive ${title.replace(/Breakdown/i, 'Mix')}`
        : title;
    const positiveSectionTitle = hasNegativeValues ? 'Positive Contributions' : null;
    const formatContributionPercentage = (value: number) => {
        if (!percentageBase) {
            return hasNegativeValues ? '0.00%' : '0.0%';
        }

        const decimals = hasNegativeValues ? 2 : 1;
        return `${((value / percentageBase) * 100).toFixed(decimals)}%`;
    };
    const closeBreakdown = () => setOpenBreakdown(null);
    const toggleBreakdown = (item: BreakdownData, event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();

        if (openBreakdown?.item.name === item.name) {
            closeBreakdown();
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        const width = Math.min(320, Math.max(260, rect.width));
        const maxHeight = 320;
        const gap = 8;
        const placement = rect.bottom + gap + maxHeight > window.innerHeight && rect.top > maxHeight
            ? 'top'
            : 'bottom';
        const top = placement === 'top'
            ? Math.max(16, rect.top - gap - maxHeight)
            : Math.min(rect.bottom + gap, window.innerHeight - 80);
        const left = Math.min(Math.max(16, rect.left), window.innerWidth - width - 16);

        setOpenBreakdown({ item, left, top, width, placement });
    };

    useEffect(() => {
        if (!openBreakdown) return;

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            if (popoverRef.current?.contains(target as Node)) return;
            if (target?.closest('[data-breakdown-popover-trigger="true"]')) return;
            closeBreakdown();
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeBreakdown();
        };

        window.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', closeBreakdown);

        return () => {
            window.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', closeBreakdown);
        };
    }, [openBreakdown]);

    return (
        <div 
            ref={containerRef}
            className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all flex flex-col h-full min-h-[380px] ${onClick ? 'hover:shadow-lg group' : ''}`}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-tight flex-1">{displayTitle}</h3>
                {onClick && (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onClick();
                        }}
                        className="ml-3 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 shrink-0"
                        title="View detailed breakdown"
                        aria-label={`Open detailed breakdown for ${title}`}
                    >
                        <span>View Detailed Breakdown</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="w-full aspect-square max-h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={chartData} 
                                dataKey="chartValue" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius="65%" 
                                outerRadius="95%" 
                                stroke="#fff"
                                strokeWidth={2}
                                paddingAngle={2}
                                labelLine={false}
                                isAnimationActive={true}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} className="outline-none focus:outline-none" />
                                ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '8px 12px' }} 
                              formatter={(_value: number, _name: string, item: { payload?: BreakdownData }) => {
                                const signedValue = item?.payload?.value ?? 0;
                                return [formatCurrency(signedValue, 'IDR '), hasNegativeValues ? 'Positive Value' : 'Value'];
                              }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {hasNegativeValues ? (
                    <div className="grid w-full grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.95fr)] mt-2">
                        <div className="flex flex-col space-y-2">
                            <div className="pb-1">
                                <p className="text-sm font-black text-slate-800">{positiveSectionTitle}</p>
                            </div>
                            {positiveData.map((item, idx) => (
                                <div key={item.name} className="flex items-center justify-between gap-3 px-1 py-1">
                                    <div className="flex items-center space-x-3 min-w-0">
                                        <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></div>
                                        <span className="block text-sm font-bold text-slate-700 truncate" title={item.name}>{item.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900 shrink-0">{formatContributionPercentage(item.value)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col">
                            <div className="pb-3">
                                <p className="text-sm font-black text-slate-800">Negative Contributions</p>
                            </div>
                            <div className="rounded-3xl border border-red-200 bg-red-50/70 p-4">
                                <div className="space-y-3">
                                    {negativeData.map((item) => (
                                        <div key={item.name} className="flex items-start justify-between gap-4 rounded-2xl px-1 py-1">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
                                                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M10 14.5a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 11.086l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 14.5z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-black text-red-900" title={item.name}>{item.name}</p>
                                                    <p className="mt-1 text-sm font-bold text-red-600">{formatCurrency(item.value, 'IDR ')}</p>
                                                </div>
                                            </div>
                                            <span className="shrink-0 text-sm font-black text-red-600">{formatContributionPercentage(item.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full flex flex-col space-y-2 mt-2">
                        {chartData.map((item, idx) => {
                            const hasChildBreakdown = Boolean(item.children?.length);
                            const isOpen = openBreakdown?.item.name === item.name;

                            return (
                            <div
                                key={item.name}
                                data-breakdown-popover-trigger={hasChildBreakdown ? 'true' : undefined}
                                role={hasChildBreakdown ? 'button' : undefined}
                                tabIndex={hasChildBreakdown ? 0 : undefined}
                                onClick={hasChildBreakdown ? (event) => toggleBreakdown(item, event) : undefined}
                                onKeyDown={hasChildBreakdown ? (event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        toggleBreakdown(item, event as unknown as React.MouseEvent<HTMLDivElement>);
                                    }
                                } : undefined}
                                className={`flex items-center justify-between gap-3 rounded-lg px-1 py-1 transition-colors group/item ${hasChildBreakdown ? 'cursor-pointer hover:bg-[#F5F7FA]' : ''}`}
                            >
                                <div className="flex items-center space-x-2 min-w-0">
                                    <div className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></div>
                                    <span className="block text-[10px] font-bold text-gray-600 truncate max-w-[180px]" title={item.name}>{item.name}</span>
                                </div>
                                <div className="flex shrink-0 items-center gap-1.5">
                                    {hasChildBreakdown && (
                                        <svg
                                            className={`h-3 w-3 text-slate-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                    <span className="text-[10px] font-black text-gray-900 bg-gray-50 px-1.5 py-0.5 rounded">{formatContributionPercentage(item.value)}</span>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {openBreakdown && (
                <div
                    ref={popoverRef}
                    className="fixed z-[1000] overflow-hidden rounded-lg border border-slate-100 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.15)] animate-[fadeIn_150ms_ease-out]"
                    style={{
                        left: openBreakdown.left,
                        top: openBreakdown.top,
                        width: openBreakdown.width,
                        maxHeight: 320,
                        transform: openBreakdown.placement === 'top' ? 'scale(0.98)' : 'scale(1)',
                    }}
                >
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <div>
                            <p className="text-sm font-black text-slate-900">{openBreakdown.item.name} Expenses</p>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                {openBreakdown.item.children?.length ?? 0} items
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                closeBreakdown();
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            aria-label={`Close ${openBreakdown.item.name} breakdown`}
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="max-h-[220px] overflow-y-auto px-2 py-2">
                        {[...(openBreakdown.item.children ?? [])]
                            .sort((left, right) => right.value - left.value)
                            .map((child) => (
                                <div key={child.name} className="flex items-center justify-between gap-4 rounded-md px-3 py-2 transition-colors hover:bg-[#F8F9FA]">
                                    <span className="min-w-0 truncate text-xs font-bold text-slate-700" title={child.name}>{child.name}</span>
                                    <span className="shrink-0 text-xs font-black text-slate-900">{formatContributionPercentage(child.value)}</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}
            <ChartControls onDownload={() => downloadElementAsPNG(containerRef.current, title)} />
        </div>
    );
};

export const MultiLineTrendChart: React.FC<{
    data: MultiLineTrendData[],
    categories: string[],
    title: string,
    subtitle?: string,
    yAxisFormatter?: (v: any) => string
}> = ({ data, categories, title, subtitle, yAxisFormatter }) => {
    const CHART_COLORS = ['#f97316', '#38bdf8', '#fb923c', '#7dd3fc', '#10b981', '#a78bfa', '#f472b6', '#facc15', '#64748b'];
    const containerRef = useRef<HTMLDivElement>(null);
    const fmt = yAxisFormatter || ((v: number) => formatCurrency(v, 'IDR'));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        const total = payload.reduce((sum: number, p: any) => sum + (Number(p.value) || 0), 0);

        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 min-w-[180px]">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{label}</p>
                <div className="mb-3 flex items-center justify-between gap-5 border-b border-gray-100 pb-3">
                    <span className="text-xs font-black text-slate-700">Total</span>
                    <span className="text-right text-xs font-black text-slate-900">{fmt(total)} 100.00%</span>
                </div>
                {payload.map((p: any) => (
                    <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1.5">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.stroke }} />
                            <span className="text-xs font-semibold text-gray-600">{p.dataKey}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-900">{fmt(p.value)}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div ref={containerRef} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in flex flex-col">
            <div className="mb-4">
                <h3 className="text-xl font-black text-[#1e293b]">{title}</h3>
                {subtitle && <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tight">{subtitle}</p>}
            </div>
            <ResponsiveContainer width="100%" height={450}>
                <LineChart data={data} margin={{ top: 20, right: 40, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" fontSize={11} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={8} />
                    <YAxis
                        fontSize={11}
                        tick={{ fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={fmt}
                        width={80}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
                    <Legend
                        verticalAlign="bottom"
                        align="center"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '11px', fontWeight: '600', paddingTop: '24px' }}
                    />
                    {categories.map((cat, idx) => (
                        <Line
                            key={cat}
                            type="monotone"
                            dataKey={cat}
                            stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                            strokeWidth={2}
                            dot={{ r: 3.5, strokeWidth: 0, fill: CHART_COLORS[idx % CHART_COLORS.length] }}
                            activeDot={{ r: 5.5, strokeWidth: 2, stroke: '#fff' }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
            <ChartControls onDownload={() => downloadElementAsPNG(containerRef.current, title)} />
        </div>
    );
};

export const StackedBarTrendChart: React.FC<{
    data: MultiLineTrendData[],
    categories: string[],
    title: string,
    subtitle?: string,
    yAxisFormatter?: (v: any) => string
}> = ({ data, categories, title, subtitle, yAxisFormatter }) => {
    const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#6366f1', '#14b8a6', '#f59e0b', '#64748b'];
    const containerRef = useRef<HTMLDivElement>(null);
    const fmt = yAxisFormatter || ((v: number) => formatCurrency(v, 'IDR'));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        const total = payload.reduce((sum: number, p: any) => sum + (Number(p.value) || 0), 0);
        const items = [...payload].reverse();

        return (
            <div className="min-w-[280px] rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[0_14px_28px_-12px_rgba(15,23,42,0.28)]">
                <p className="mb-2 text-sm font-semibold text-slate-500">{label}</p>
                <div className="mb-3 grid grid-cols-[12px_minmax(112px,1fr)_auto_auto] items-center gap-2 border-b border-gray-100 pb-3 text-sm">
                    <span className="h-2.5 w-2.5 rounded-[2px] bg-slate-400" />
                    <span className="text-sm font-black text-slate-700">Total</span>
                    <span className="whitespace-nowrap font-black text-slate-900">({fmt(total)})</span>
                    <span className="whitespace-nowrap font-black text-slate-900">100.00%</span>
                </div>
                <div className="space-y-1">
                    {items.map((p: any) => {
                        const percentage = total > 0 ? (p.value / total) * 100 : 0;

                        return (
                            <div key={p.dataKey} className="grid grid-cols-[12px_minmax(112px,1fr)_auto_auto] items-center gap-2 text-sm">
                                <span className="h-2.5 w-2.5 rounded-[2px]" style={{ backgroundColor: p.fill }} />
                                <span className="truncate font-medium text-slate-700">{p.dataKey}</span>
                                <span className="whitespace-nowrap font-black text-slate-900">({fmt(p.value)})</span>
                                <span className="whitespace-nowrap font-black text-slate-900">{percentage.toFixed(2)}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div ref={containerRef} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in flex flex-col">
            <div className="mb-4">
                <h3 className="text-xl font-black text-[#1e293b]">{title}</h3>
                {subtitle && <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tight">{subtitle}</p>}
            </div>
            <ResponsiveContainer width="100%" height={450}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap="28%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" fontSize={11} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis fontSize={11} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="square"
                        wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingBottom: '30px' }}
                    />
                    {categories.map((cat, idx) => (
                        <Bar key={cat} dataKey={cat} stackId="a" fill={CHART_COLORS[idx % CHART_COLORS.length]} radius={idx === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
            <ChartControls onDownload={() => downloadElementAsPNG(containerRef.current, title)} />
        </div>
    );
};

export const SmallMultiplesTrendChart: React.FC<{
    data: MultiLineTrendData[],
    categories: string[],
    title: string,
    subtitle?: string,
    yAxisFormatter?: (v: any) => string
}> = ({ data, categories, title, subtitle, yAxisFormatter }) => {
    const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#6366f1', '#14b8a6', '#f59e0b', '#64748b'];
    const containerRef = useRef<HTMLDivElement>(null);
    const fmt = yAxisFormatter || ((v: number) => formatCurrency(v, 'IDR'));

    return (
        <div ref={containerRef} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in flex flex-col">
            <div className="mb-6">
                <h3 className="text-xl font-black text-[#1e293b]">{title}</h3>
                {subtitle && <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tight">{subtitle}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {categories.map((cat, idx) => {
                    const color = CHART_COLORS[idx % CHART_COLORS.length];
                    const values = data.map(d => (d as any)[cat] as number);
                    const latest = values[values.length - 1];
                    const prev = values[values.length - 2];
                    const pct = prev ? ((latest - prev) / prev) * 100 : 0;
                    const isUp = pct >= 0;
                    return (
                        <div key={cat} className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{cat}</p>
                                    <p className="text-lg font-black text-gray-900 mt-1">{fmt(latest)}</p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                    {isUp ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
                                </span>
                            </div>
                            <ResponsiveContainer width="100%" height={90}>
                                <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                    <Line
                                        type="monotone"
                                        dataKey={cat}
                                        stroke={color}
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4, strokeWidth: 0, fill: color }}
                                    />
                                    <Tooltip
                                        formatter={(v: any) => [fmt(v), cat]}
                                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }}
                                        cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="flex justify-between mt-2">
                                {data.filter((_, i) => i % 3 === 0 || i === data.length - 1).map(d => (
                                    <span key={d.month} className="text-[10px] text-gray-400 font-medium">{d.month}</span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            <ChartControls onDownload={() => downloadElementAsPNG(containerRef.current, title)} />
        </div>
    );
};

// --- EXISTING COMPONENTS ---

export const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center my-10 px-4">
    <div className="flex-grow h-px bg-[#ced4da]"></div>
    <h3 className="mx-6 text-[11px] font-bold text-[#6c757d] uppercase tracking-[0.2em] whitespace-nowrap">
      {title}
    </h3>
    <div className="flex-grow h-px bg-[#ced4da]"></div>
  </div>
);

export interface DateSelection {
  month: string;
  year: string;
}

export const DateRangeSelector: React.FC<{
  start: DateSelection;
  end: DateSelection;
  onStartChange: (val: DateSelection) => void;
  onEndChange: (val: DateSelection) => void;
}> = ({ start, end, onStartChange, onEndChange }) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = ["2024", "2025", "2026"];
  
  const SelectField = ({ value, options, onChange }: { 
    value: string, 
    options: string[], 
    onChange: (v: string) => void
  }) => (
    <div className="relative flex items-center group">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-[13px] font-bold text-[#1e293b] focus:outline-none cursor-pointer hover:text-blue-600 appearance-none pr-5 relative z-10"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="absolute right-0 pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="flex items-center bg-white border border-[#e2e8f0] rounded-xl px-5 py-2 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center space-x-4">
        <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest shrink-0">FROM</span>
        <div className="flex items-center space-x-3">
          <SelectField 
            value={start.month} 
            options={months} 
            onChange={(m) => onStartChange({ ...start, month: m })} 
          />
          <SelectField 
            value={start.year} 
            options={years} 
            onChange={(y) => onStartChange({ ...start, year: y })} 
          />
        </div>
      </div>
      <div className="mx-5 h-6 w-px bg-[#f1f5f9]"></div>
      <div className="flex items-center space-x-4">
        <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest shrink-0">TO</span>
        <div className="flex items-center space-x-3">
          <SelectField 
            value={end.month} 
            options={months} 
            onChange={(m) => onEndChange({ ...end, month: m })} 
          />
          <SelectField 
            value={end.year} 
            options={years} 
            onChange={(y) => onEndChange({ ...end, year: y })} 
          />
        </div>
      </div>
    </div>
  );
};

export function formatCurrency(value: number, currency = 'IDR', decimals = 2) {
    const normalizedCurrency = currency.trim() || 'IDR';

    if (!Number.isFinite(value) || value === 0) {
        return `${normalizedCurrency} 0`;
    }

    const sign = value < 0 ? '-' : '';
    const absoluteValue = Math.abs(value);
    const unit = absoluteValue >= 1e12 ? 'T' : absoluteValue >= 1e7 ? 'B' : 'M';
    const divisor = unit === 'T' ? 1e12 : unit === 'B' ? 1e9 : 1e6;

    return `${sign}${normalizedCurrency} ${(absoluteValue / divisor).toFixed(decimals)} ${unit}`;
}

export const formatNumber = (value: number) => value.toLocaleString();

export const DetailKPICard: React.FC<{ 
  data: DetailKPICardData;
  hideMTD?: boolean;
  hideLabels?: boolean;
  hideYTDLabel?: boolean;
  hideMTDLabel?: boolean;
  hideTrend?: boolean;
  variant?: 'default' | 'blue';
}> = ({ data, hideMTD, hideLabels, hideYTDLabel, hideMTDLabel, hideTrend, variant = 'default' }) => {
  const showYTDLabel = !hideLabels && !hideYTDLabel;
  const showMTDLabel = !hideLabels && !hideYTDLabel;
  const isBlue = variant === 'blue';

  const renderTrend = (change?: number) => {
    if (change === undefined || hideTrend) return null;
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center space-x-1 text-xs font-bold ml-3 ${
        isBlue ? (isPositive ? 'text-blue-100' : 'text-red-100') : (isPositive ? 'text-green-500' : 'text-red-500')
      }`}>
        {isPositive ? (
          <TrendingUpIcon className="w-4 h-4" />
        ) : (
          <TrendingDownIcon className="w-4 h-4" />
        )}
        <span>{Math.abs(change).toFixed(2)}%</span>
      </div>
    );
  };

  return (
    <div className={`p-5 rounded-xl shadow-sm border flex flex-col justify-center h-full hover:shadow-md transition-shadow ${
      isBlue ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white border-gray-100'
    }`}>
      <div className="w-full">
        <p className={`text-sm font-bold mb-3 ${isBlue ? 'text-blue-50' : 'text-gray-600'}`}>{data.label}</p>
        <div className="mb-1 last:mb-0">
          {showYTDLabel && <p className={`text-[10px] font-bold uppercase tracking-tight mb-1 ${isBlue ? 'text-blue-100' : 'text-gray-400'}`}>YTD</p>}
          <div className="flex items-center flex-wrap">
            <p className={`text-xl sm:text-2xl lg:text-[28px] font-black tracking-tight leading-none ${isBlue ? 'text-white' : 'text-gray-900'}`}>{data.valueYTD}</p>
            {renderTrend(data.changeYTD)}
          </div>
        </div>
        {!hideMTD && (
          <div className={`mt-4 pt-4 border-t ${isBlue ? 'border-blue-500/60' : 'border-gray-50'}`}>
            {showMTDLabel && <p className={`text-[10px] font-bold uppercase tracking-tight mb-1 ${isBlue ? 'text-blue-100' : 'text-gray-400'}`}>MTD</p>}
            <div className="flex items-center flex-wrap">
              <p className={`text-lg sm:text-xl font-bold leading-none ${isBlue ? 'text-white' : 'text-gray-700'}`}>{data.valueMTD}</p>
              {renderTrend(data.changeMTD)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const DataTable: React.FC<{ 
  title: string; 
  columns: string[]; 
  data: any[][]; 
  onRowClick?: (rowData: any[]) => void;
  headerAction?: React.ReactNode;
}> = ({ title, columns, data, onRowClick, headerAction }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h3 className="text-xl font-bold text-[#1e293b]">{title}</h3>
            {headerAction && <div className="animate-fade-in">{headerAction}</div>}
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#f1f5f9]">
                <thead className="bg-[#f8fafc]">
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} scope="col" className="px-6 py-4 text-left text-[11px] font-black text-[#64748b] uppercase tracking-widest">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#f1f5f9]">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} onClick={() => onRowClick && onRowClick(row)} className={`transition-colors duration-150 ${onRowClick ? "hover:bg-blue-50/50 cursor-pointer" : ""}`}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#475569]">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export const TrendComposedChart: React.FC<{ 
    data: DailyTrendData[], 
    title: string,
    subtitle?: string,
    barLabel1: string,
    barLabel2?: string,
    lineLabel?: string,
    isLinePercentage?: boolean,
    isLineCurrency?: boolean,
    yAxisFormatter?: (v: any) => string,
    isCurrency?: boolean
}> = ({ data, title, subtitle, barLabel1, barLabel2, lineLabel, isLinePercentage, isLineCurrency, yAxisFormatter, isCurrency }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    return (
    <div ref={containerRef} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#1e293b]">{title}</h3>
          {subtitle && <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{subtitle}</p>}
        </div>
        <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" fontSize={10} tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <YAxis 
                    yAxisId="left" 
                    fontSize={10} 
                    tick={{fill: '#94a3b8'}} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={yAxisFormatter || ((v) => isCurrency ? formatCurrency(v) : v.toLocaleString())} 
                />
                {(lineLabel || barLabel2) && (
                    <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        fontSize={10} 
                        tick={{fill: '#94a3b8'}} 
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={(v) => {
                            if (isLinePercentage || (lineLabel && lineLabel.includes('%'))) return `${v}%`;
                            if (isLineCurrency) return formatCurrency(v);
                            if (isCurrency && !lineLabel) return formatCurrency(v);
                            return v.toLocaleString();
                        }} 
                    />
                )}
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                    formatter={(value: any, name: string) => {
                        if (isCurrency && (name === barLabel1 || name === barLabel2)) {
                            return [formatCurrency(value), name];
                        }
                        if (name === lineLabel) {
                            if (isLinePercentage || (lineLabel && lineLabel.includes('%'))) {
                                return [`${value.toFixed(2)}%`, name];
                            }
                            if (isLineCurrency || (isCurrency && !lineLabel)) {
                                return [formatCurrency(value), name];
                            }
                        }
                        return [value.toLocaleString(), name];
                    }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  iconType="circle" 
                  wrapperStyle={{fontSize: '11px', fontWeight: 'bold', paddingBottom: '20px'}} 
                />
                <Bar yAxisId="left" dataKey="barValue1" name={barLabel1} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                {barLabel2 && <Bar yAxisId="left" dataKey="barValue2" name={barLabel2} fill="#8b5cf6" radius={[4, 4, 0, 0]} />}
                {lineLabel && <Line yAxisId="right" type="monotone" dataKey="lineValue" name={lineLabel} stroke="#f97316" strokeWidth={3} dot={{r: 5, fill: '#fff', stroke: '#f97316', strokeWidth: 2}} />}
            </ComposedChart>
        </ResponsiveContainer>
        <ChartControls onDownload={() => downloadElementAsPNG(containerRef.current, title)} />
    </div>
    );
};

export const MonthlyTrendChart: React.FC<{ 
    data: MonthlyTrendData[], 
    dataKey1: string, 
    dataKey2?: string, 
    trendKey?: string,
    title: string,
    subtitle?: string,
    isCurrency?: boolean,
    isTrendCurrency?: boolean
}> = ({ data, dataKey1, dataKey2, trendKey, title, subtitle, isCurrency, isTrendCurrency }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    return (
    <div ref={containerRef} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#1e293b]">{title}</h3>
          {subtitle && <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{subtitle}</p>}
        </div>
        <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={11} tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <YAxis 
                    yAxisId="left" 
                    fontSize={11} 
                    tick={{fill: '#94a3b8'}} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => isCurrency ? formatCurrency(value) : value.toLocaleString()} 
                />
                {(trendKey || dataKey2) && (
                    <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        fontSize={11} 
                        tick={{fill: '#94a3b8'}} 
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={(v) => isTrendCurrency ? formatCurrency(v) : `${v}%`} 
                    />
                )}
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                    formatter={(value: any, name: string) => {
                        if (name === dataKey1 || name === dataKey2) {
                            return [isCurrency ? formatCurrency(value) : value.toLocaleString(), name];
                        }
                        if (name === (trendKey || 'Change')) {
                            return [isTrendCurrency ? formatCurrency(value) : `${value}%`, name];
                        }
                        return [value, name];
                    }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  iconType="circle" 
                  wrapperStyle={{fontSize: '11px', fontWeight: 'bold', paddingBottom: '20px'}} 
                />
                <Bar yAxisId="left" dataKey="value1" fill="#3b82f6" name={dataKey1} radius={[4, 4, 0, 0]} />
                {dataKey2 && <Bar yAxisId="left" dataKey="value2" fill="#8b5cf6" name={dataKey2} radius={[4, 4, 0, 0]} />}
                {trendKey && <Line yAxisId="right" type="monotone" dataKey="trend" name={trendKey || 'Change'} stroke="#f97316" strokeWidth={3} dot={{r: 5, fill: '#fff', stroke: '#f97316', strokeWidth: 2}} />}
            </ComposedChart>
        </ResponsiveContainer>
        <ChartControls onDownload={() => downloadElementAsPNG(containerRef.current, title)} />
    </div>
    );
};

export const BreakdownDonutChart: React.FC<{ data: BreakdownData[], title: string, isCurrency?: boolean }> = ({ data, title, isCurrency }) => {
    const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#6366f1'];
    const containerRef = useRef<HTMLDivElement>(null);
    const total = data.reduce((sum, d) => sum + d.value, 0);

    const legendFormatter = (value: string, entry: any) => {
        const pct = total > 0 ? ((entry.payload.value / total) * 100).toFixed(2) : '0.00';
        return `${value} (${pct}%)`;
    };

    const formatTooltipValue = (value: number) => {
        if (isCurrency) {
            return formatCurrency(value);
        }
        return value.toLocaleString('en-US');
    };

    const BreakdownTooltip = ({ active, payload }: any) => {
        const item = payload?.[0]?.payload as BreakdownData | undefined;
        if (!active || !item) return null;

        const pct = total > 0 ? ((item.value / total) * 100).toFixed(2) : '0.00';

        return (
            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-xl">
                <p className="text-sm font-black text-slate-800">
                    {item.name}: ({formatTooltipValue(item.value)}) {pct}%
                </p>
            </div>
        );
    };

    return (
        <div ref={containerRef} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1e293b]">{title}</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        content={<BreakdownTooltip />}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                      formatter={legendFormatter}
                    />
                </PieChart>
            </ResponsiveContainer>
            <ChartControls onDownload={() => downloadElementAsPNG(containerRef.current, title)} />
        </div>
    );
};

export const ConcentrationChart: React.FC<{ data: { name: string, volume: number }[], title: string }> = ({ data, title }) => {
    const sortedData = [...data].sort((a, b) => b.volume - a.volume);
    const totalVolume = sortedData.reduce((acc, item) => acc + item.volume, 0);
    let cumulative = 0;
    const containerRef = useRef<HTMLDivElement>(null);
    const paretoData = sortedData.map(item => {
        cumulative += item.volume;
        return {
            ...item,
            cumulativePercentage: (cumulative / totalVolume) * 100
        };
    });
    return (
        <div ref={containerRef} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1e293b]">{title}</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={paretoData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" fontSize={10} tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" fontSize={10} tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
                    <YAxis yAxisId="right" orientation="right" fontSize={10} tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend 
                      verticalAlign="top" 
                      align="right"
                      iconType="circle" 
                      wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingBottom: '20px' }} 
                    />
                    <Bar dataKey="volume" yAxisId="left" fill="#3b82f6" name="Volume" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="cumulativePercentage" yAxisId="right" stroke="#ff7300" name="Cumulative %" strokeWidth={3} dot={{r: 4, fill: '#ff7300', strokeWidth: 2, stroke: '#fff'}} />
                </ComposedChart>
            </ResponsiveContainer>
            <ChartControls onDownload={() => downloadElementAsPNG(containerRef.current, title)} />
        </div>
    );
};

export const StackedTrendChart: React.FC<{ 
    data: any[], 
    dataKey1: string, 
    dataKey2: string, 
    trendKey: string,
    title: string,
    subtitle?: string,
    isCurrency?: boolean
}> = ({ data, dataKey1, dataKey2, trendKey, title, subtitle, isCurrency }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    return (
    <div ref={containerRef} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#1e293b]">{title}</h3>
          {subtitle && <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{subtitle}</p>}
        </div>
        <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={11} tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <YAxis 
                    fontSize={11} 
                    tick={{fill: '#94a3b8'}} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => isCurrency ? (value).toLocaleString() : value.toLocaleString()} 
                />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                    formatter={(value: any, name: string) => {
                        return [value.toLocaleString(undefined, {minimumFractionDigits: 2}), name];
                    }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle" 
                  wrapperStyle={{fontSize: '11px', fontWeight: 'bold', paddingTop: '20px'}} 
                />
                <Bar dataKey="domestic" name={dataKey1} stackId="a" fill="#1e40af">
                    <LabelList dataKey="domPct" position="center" formatter={(v: number) => `${v}%`} style={{ fill: '#fff', fontSize: '10px', fontWeight: 'bold' }} />
                </Bar>
                <Bar dataKey="foreign" name={dataKey2} stackId="a" fill="#f97316">
                    <LabelList dataKey="forPct" position="center" formatter={(v: number) => `${v}%`} style={{ fill: '#fff', fontSize: '10px', fontWeight: 'bold' }} />
                </Bar>
                <Line type="monotone" dataKey="total" name={trendKey} stroke="#eab308" strokeWidth={3} dot={{r: 5, fill: '#fff', stroke: '#eab308', strokeWidth: 2}}>
                    <LabelList dataKey="total" position="top" formatter={(v: number) => v.toFixed(2)} style={{ fill: '#1e293b', fontSize: '10px', fontWeight: 'bold' }} />
                </Line>
            </ComposedChart>
        </ResponsiveContainer>
        <ChartControls onDownload={() => downloadElementAsPNG(containerRef.current, title)} />
    </div>
    );
};

const DomesticForeignTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload;
    return (
        <div style={{ background: '#fff', borderRadius: 12, padding: '12px 16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', border: 'none' }}>
            <p style={{ fontWeight: 'bold', marginBottom: 8, color: '#1e293b' }}>{label}</p>
            <p style={{ color: '#1e40af', fontWeight: 600, margin: '4px 0' }}>Domestic ({d.domPct}%) IDR {d.domestic.toFixed(2)} Billion</p>
            <p style={{ color: '#f97316', fontWeight: 600, margin: '4px 0' }}>Foreign ({d.forPct}%) IDR {d.foreign.toFixed(2)} Billion</p>
        </div>
    );
};

const RetailInstitutionTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload;
    return (
        <div style={{ background: '#fff', borderRadius: 12, padding: '12px 16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', border: 'none' }}>
            <p style={{ fontWeight: 'bold', marginBottom: 8, color: '#1e293b' }}>{label}</p>
            <p style={{ color: '#84cc16', fontWeight: 600, margin: '4px 0' }}>Corporate ({d.corpPct}%) IDR {d.corporate.toFixed(2)} Billion</p>
            <p style={{ color: '#1e40af', fontWeight: 600, margin: '4px 0' }}>Financial Inst. ({d.finPct}%) IDR {d.finInst.toFixed(2)} Billion</p>
            <p style={{ color: '#f97316', fontWeight: 600, margin: '4px 0' }}>Other Inst. ({d.otherPct}%) IDR {d.otherInst.toFixed(2)} Billion</p>
            <p style={{ color: '#38bdf8', fontWeight: 600, margin: '4px 0' }}>Retail ({d.retailPct}%) IDR {d.retail.toFixed(2)} Billion</p>
            <p style={{ color: '#a855f7', fontWeight: 600, margin: '4px 0' }}>Sec. Co. & MF ({d.secPct}%) IDR {d.secCo.toFixed(2)} Billion</p>
        </div>
    );
};

export const ADVCombinedBreakdown: React.FC<{
    domesticData: any[],
    investorTypeData: any[],
    title: string,
    subtitle: string,
    note: string
}> = ({ domesticData, investorTypeData, title, subtitle, note }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    
    return (
        <div ref={containerRef} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-8">
            <div>
                <h3 className="text-xl font-black text-[#1e293b]">{title}</h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tight">{subtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Domestic vs Foreign */}
                <div className="flex flex-col">
                    <h4 className="text-center text-lg font-black text-[#1e293b] mb-8 uppercase tracking-widest">Domestic vs Foreign</h4>
                    <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart data={domesticData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" fontSize={10} tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                            <YAxis fontSize={10} tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString()} />
                            <Tooltip content={<DomesticForeignTooltip />} />
                            <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', paddingTop: '30px'}} />
                            <Bar dataKey="domestic" name="Domestic" stackId="a" fill="#1e40af">
                                <LabelList dataKey="domPct" position="center" formatter={(v: number) => `${v}%`} style={{ fill: '#fff', fontSize: '9px', fontWeight: 'bold' }} />
                            </Bar>
                            <Bar dataKey="foreign" name="Foreign" stackId="a" fill="#f97316">
                                <LabelList dataKey="forPct" position="center" formatter={(v: number) => `${v}%`} style={{ fill: '#fff', fontSize: '9px', fontWeight: 'bold' }} />
                            </Bar>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Retail vs Institution */}
                <div className="flex flex-col">
                    <h4 className="text-center text-lg font-black text-[#1e293b] mb-8 uppercase tracking-widest">Retail vs Institution</h4>
                    <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart data={investorTypeData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" fontSize={10} tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                            <YAxis fontSize={10} tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString()} />
                            <Tooltip content={<RetailInstitutionTooltip />} />
                            <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', paddingTop: '30px'}} />
                            <Bar dataKey="corporate" name="Corporate" stackId="a" fill="#84cc16">
                                <LabelList dataKey="corpPct" position="center" formatter={(v: number) => v > 5 ? `${v}%` : ''} style={{ fill: '#fff', fontSize: '9px', fontWeight: 'bold' }} />
                            </Bar>
                            <Bar dataKey="finInst" name="Financial Inst." stackId="a" fill="#1e40af">
                                <LabelList dataKey="finPct" position="center" formatter={(v: number) => v > 5 ? `${v}%` : ''} style={{ fill: '#fff', fontSize: '9px', fontWeight: 'bold' }} />
                            </Bar>
                            <Bar dataKey="otherInst" name="Other Inst." stackId="a" fill="#f97316">
                                <LabelList dataKey="otherPct" position="center" formatter={(v: number) => v > 5 ? `${v}%` : ''} style={{ fill: '#fff', fontSize: '9px', fontWeight: 'bold' }} />
                            </Bar>
                            <Bar dataKey="retail" name="Retail" stackId="a" fill="#38bdf8">
                                <LabelList dataKey="retailPct" position="center" formatter={(v: number) => v > 5 ? `${v}%` : ''} style={{ fill: '#fff', fontSize: '9px', fontWeight: 'bold' }} />
                            </Bar>
                            <Bar dataKey="secCo" name="Sec. Co. & MF" stackId="a" fill="#a855f7">
                                <LabelList dataKey="secPct" position="center" formatter={(v: number) => v > 5 ? `${v}%` : ''} style={{ fill: '#fff', fontSize: '9px', fontWeight: 'bold' }} />
                            </Bar>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                    {note}
                </p>
            </div>
            
            <div className="flex justify-end">
                <ChartControls onDownload={() => downloadElementAsPNG(containerRef.current, title)} />
            </div>
        </div>
    );
};

export const MultiStackedTrendChart: React.FC<{ 
    data: any[], 
    categories: { key: string, name: string, color: string }[],
    trendKey: string,
    title: string,
    subtitle?: string,
    isCurrency?: boolean
}> = ({ data, categories, trendKey, title, subtitle, isCurrency }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    return (
    <div ref={containerRef} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#1e293b]">{title}</h3>
          {subtitle && <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{subtitle}</p>}
        </div>
        <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={11} tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <YAxis 
                    fontSize={11} 
                    tick={{fill: '#94a3b8'}} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(value) => isCurrency ? (value).toLocaleString() : value.toLocaleString()} 
                />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                    formatter={(value: any, name: string) => {
                        return [typeof value === 'number' ? value.toLocaleString(undefined, {minimumFractionDigits: 2}) : value, name];
                    }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle" 
                  wrapperStyle={{fontSize: '11px', fontWeight: 'bold', paddingTop: '20px'}} 
                />
                {categories.map((cat) => (
                    <Bar key={cat.key} dataKey={cat.key} name={cat.name} stackId="a" fill={cat.color} />
                ))}
                <Line type="monotone" dataKey="total" name={trendKey} stroke="#eab308" strokeWidth={3} dot={{r: 5, fill: '#fff', stroke: '#eab308', strokeWidth: 2}}>
                    <LabelList dataKey="total" position="top" formatter={(v: number) => v.toFixed(2)} style={{ fill: '#1e293b', fontSize: '10px', fontWeight: 'bold' }} />
                </Line>
            </ComposedChart>
        </ResponsiveContainer>
        <ChartControls onDownload={() => downloadElementAsPNG(containerRef.current, title)} />
    </div>
    );
};

export const ClientTrendChart: React.FC<{ data: any[], title: string }> = ({ data, title }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    return (
    <div ref={containerRef} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1e293b]">{title}</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" fontSize={11} tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" fontSize={11} tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" fontSize={11} tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend 
                  verticalAlign="top" 
                  align="right"
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingBottom: '20px' }} 
                />
                <Bar yAxisId="left" dataKey="new" fill="#f97316" name="New Clients" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="existing" stroke="#3b82f6" name="Existing Clients" strokeWidth={3} dot={{r: 5, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2}} />
            </ComposedChart>
        </ResponsiveContainer>
        <ChartControls onDownload={() => downloadElementAsPNG(containerRef.current, title)} />
    </div>
    );
};
