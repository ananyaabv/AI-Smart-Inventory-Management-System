import React from 'react';
import { BoundingBox } from '../types';

interface DetectionCanvasProps {
  imageUrl: string;
  boxes: BoundingBox[];
  confidenceThreshold: number;
  showBoundingBoxes: boolean;
  viewMode?: 'boxes' | 'canny' | 'threshold' | 'raw';
  cannyMapUrl?: string | null;
  thresholdMapUrl?: string | null;
  showCentroids?: boolean;
  selectedBoxId?: string | null;
  onBoxHover?: (box: BoundingBox | null) => void;
  onSelectBox?: (box: BoundingBox | null) => void;
}

export const DetectionCanvas: React.FC<DetectionCanvasProps> = ({
  imageUrl,
  boxes,
  confidenceThreshold,
  showBoundingBoxes,
  viewMode = 'boxes',
  cannyMapUrl,
  thresholdMapUrl,
  showCentroids = true,
  selectedBoxId,
  onBoxHover,
  onSelectBox
}) => {
  const filteredBoxes = boxes.filter(box => box.confidence >= confidenceThreshold);
  const totalUnits = filteredBoxes.length;

  const currentSrc = (viewMode === 'canny' && cannyMapUrl)
    ? cannyMapUrl
    : (viewMode === 'threshold' && thresholdMapUrl)
      ? thresholdMapUrl
      : imageUrl;

  return (
    <div className="relative w-full flex items-center justify-center rounded-xl bg-slate-950/95 border border-slate-800 shadow-xl overflow-hidden group select-none p-2 sm:p-4 min-h-[380px]">
      {/* Frame container shrink-wrapped to the exact image bounds */}
      <div className="relative inline-block max-w-full">
        {/* Active image layer - uncropped, maintaining intrinsic aspect ratio */}
        <img
          src={currentSrc}
          alt="Store shelf photo"
          className={`block max-w-full max-h-[640px] w-auto h-auto object-contain mx-auto rounded-lg shadow-md select-none ${
            viewMode === 'canny' ? 'filter contrast-125' : ''
          }`}
        />

        {/* Bounding Boxes Layer - strictly overlaying the exact image area */}
        {showBoundingBoxes && (viewMode === 'boxes' || viewMode === 'canny') && (
          <div className="absolute inset-0 pointer-events-auto">
            {filteredBoxes.map((box) => {
              const isSelected = selectedBoxId === box.id;
              return (
                <div
                  key={box.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBox?.(isSelected ? null : box);
                  }}
                  onMouseEnter={() => onBoxHover?.(box)}
                  onMouseLeave={() => onBoxHover?.(null)}
                  className={`absolute transition-all duration-150 cursor-pointer rounded-xs ${
                    isSelected
                      ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-950 z-40 scale-[1.015]'
                      : 'hover:scale-[1.01] hover:z-30'
                  }`}
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                    border: `${isSelected ? '3px' : '2px'} solid ${box.color}`,
                    backgroundColor: viewMode === 'canny' ? `${box.color}20` : `${box.color}25`,
                    boxShadow: isSelected
                      ? `0 0 16px ${box.color}, inset 0 0 10px ${box.color}40`
                      : `0 0 12px ${box.color}55, inset 0 0 8px ${box.color}25`,
                  }}
                >
                  {/* Product Label & Confidence / Commercial Tag */}
                  <div
                    className={`absolute left-0 -top-7 px-2.5 py-1 text-[11px] font-mono font-bold text-white rounded-t-lg shadow-lg whitespace-nowrap flex items-center gap-1.5 z-20 ${
                      isSelected ? 'ring-2 ring-white' : ''
                    }`}
                    style={{ backgroundColor: box.color }}
                  >
                    <span className="capitalize font-semibold">{box.label}</span>
                    {box.rateFormatted && (
                      <span className="bg-emerald-950/80 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded font-mono border border-emerald-500/40">
                        {box.rateFormatted}
                      </span>
                    )}
                    <span className="opacity-90 font-normal text-[10px] bg-black/30 px-1.5 py-0.5 rounded">
                      {(box.confidence * 100).toFixed(0)}%
                    </span>
                    {isSelected && (
                      <span className="bg-white text-slate-900 text-[9px] px-1 rounded uppercase font-bold">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Sub-item markers if commercial unit group */}
                  {box.subItems && box.subItems.length > 0 && (
                    <div className="absolute inset-0 pointer-events-none">
                      {box.subItems.map((sub, sIdx) => {
                        // Relative coordinates inside the parent commercial box
                        const relX = ((sub.x - box.x) / box.width) * 100;
                        const relY = ((sub.y - box.y) / box.height) * 100;
                        const relW = (sub.width / box.width) * 100;
                        const relH = (sub.height / box.height) * 100;

                        return (
                          <div
                            key={sub.id || sIdx}
                            className="absolute rounded-full border border-dashed border-white/70 shadow-sm flex items-center justify-center"
                            style={{
                              left: `${Math.max(0, relX)}%`,
                              top: `${Math.max(0, relY)}%`,
                              width: `${relW}%`,
                              height: `${relH}%`,
                              backgroundColor: `${box.color}20`
                            }}
                            title={`Piece #${sIdx + 1} (${sub.confidence ? (sub.confidence * 100).toFixed(0) : 98}%)`}
                          >
                            <span className="text-[8px] font-mono text-white font-bold bg-black/50 px-1 rounded-full scale-75">
                              #{sIdx + 1}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Centroid Marker Dot */}
                  {showCentroids && !box.subItems && (
                    <div
                      className="absolute w-2.5 h-2.5 rounded-full border border-white -translate-x-1/2 -translate-y-1/2 shadow"
                      style={{
                        left: '50%',
                        top: '50%',
                        backgroundColor: box.color
                      }}
                      title={`Centroid: [${(box.x + box.width / 2).toFixed(1)}%, ${(box.y + box.height / 2).toFixed(1)}%]`}
                    />
                  )}

                  {/* Dimensions or Commercial Info badge inside bottom right */}
                  <div className="absolute right-1.5 bottom-1 text-[9px] font-mono text-slate-200/90 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-700/60 shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: box.color }} />
                    {box.pieceCount ? (
                      <span className="font-semibold text-emerald-400">{box.pieceCount} pcs / {box.commercialUnit || 'kg'}</span>
                    ) : (
                      <span>{box.width.toFixed(1)}x{box.height.toFixed(1)}%</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View Mode Watermark Banner */}
      <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md text-[11px] px-3 py-1.5 rounded-lg border border-slate-700/80 font-mono text-slate-200 flex items-center gap-2 shadow-lg z-20">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        {viewMode === 'boxes' && <span>OpenCV Object Segmentation</span>}
        {viewMode === 'canny' && <span>OpenCV Canny Edge Filter</span>}
        {viewMode === 'threshold' && <span>OpenCV Contour Mask</span>}
        {viewMode === 'raw' && <span>Raw Camera Feed</span>}
      </div>

      {/* Product Count Indicator overlay badge */}
      <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md text-slate-200 text-xs px-3.5 py-1.5 rounded-full border border-slate-700/80 font-mono shadow-lg flex items-center gap-2 z-20">
        <span className="text-emerald-400 font-bold">{totalUnits}</span>
        <span>{totalUnits === 1 ? 'Product Enclosed' : 'Products Enclosed'}</span>
      </div>
    </div>
  );
};
