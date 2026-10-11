import React, { useState } from 'react';
import { Card } from '../common/Card';
import { 
  Scan, 
  Layers, 
  Crosshair, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { AnalyzeResponse, ValidatedMediaFile } from '../../types/analysis';

export interface BoundingBox {
  id: string;
  label: string;
  category: 'face' | 'audio' | 'texture' | 'boundary' | 'lip_sync';
  top: number; // percentage (0-100)
  left: number; // percentage (0-100)
  width: number; // percentage (0-100)
  height: number; // percentage (0-100)
  riskScore: number;
  description: string;
}

export interface FrameViewerProps {
  result: AnalyzeResponse;
  mediaFile?: ValidatedMediaFile | null;
}

export const FrameViewer: React.FC<FrameViewerProps> = ({
  result,
  mediaFile,
}) => {
  const [selectedFrame, setSelectedFrame] = useState(1);
  const [showBoxes, setShowBoxes] = useState(true);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const totalFrames = 8;

  // Mocked bounding boxes per frame based on analyze response probability and breakdown
  const getBoxesForFrame = (frame: number): BoundingBox[] => {
    const isHighRisk = result.ai_probability >= 70;
    const isMediumRisk = result.ai_probability >= 26 && result.ai_probability < 70;

    if (!isHighRisk && !isMediumRisk) {
      // Authentic: clean or single low-risk PRNU / face crop box
      return [
        {
          id: 'box-auth-1',
          label: 'Biological Facial Region',
          category: 'face',
          top: 24,
          left: 36,
          width: 28,
          height: 38,
          riskScore: Math.round(result.breakdown.face),
          description: 'Uniform skin tones, natural lighting continuity, and coherent face boundaries.',
        },
      ];
    }

    // High or Medium risk mock bounding boxes
    const frameOffsets = [
      { top: 22, left: 34, w: 32, h: 42 },
      { top: 24, left: 35, w: 31, h: 40 },
      { top: 21, left: 33, w: 33, h: 44 },
      { top: 25, left: 36, w: 30, h: 39 },
      { top: 23, left: 35, w: 32, h: 41 },
      { top: 20, left: 34, w: 34, h: 43 },
      { top: 26, left: 37, w: 29, h: 38 },
      { top: 22, left: 35, w: 31, h: 41 },
    ];

    const currentOffset = frameOffsets[(frame - 1) % frameOffsets.length];

    const boxes: BoundingBox[] = [
      {
        id: `box-face-${frame}`,
        label: isHighRisk ? 'GAN Face-Swap Perimeter' : 'Micro-Temporal Boundary',
        category: 'face',
        top: currentOffset.top,
        left: currentOffset.left,
        width: currentOffset.w,
        height: currentOffset.h,
        riskScore: Math.round(result.breakdown.face),
        description: isHighRisk 
          ? 'Deepfake mask seam blurring & warped facial alignment perimeter.'
          : 'Minor temporal flicker along facial bounding perimeter.',
      },
      {
        id: `box-mouth-${frame}`,
        label: 'Lip-Sync Viseme Anomaly',
        category: 'lip_sync',
        top: currentOffset.top + 23,
        left: currentOffset.left + 8,
        width: 16,
        height: 12,
        riskScore: Math.round(result.breakdown.lip_sync),
        description: 'Mouth viseme motion out-of-phase with audio phoneme acoustics (>80ms delay).',
      },
    ];

    if (isHighRisk && frame % 2 === 0) {
      boxes.push({
        id: `box-texture-${frame}`,
        label: 'Diffusion Noise Glitch',
        category: 'texture',
        top: currentOffset.top + 5,
        left: currentOffset.left + 22,
        width: 14,
        height: 15,
        riskScore: Math.round(result.breakdown.texture),
        description: Math.round(result.breakdown.texture) >= 70
          ? 'Elevated spatial noise and atypical pixel variance along boundary.'
          : 'Low-variance texture pattern within standard ranges.',
      });
    }

    return boxes;
  };

  const currentBoxes = getBoxesForFrame(selectedFrame);
  const activeBox = currentBoxes.find((b) => b.id === selectedBoxId) || currentBoxes[0];

  return (
    <Card variant="default" className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-navy-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-cyan-500" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Forensic Frame & Spatial Artifact Viewer
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Micro-spatial frame inspection with localized neural bounding boxes on suspected generative boundaries
          </p>
        </div>

        {/* Controls Toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBoxes(!showBoxes)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
              showBoxes
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-600 dark:text-cyan-400'
                : 'bg-slate-100 dark:bg-navy-850 border-slate-200 dark:border-navy-750 text-slate-500'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Bounding Boxes {showBoxes ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
              showHeatmap
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400'
                : 'bg-slate-100 dark:bg-navy-850 border-slate-200 dark:border-navy-750 text-slate-500'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Heatmap Overlay</span>
          </button>
        </div>
      </div>

      {/* Frame Visual Canvas Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Visual Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center select-none group">
            {/* If actual media preview URL exists, render image or simulated canvas */}
            {mediaFile?.previewUrl && mediaFile.type === 'image' ? (
              <img
                src={mediaFile.previewUrl}
                alt={result.media_name}
                className="w-full h-full object-contain"
              />
            ) : mediaFile?.previewUrl && mediaFile.type === 'video' ? (
              <video
                src={mediaFile.previewUrl}
                className="w-full h-full object-contain"
              />
            ) : (
              /* Simulated High-Res Forensic Inspection Plate */
              <div className="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-b from-slate-900 via-navy-950 to-slate-950">
                {/* Visual Grid Lines */}
                <div className="absolute inset-0 bg-grid-light dark:bg-grid-dark opacity-30 pointer-events-none" />

                {/* Abstract Face / Spatial Silhouette Wireframe */}
                <div className="w-48 h-60 rounded-[45%] border-2 border-dashed border-cyan-500/40 relative flex items-center justify-center">
                  <div className="w-32 h-20 rounded-full border border-cyan-500/30 -mt-12 flex justify-around items-center px-4">
                    <span className="w-3 h-3 rounded-full bg-cyan-400/60 animate-pulse" />
                    <span className="w-3 h-3 rounded-full bg-cyan-400/60 animate-pulse" />
                  </div>
                  <div className="w-16 h-8 rounded-full border border-cyan-500/40 absolute bottom-12" />
                </div>

                <div className="absolute bottom-3 left-4 text-[11px] font-mono text-slate-400">
                  Target: <strong className="text-white">{result.media_name}</strong> • Frame 00{selectedFrame}/008 • 1080p RGB
                </div>
              </div>
            )}

            {/* Simulated Anomaly Heatmap Overlay */}
            {showHeatmap && (
              <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70 bg-gradient-to-tr from-transparent via-rose-500/30 to-amber-400/40 animate-pulse" />
            )}

            {/* Bounding Boxes on Suspicious Regions */}
            {showBoxes &&
              currentBoxes.map((box) => {
                const isSelected = box.id === activeBox?.id;
                const isHigh = box.riskScore >= 70;
                const isMed = box.riskScore >= 26 && box.riskScore < 70;

                const borderColor = isHigh
                  ? 'border-rose-500 shadow-rose-500/50'
                  : isMed
                  ? 'border-amber-500 shadow-amber-500/50'
                  : 'border-emerald-500 shadow-emerald-500/50';

                const badgeBg = isHigh
                  ? 'bg-rose-500 text-white'
                  : isMed
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-emerald-500 text-white';

                return (
                  <div
                    key={box.id}
                    onClick={() => setSelectedBoxId(box.id)}
                    className={`absolute border-2 ${borderColor} transition-all duration-300 cursor-pointer rounded-lg ${
                      isSelected
                        ? 'ring-4 ring-cyan-500/50 scale-[1.02] z-30 shadow-xl'
                        : 'hover:scale-[1.01] z-20 shadow-md'
                    }`}
                    style={{
                      top: `${box.top}%`,
                      left: `${box.left}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                    }}
                  >
                    {/* Corner Crosshairs */}
                    <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
                    <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />

                    {/* Badge Label */}
                    <div
                      className={`absolute -top-6 left-0 px-2 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap flex items-center gap-1 shadow-md ${badgeBg}`}
                    >
                      <span>{box.label}</span>
                      <span>({box.riskScore}%)</span>
                    </div>
                  </div>
                );
              })}

            {/* Crosshair Center HUD */}
            <div className="absolute top-4 right-4 pointer-events-none px-2.5 py-1 rounded-md bg-black/70 backdrop-blur border border-white/10 text-[10px] font-mono text-cyan-400 flex items-center gap-1.5">
              <Crosshair className="w-3 h-3" />
              <span>FPS: 30.0 • Latent Scan: Active</span>
            </div>
          </div>

          {/* Frame Scrubber Bar */}
          <div className="flex items-center justify-between gap-3 p-3 bg-slate-100 dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
            <button
              type="button"
              onClick={() => setSelectedFrame((prev) => Math.max(1, prev - 1))}
              disabled={selectedFrame === 1}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Frame Selector Nodes */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {Array.from({ length: totalFrames }).map((_, i) => {
                const frameNum = i + 1;
                const isCurrent = selectedFrame === frameNum;
                return (
                  <button
                    key={frameNum}
                    type="button"
                    onClick={() => setSelectedFrame(frameNum)}
                    className={`w-9 h-9 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isCurrent
                        ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30 ring-2 ring-cyan-500/40'
                        : 'bg-white dark:bg-navy-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-700 hover:border-cyan-500/40'
                    }`}
                  >
                    <span>F{frameNum}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setSelectedFrame((prev) => Math.min(totalFrames, prev + 1))}
              disabled={selectedFrame === totalFrames}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right 4 Cols: Active Bounding Box Diagnostic Details */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-850 border border-slate-200/80 dark:border-navy-750 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-navy-800">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Region Diagnostics
              </span>
              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                Frame {selectedFrame} of {totalFrames}
              </span>
            </div>

            {activeBox ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeBox.label}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      activeBox.riskScore >= 70
                        ? 'bg-rose-500/15 text-rose-500'
                        : activeBox.riskScore >= 26
                        ? 'bg-amber-500/15 text-amber-500'
                        : 'bg-emerald-500/15 text-emerald-500'
                    }`}
                  >
                    {activeBox.riskScore}% Anomaly Risk
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeBox.description}
                </p>

                {/* Coordinate Geometry Chips */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-slate-200/60 dark:border-navy-800">
                  <div className="p-2 rounded bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-750">
                    <span className="text-slate-400 block">Top/Left Offset:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{activeBox.top}% / {activeBox.left}%</strong>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-750">
                    <span className="text-slate-400 block">Box Dimensions:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{activeBox.width}% × {activeBox.height}%</strong>
                  </div>
                </div>

                {/* List of Detected Bounding Boxes in current frame */}
                <div className="pt-2 space-y-1.5">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 block">
                    All Flagged Boxes in Frame {selectedFrame}:
                  </span>
                  {currentBoxes.map((box) => (
                    <button
                      key={box.id}
                      type="button"
                      onClick={() => setSelectedBoxId(box.id)}
                      className={`w-full text-left p-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                        box.id === activeBox.id
                          ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                          : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-navy-800 hover:border-slate-300'
                      }`}
                    >
                      <span className="truncate">{box.label}</span>
                      <span className="font-bold shrink-0">{box.riskScore}%</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No regions flagged in this frame.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
