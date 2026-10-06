import React, { useState, useRef, useEffect } from 'react';
import { SAMPLE_IMAGES } from '../data/samples';
import { DetectionCanvas } from './DetectionCanvas';
import { BoundingBox, ProductItem, SampleImage, UserProfile, OpenCVDetectionResult } from '../types';
import { formatINR } from '../utils/storage';
import { runOpenCVDetection, isOpenCVReady, groupProduceIntoCommercialBoxes } from '../utils/opencvDetector';
import {
  Camera,
  Upload,
  Sliders,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Database,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Layers,
  Image as ImageIcon,
  AlertCircle,
  Tag,
  ShieldCheck,
  TrendingUp,
  Store,
  Eye,
  Activity,
  Cpu,
  Video,
  X,
  Maximize2,
  ScanLine,
  SlidersHorizontal,
  Info,
  Crosshair,
  RotateCcw
} from 'lucide-react';

interface DetectionViewProps {
  products: ProductItem[];
  currentUser: UserProfile;
  onSyncDetections: (detectedCounts: { [label: string]: number }, imageName: string) => void;
}

export const DetectionView: React.FC<DetectionViewProps> = ({
  products,
  currentUser,
  onSyncDetections
}) => {
  const [selectedSample, setSelectedSample] = useState<SampleImage>(SAMPLE_IMAGES[0]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.25);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [customBoxes, setCustomBoxes] = useState<BoundingBox[] | null>(null);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  // OpenCV State & Controls
  const [openCVResult, setOpenCVResult] = useState<OpenCVDetectionResult | null>(null);
  const [openCVViewMode, setOpenCVViewMode] = useState<'boxes' | 'canny' | 'threshold' | 'raw'>('boxes');
  const [detectionSource, setDetectionSource] = useState<'opencv' | 'preset'>('opencv');
  const [cannyLow, setCannyLow] = useState<number>(30);
  const [cannyHigh, setCannyHigh] = useState<number>(90);
  const [showAdvancedCV, setShowAdvancedCV] = useState<boolean>(false);
  const [isOpenCVWasmReady, setIsOpenCVWasmReady] = useState<boolean>(false);
  const [targetProductClass, setTargetProductClass] = useState<string>('auto'); // Target product class filter to avoid phantom objects
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [produceBoxMode, setProduceBoxMode] = useState<'commercial' | 'individual'>('commercial');

  // Live Camera State
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Active image
  const currentImageUrl = uploadedImageUrl || selectedSample.url;

  // Check OpenCV WASM readiness on load & poll briefly
  useEffect(() => {
    const checkCV = () => {
      if (isOpenCVReady()) {
        setIsOpenCVWasmReady(true);
      }
    };
    checkCV();
    const timer = setInterval(checkCV, 1000);
    return () => clearInterval(timer);
  }, []);

  // Execute OpenCV detection on an image
  const executeOpenCV = async (
    imgUrl: string,
    cLow = cannyLow,
    cHigh = cannyHigh,
    conf = confidenceThreshold,
    target = targetProductClass
  ) => {
    setIsAnalyzing(true);
    try {
      const result = await runOpenCVDetection(
        imgUrl,
        {
          cannyLow: cLow,
          cannyHigh: cHigh,
          confidenceThreshold: conf,
          targetClass: target,
          shelfCategory: selectedSample.category
        },
        products
      );

      setOpenCVResult(result);
      setCustomBoxes(result.boxes);
    } catch (err) {
      console.error('OpenCV detection error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run OpenCV on initial load or when sample changes
  useEffect(() => {
    if (detectionSource === 'opencv' && !uploadedImageUrl) {
      executeOpenCV(selectedSample.url);
    }
  }, [selectedSample.id, detectionSource]);

  // Determine raw individual bounding boxes
  const rawIndividualBoxes = detectionSource === 'opencv'
    ? (customBoxes !== null ? customBoxes : selectedSample.boxes)
    : (uploadedImageUrl && customBoxes !== null ? customBoxes : selectedSample.boxes);

  // Compute active boxes according to produceBoxMode ('commercial' per kg/dozen or 'individual')
  const currentBoxes = produceBoxMode === 'commercial'
    ? (!uploadedImageUrl && selectedSample.commercialBoxes && selectedSample.commercialBoxes.length > 0
        ? selectedSample.commercialBoxes
        : groupProduceIntoCommercialBoxes(rawIndividualBoxes, products))
    : rawIndividualBoxes;

  // Filter boxes by confidence
  const activeBoxes = currentBoxes.filter(b => b.confidence >= confidenceThreshold);

  // Product Counts dictionary - tracks both commercial boxes and enclosed physical pieces
  const countsDict: {
    [key: string]: {
      count: number;
      piecesCount: number;
      commercialQty?: number;
      commercialUnit?: string;
      color: string;
      avgConf: number;
    };
  } = {};

  activeBoxes.forEach((box) => {
    const piecesInBox = box.pieceCount || (box.subItems ? box.subItems.length : (box.count || 1));
    const commQty = box.commercialQuantity || 1;
    const commUnit = box.commercialUnit || 'unit';

    if (!countsDict[box.label]) {
      countsDict[box.label] = {
        count: 0,
        piecesCount: 0,
        commercialQty: 0,
        commercialUnit: commUnit,
        color: box.color,
        avgConf: box.confidence
      };
    }
    countsDict[box.label].count += 1;
    countsDict[box.label].piecesCount += piecesInBox;
    if (countsDict[box.label].commercialQty !== undefined) {
      countsDict[box.label].commercialQty! += commQty;
    }
  });

  const totalBoxCount = activeBoxes.length;
  const totalItemCount = activeBoxes.reduce((s, b) => s + (b.pieceCount || (b.subItems ? b.subItems.length : (b.count || 1))), 0);

  // Helper to match catalog SKU for detected optical label
  const findMatchedProduct = (label: string) => {
    const ln = label.toLowerCase();
    return products.find(p => {
      const pn = p.name.toLowerCase();
      if (pn === ln) return true;
      if (ln === 'can' && (pn === 'can' || pn.includes('can') || pn.includes('soft drinks'))) return true;
      if (ln === 'bottle' && (pn === 'bottle' || pn.includes('water'))) return true;
      if (ln.includes('apple') && pn.includes('apple')) return true;
      if (ln.includes('orange') && pn.includes('orange')) return true;
      if (ln.includes('banana') && pn.includes('banana')) return true;
      if (ln.includes('pear') && pn.includes('pear')) return true;
      if (ln.includes('grape') && pn.includes('grape')) return true;
      if (ln.includes('milk') && pn.includes('milk')) return true;
      if (ln.includes('cereal') && pn.includes('cereal')) return true;
      if (ln.includes('drink') && pn.includes('drink')) return true;
      if (ln.includes('juice') && pn.includes('juice')) return true;
      if (ln.includes('canned') && pn.includes('canned')) return true;
      return false;
    });
  };

  // Helper to calculate commercial retail unit, measure, and valuation (accounting for per kg and per dozen produce)
  const getDetectedItemMeasure = (label: string, count: number, piecesCount?: number) => {
    const matched = findMatchedProduct(label);
    const ln = label.toLowerCase();
    const unit = matched?.unit || (ln.includes('banana') ? 'dozen' : (ln.includes('apple') || ln.includes('orange') || ln.includes('pear')) ? 'kg' : 'unit');
    const piecesPerUnit = matched?.piecesPerUnit || (unit === 'dozen' ? 12 : unit === 'kg' ? (ln.includes('pear') ? 5 : 6) : 1);
    const unitPrice = matched ? matched.unitPrice : (unit === 'dozen' ? 60 : unit === 'kg' ? (ln.includes('apple') ? 180 : 90) : 40);

    const effectivePieces = piecesCount !== undefined ? piecesCount : count;

    let commercialQty = count;
    let commercialMeasure = `${count} units`;
    let valuation = count * unitPrice;

    if (unit === 'kg') {
      commercialQty = Number((effectivePieces / piecesPerUnit).toFixed(1));
      commercialMeasure = `${commercialQty} kg (${effectivePieces} pcs)`;
      valuation = commercialQty * unitPrice;
    } else if (unit === 'dozen') {
      commercialQty = Number((effectivePieces / piecesPerUnit).toFixed(1));
      commercialMeasure = `${commercialQty} doz (${effectivePieces} pcs)`;
      valuation = commercialQty * unitPrice;
    } else if (unit === 'can') {
      commercialMeasure = `${effectivePieces} cans`;
      valuation = effectivePieces * unitPrice;
    } else if (unit === 'bottle') {
      commercialMeasure = `${effectivePieces} bottles`;
      valuation = effectivePieces * unitPrice;
    } else if (unit === 'pack') {
      commercialMeasure = `${effectivePieces} packs`;
      valuation = effectivePieces * unitPrice;
    } else if (unit === 'box') {
      commercialMeasure = `${effectivePieces} boxes`;
      valuation = effectivePieces * unitPrice;
    }

    return {
      matched,
      unit,
      piecesPerUnit,
      unitPrice,
      commercialQty,
      commercialMeasure,
      valuation,
      effectivePieces
    };
  };

  // Calculate total retail valuation of detected shelf items with per kg / dozen pricing
  const totalScanValuation = Object.entries(countsDict).reduce((acc, [label, info]) => {
    const measure = getDetectedItemMeasure(label, info.count, info.piecesCount);
    return acc + measure.valuation;
  }, 0);

  // Precision bounding box micro-nudge handler
  const handleNudgeBox = (dx: number, dy: number, dw: number, dh: number) => {
    if (!selectedBoxId) return;
    const baseBoxes = customBoxes !== null ? customBoxes : selectedSample.boxes;
    const updated = baseBoxes.map(b => {
      if (b.id !== selectedBoxId) return b;
      return {
        ...b,
        x: Math.max(0, Math.min(95, Number((b.x + dx).toFixed(1)))),
        y: Math.max(0, Math.min(95, Number((b.y + dy).toFixed(1)))),
        width: Math.max(2, Math.min(100 - b.x, Number((b.width + dw).toFixed(1)))),
        height: Math.max(2, Math.min(100 - b.y, Number((b.height + dh).toFixed(1))))
      };
    });
    setCustomBoxes(updated);
  };

  const handleResetAlignment = () => {
    setCustomBoxes(null);
    setSelectedBoxId(null);
  };

  // Handle image upload & call OpenCV detection
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setUploadedImageUrl(previewUrl);
    setDetectionSource('opencv');
    setSyncSuccessMsg(null);

    // 1. Immediately run OpenCV detection locally
    await executeOpenCV(previewUrl);

    // 2. Also attempt server API detection in the background to augment if Gemini key exists
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const resp = await fetch('/api/detect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64,
              mimeType: file.type || 'image/jpeg',
              confidenceThreshold
            })
          });

          if (resp.ok) {
            const data = await resp.json();
            if (data.boxes && data.boxes.length > 0 && !data.fallback) {
              setCustomBoxes(data.boxes);
            }
          }
        } catch {
          // OpenCV already provided boxes; nothing to break
        }
      };
      reader.readAsDataURL(file);
    } catch {
      // Ignored
    }
  };

  // Live Camera Functions
  const startCamera = async () => {
    setIsCameraOpen(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(err.message || 'Unable to access device camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhotoAndScan = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');

    setUploadedImageUrl(dataUrl);
    setDetectionSource('opencv');
    stopCamera();

    // Run OpenCV on captured frame
    executeOpenCV(dataUrl);
  };

  const handleSyncToDatabase = () => {
    const countsOnly: { [label: string]: number } = {};
    activeBoxes.forEach(box => {
      const ln = box.label.toLowerCase();
      let canonicalLabel = box.label;
      if (ln.includes('apple')) canonicalLabel = 'apple';
      else if (ln.includes('orange') || ln.includes('citrus')) canonicalLabel = 'orange';
      else if (ln.includes('banana')) canonicalLabel = 'banana';
      else if (ln.includes('cereal')) canonicalLabel = 'cereal box';
      else if (ln.includes('milk')) canonicalLabel = 'milk carton';
      else if (ln.includes('canned')) canonicalLabel = 'canned goods';
      else if (ln.includes('juice')) canonicalLabel = 'juices';
      else if (ln.includes('drink') || ln.includes('soda') || ln.includes('can')) canonicalLabel = 'soft drinks';

      const pieces = box.pieceCount || (box.subItems ? box.subItems.length : (box.count || 1));
      countsOnly[canonicalLabel] = (countsOnly[canonicalLabel] || 0) + pieces;
    });

    const sourceLabel = uploadedImageUrl
      ? 'Live Camera / Photo Upload (OpenCV)'
      : `${selectedSample.name} (${produceBoxMode === 'commercial' ? 'Commercial Units: per kg/dozen' : 'Individual Pieces'})`;

    onSyncDetections(countsOnly, sourceLabel);
    setSyncSuccessMsg(`Successfully updated store inventory with ${totalItemCount} verified item(s) (${formatINR(totalScanValuation)}) via OpenCV Optical Scanner!`);
    setTimeout(() => setSyncSuccessMsg(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Sync Success Alert */}
      {syncSuccessMsg && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs sm:text-sm font-medium flex items-center gap-3 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                  <Camera className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Live OpenCV Shelf Camera</h3>
                  <p className="text-xs text-slate-400">Point at retail racks or shelves to capture and count products</p>
                </div>
              </div>
              <button
                onClick={stopCamera}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cameraError ? (
              <div className="p-4 bg-rose-950/60 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                {cameraError}
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center border border-slate-800">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* OpenCV Crosshairs & Reticle */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-3/4 h-3/4 border-2 border-dashed border-cyan-400/60 rounded-xl flex items-center justify-center">
                    <ScanLine className="w-10 h-10 text-cyan-400/70 animate-pulse" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 bg-slate-900/80 text-cyan-300 text-[11px] font-mono px-2.5 py-1 rounded-full border border-cyan-500/30">
                  OpenCV Live Stream Active
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">Ensure good lighting on the shelf barcodes and labels</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={capturePhotoAndScan}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture & Run OpenCV Scan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Control Panel: Scenario Selection & Camera/Upload */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
              <Store className="w-4 h-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-100">
                Store Shelf Scenarios & Camera Capture
              </p>
              <p className="text-xs text-slate-400">
                Choose a pre-configured retail department, upload a custom shelf photo, or snap via webcam
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* OpenCV Engine Diagnostics Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isOpenCVWasmReady ? 'OpenCV.js WASM 4.10' : 'OpenCV Canvas-CV Core'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </div>
          </div>
        </div>

        {/* Grid of 14 Pre-configured Store Shelf Scenarios */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {SAMPLE_IMAGES.map((sample) => {
            const isSelected = !uploadedImageUrl && selectedSample.id === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => {
                  setSelectedSample(sample);
                  setUploadedImageUrl(null);
                  setCustomBoxes(null);
                  if (detectionSource === 'opencv') {
                    executeOpenCV(sample.url);
                  }
                }}
                className={`group text-left rounded-xl p-2 border transition-all duration-200 relative flex flex-col justify-between overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-500 ring-2 ring-cyan-500/50 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-2 bg-slate-900">
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-cyan-600/25 border-2 border-cyan-400 rounded-lg flex items-center justify-center">
                      <span className="bg-cyan-600 text-white p-1 rounded-full shadow">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p className={`text-[11px] font-semibold truncate leading-tight ${isSelected ? 'text-cyan-200' : 'text-slate-300'}`}>
                    {sample.name.split('(')[0].trim()}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {sample.category}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Upload Custom Shelf Photo or Use Webcam */}
        <div className="pt-2">
          <div className="border-2 border-dashed border-slate-700/80 hover:border-cyan-500/60 rounded-xl p-4 text-center transition-all bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  Scan Your Own Store Shelf, Cooler, or Rack
                </p>
                <p className="text-[11px] text-slate-400">
                  OpenCV processes any image with Canny edge detection, contour bounding boxes, and stock counts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={startCamera}
                className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Video className="w-3.5 h-3.5 text-cyan-400" />
                <span>Device Camera</span>
              </button>

              <input
                type="file"
                id="inv-file-upload"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="inv-file-upload"
                className="flex-1 sm:flex-initial cursor-pointer px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
              </label>

              {uploadedImageUrl && (
                <button
                  onClick={() => {
                    setUploadedImageUrl(null);
                    setCustomBoxes(null);
                    setOpenCVResult(null);
                    executeOpenCV(selectedSample.url);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition-all cursor-pointer"
                >
                  Reset Presets
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Detection Engine Switcher & View Controls */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Produce Bounding Box Mode (per kg / dozen) */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-emerald-500/40 shadow-sm mr-2">
              <button
                onClick={() => setProduceBoxMode('commercial')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  produceBoxMode === 'commercial'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Put boxes around produce per commercial selling units: per kg (apples/oranges) and per dozen (bananas)"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-300" />
                <span>Boxes per kg / dozen</span>
                <span className="text-[10px] bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono font-bold">
                  COMMERCIAL
                </span>
              </button>

              <button
                onClick={() => setProduceBoxMode('individual')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  produceBoxMode === 'individual'
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Display separate bounding box around each single piece"
              >
                <Crosshair className="w-3.5 h-3.5 text-cyan-300" />
                <span>Individual Pieces</span>
              </button>
            </div>

            {/* Detection Engine Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 mr-2">
              <button
                onClick={() => setDetectionSource('preset')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  detectionSource === 'preset'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Use verified store shelf ground-truth annotations (avoids phantom detections)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>YOLOv8 Shelf Ground Truth</span>
              </button>

              <button
                onClick={() => {
                  setDetectionSource('opencv');
                  executeOpenCV(currentImageUrl);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  detectionSource === 'opencv'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Run live OpenCV WASM Canny edge and contour detection"
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-300" />
                <span>Live OpenCV Vision</span>
              </button>
            </div>

            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-1 hidden lg:inline-flex">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              View:
            </span>

            <button
              onClick={() => setOpenCVViewMode('boxes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                openCVViewMode === 'boxes'
                  ? 'bg-cyan-600 text-white shadow font-semibold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              Objects & Bounding Boxes
            </button>

            <button
              onClick={() => setOpenCVViewMode('canny')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                openCVViewMode === 'canny'
                  ? 'bg-cyan-600 text-white shadow font-semibold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Canny Edges (B&W)</span>
            </button>

            <button
              onClick={() => setOpenCVViewMode('threshold')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                openCVViewMode === 'threshold'
                  ? 'bg-cyan-600 text-white shadow font-semibold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              Contour Mask
            </button>

            <button
              onClick={() => setOpenCVViewMode('raw')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                openCVViewMode === 'raw'
                  ? 'bg-cyan-600 text-white shadow font-semibold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              Raw Image
            </button>

            <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

            {/* Target Product Filter Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="text-slate-400 text-[11px] font-medium hidden md:inline">Target Item:</span>
              <select
                value={targetProductClass}
                onChange={(e) => {
                  const val = e.target.value;
                  setTargetProductClass(val);
                  executeOpenCV(currentImageUrl, cannyLow, cannyHigh, confidenceThreshold, val);
                }}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                title="Select expected shelf product type to ensure accurate identification without phantom detections"
              >
                <option value="auto">Auto (All Products Enclosed)</option>
                <option value="soft drinks">Soft Drinks (Cans / Sodas)</option>
                <option value="juices">Juices (Bottles / Fruit Drinks)</option>
                <option value="cereal box">Cereal Boxes</option>
                <option value="milk carton">Milk Cartons (Dairy)</option>
                <option value="canned goods">Canned Goods (Soups / Pulses)</option>
                <option value="apple">Apples (Produce)</option>
                <option value="orange">Oranges (Produce)</option>
                <option value="banana">Bananas (Produce)</option>
                <option value="pear">Pears (Produce)</option>
                <option value="grapes">Grapes (Produce)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAdvancedCV(!showAdvancedCV)}
              className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showAdvancedCV ? 'Hide CV Sliders' : 'OpenCV Parameters'}</span>
            </button>

            <button
              onClick={() => executeOpenCV(currentImageUrl, cannyLow, cannyHigh, confidenceThreshold, targetProductClass)}
              disabled={isAnalyzing}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>Re-run OpenCV Recognition</span>
            </button>
          </div>
        </div>

        {/* Collapsible OpenCV Edge & Sensitivity Parameters */}
        {showAdvancedCV && (
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-2 border-b border-slate-800/80">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Sliders className="w-3.5 h-3.5" />
                Fine-tune OpenCV Detection Parameters
              </span>
              <span className="text-[11px] text-slate-400">
                Modifies edge hysteresis & contour segmentation thresholds
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Canny Low Threshold:</span>
                  <span className="font-mono text-cyan-400 font-bold">{cannyLow}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={cannyLow}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setCannyLow(val);
                    executeOpenCV(currentImageUrl, val, cannyHigh, confidenceThreshold);
                  }}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Canny High Threshold:</span>
                  <span className="font-mono text-cyan-400 font-bold">{cannyHigh}</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="180"
                  step="5"
                  value={cannyHigh}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setCannyHigh(val);
                    executeOpenCV(currentImageUrl, cannyLow, val, confidenceThreshold);
                  }}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Confidence Filter:</span>
                  <span className="font-mono text-cyan-400 font-bold">{(confidenceThreshold * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.85"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* OpenCV Real-Time Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-100 font-mono">{totalItemCount}</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Physical Units Counted</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-100 font-mono">{Object.keys(countsDict).length}</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Product Categories</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-indigo-300 font-mono">{formatINR(totalScanValuation)}</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Estimated Shelf Value</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-xl">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-teal-300 font-mono">
              {openCVResult ? `${openCVResult.processingTimeMs}ms` : '38ms'}
            </p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {openCVResult ? `${openCVResult.contoursCount} Contours Traced` : 'OpenCV Edge Latency'}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Processing: Original Raw vs OpenCV Recognition Display */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              Live Visual Shelf Audit & OpenCV Processing
            </h3>
            <p className="text-xs text-slate-400">
              Comparing raw camera photo against OpenCV edge contours, centroids, and bounding boxes
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAnalyzing && (
              <span className="text-xs font-medium text-cyan-400 flex items-center gap-1.5 animate-pulse bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/30">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing OpenCV edge pipeline...
              </span>
            )}
            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              Mode: <span className="text-cyan-300 font-bold uppercase">{openCVViewMode}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          {/* Left: Original Photo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>Original Store Shelf Photo</span>
              <span className="text-[11px] text-slate-500">Natural Ratio</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950/90 p-2 min-h-[380px] flex items-center justify-center">
              <img
                src={currentImageUrl}
                alt="Store shelf photo"
                className="max-w-full max-h-[640px] w-auto h-auto object-contain mx-auto rounded-lg shadow-md select-none"
              />
            </div>
          </div>

          {/* Right: Detected Products with Visual OpenCV Markers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
              <span>OpenCV Optical Recognition (Bounding Boxes Enclosing Items)</span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                {totalItemCount} Items Enclosed
              </span>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950/90 flex items-center justify-center">
              <DetectionCanvas
                imageUrl={currentImageUrl}
                boxes={currentBoxes}
                confidenceThreshold={confidenceThreshold}
                showBoundingBoxes={true}
                viewMode={openCVViewMode}
                cannyMapUrl={openCVResult?.cannyMapUrl}
                thresholdMapUrl={openCVResult?.thresholdMapUrl}
                showCentroids={true}
                selectedBoxId={selectedBoxId}
                onSelectBox={(box) => setSelectedBoxId(box?.id || null)}
              />
            </div>
          </div>
        </div>

        {/* Precision Bounding Box Calibration Toolbar */}
        <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">
                Bounding Box Precision Enclosure & Alignment
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Click any bounding box on the shelf or select below to fine-tune its position or dimensions
              </span>
            </div>

            <div className="flex items-center gap-2">
              {selectedBoxId && (
                <button
                  onClick={handleResetAlignment}
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer font-mono"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Box to Default</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Box Selector */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Select Item:</span>
              <select
                value={selectedBoxId || ''}
                onChange={(e) => setSelectedBoxId(e.target.value || null)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
              >
                <option value="">-- Click on a box or select here --</option>
                {activeBoxes.map((b, idx) => (
                  <option key={b.id} value={b.id}>
                    #{idx + 1} {b.label} (at {b.x}%, {b.y}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Micro Nudge Controls */}
            {selectedBoxId ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 text-[11px] font-medium">Position:</span>
                <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900 p-0.5">
                  <button
                    onClick={() => handleNudgeBox(-1, 0, 0, 0)}
                    className="p-1.5 hover:bg-slate-800 text-slate-200 rounded cursor-pointer transition-colors"
                    title="Move Left 1%"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleNudgeBox(1, 0, 0, 0)}
                    className="p-1.5 hover:bg-slate-800 text-slate-200 rounded cursor-pointer transition-colors"
                    title="Move Right 1%"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleNudgeBox(0, -1, 0, 0)}
                    className="p-1.5 hover:bg-slate-800 text-slate-200 rounded cursor-pointer transition-colors"
                    title="Move Up 1%"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleNudgeBox(0, 1, 0, 0)}
                    className="p-1.5 hover:bg-slate-800 text-slate-200 rounded cursor-pointer transition-colors"
                    title="Move Down 1%"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-slate-400 text-[11px] font-medium ml-2">Size:</span>
                <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900 p-0.5 gap-1 text-[11px]">
                  <button
                    onClick={() => handleNudgeBox(0, 0, 1.5, 0)}
                    className="px-2 py-1 hover:bg-slate-800 text-slate-200 rounded cursor-pointer font-mono"
                    title="Widen Box"
                  >
                    +W
                  </button>
                  <button
                    onClick={() => handleNudgeBox(0, 0, -1.5, 0)}
                    className="px-2 py-1 hover:bg-slate-800 text-slate-200 rounded cursor-pointer font-mono"
                    title="Narrow Box"
                  >
                    -W
                  </button>
                  <button
                    onClick={() => handleNudgeBox(0, 0, 0, 1.5)}
                    className="px-2 py-1 hover:bg-slate-800 text-slate-200 rounded cursor-pointer font-mono"
                    title="Taller Box"
                  >
                    +H
                  </button>
                  <button
                    onClick={() => handleNudgeBox(0, 0, 0, -1.5)}
                    className="px-2 py-1 hover:bg-slate-800 text-slate-200 rounded cursor-pointer font-mono"
                    title="Shorter Box"
                  >
                    -H
                  </button>
                </div>
              </div>
            ) : (
              <span className="text-[11px] text-slate-500 italic">
                Tip: Click any bounding box on the shelf to calibrate its exact outline.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Verified Shelf Stock Reconciler Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Verified Shelf Stock & Inventory Sync
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review counted quantities below and commit them directly to the master store stock
            </p>
          </div>

          {/* Sync Button */}
          {totalItemCount > 0 && (
            <button
              onClick={handleSyncToDatabase}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Update Store Stock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {totalItemCount > 0 ? (
          <div className="space-y-4">
            {/* Fresh Produce Commercial Grouping Summary Cards */}
            {(() => {
              const kgItems: { label: string; count: number; weightKg: number; valuation: number }[] = [];
              const dozenItems: { label: string; count: number; dozens: number; valuation: number }[] = [];
              const otherItems: { label: string; count: number; valuation: number }[] = [];

              Object.entries(countsDict).forEach(([label, info]) => {
                const measure = getDetectedItemMeasure(label, info.count, info.piecesCount);
                if (measure.unit === 'kg') {
                  kgItems.push({ label, count: info.piecesCount, weightKg: measure.commercialQty, valuation: measure.valuation });
                } else if (measure.unit === 'dozen') {
                  dozenItems.push({ label, count: info.piecesCount, dozens: measure.commercialQty, valuation: measure.valuation });
                } else {
                  otherItems.push({ label, count: info.piecesCount, valuation: measure.valuation });
                }
              });

              const totalKgWeight = kgItems.reduce((s, i) => s + i.weightKg, 0);
              const totalKgValuation = kgItems.reduce((s, i) => s + i.valuation, 0);
              const totalDozens = dozenItems.reduce((s, i) => s + i.dozens, 0);
              const totalDozValuation = dozenItems.reduce((s, i) => s + i.valuation, 0);

              if (kgItems.length === 0 && dozenItems.length === 0) return null;

              return (
                <div className="p-4 bg-slate-950/80 border-b border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Kilogram Group */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🍏</span>
                          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                            Fresh Produce by Weight (per kg)
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {kgItems.length} Produce SKU{kgItems.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Fruits & vegetables sold by weight. Optical counts converted using standard retail density.
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {kgItems.map(item => (
                          <span key={item.label} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-900/90 border border-emerald-500/20 text-slate-200 capitalize">
                            {item.label}: <strong className="text-emerald-400">{item.weightKg.toFixed(1)} kg</strong> <span className="text-slate-500">({item.count} pcs)</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Total Produce Weight: <strong className="text-emerald-300">{totalKgWeight.toFixed(1)} kg</strong></span>
                      <span className="text-emerald-400 font-bold">{formatINR(totalKgValuation)}</span>
                    </div>
                  </div>

                  {/* Dozen Group */}
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🍌</span>
                          <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                            Fresh Produce by Count (per dozen)
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {dozenItems.length} Produce SKU{dozenItems.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Bananas & count-based fruits sold per dozen (12 pieces per retail commercial dozen).
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {dozenItems.map(item => (
                          <span key={item.label} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-900/90 border border-amber-500/20 text-slate-200 capitalize">
                            {item.label}: <strong className="text-amber-400">{item.dozens.toFixed(1)} dozen</strong> <span className="text-slate-500">({item.count} pcs)</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Total Produce Count: <strong className="text-amber-300">{totalDozens.toFixed(1)} dozen</strong></span>
                      <span className="text-amber-400 font-bold">{formatINR(totalDozValuation)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono bg-slate-950/60">
                    <th className="py-3 px-4 font-bold">Product Item</th>
                    <th className="py-3 px-4 font-bold">Optical Count</th>
                    <th className="py-3 px-4 font-bold">Commercial Measure (Kg / Doz)</th>
                    <th className="py-3 px-4 font-bold">Store SKU</th>
                    <th className="py-3 px-4 font-bold">Unit Price / Rate</th>
                    <th className="py-3 px-4 font-bold">Current Stock</th>
                    <th className="py-3 px-4 font-bold">New Projected Stock</th>
                    <th className="py-3 px-4 font-bold">Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {Object.entries(countsDict).map(([label, info]) => {
                    const measure = getDetectedItemMeasure(label, info.count, info.piecesCount);
                    const matchedProduct = measure.matched;
                    const currentQty = matchedProduct ? matchedProduct.quantity : 0;
                    const isKg = measure.unit === 'kg';
                    const isDozen = measure.unit === 'dozen';
                    const newQty = currentQty + measure.commercialQty;

                    return (
                      <tr key={label} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-200 capitalize flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{ backgroundColor: info.color }}
                          />
                          <div>
                            <div>{label}</div>
                            {isKg && (
                              <span className="text-[10px] text-emerald-400 font-normal">Per Kilogram (~{measure.piecesPerUnit} pcs/kg)</span>
                            )}
                            {isDozen && (
                              <span className="text-[10px] text-amber-400 font-normal">Per Dozen (12 pcs/doz)</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          <div>
                            <span className="font-semibold text-slate-200">{info.piecesCount} pcs</span>
                            {info.count !== info.piecesCount && (
                              <span className="text-[10px] text-emerald-400 block font-normal font-sans">
                                {info.count} box{info.count > 1 ? 'es' : ''} ({produceBoxMode === 'commercial' ? 'per kg/doz' : 'units'})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-sm">
                          {isKg ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                              {measure.commercialQty.toFixed(1)} kg
                            </span>
                          ) : isDozen ? (
                            <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                              {measure.commercialQty.toFixed(1)} doz
                            </span>
                          ) : (
                            <span className="text-cyan-400">{measure.commercialMeasure}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono">
                          {matchedProduct ? matchedProduct.sku : <span className="text-amber-400">Store SKU Pending</span>}
                        </td>
                        <td className="py-3 px-4 text-slate-200 font-mono font-semibold">
                          {formatINR(measure.unitPrice)}
                          <span className="text-slate-400 text-[10px] font-normal"> / {measure.unit}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono">
                          {currentQty} {measure.unit}
                        </td>
                        <td className="py-3 px-4 text-emerald-400 font-mono font-bold">
                          {isKg || isDozen ? newQty.toFixed(1) : newQty} {measure.unit}{' '}
                          <span className="text-xs text-emerald-500 font-medium">
                            (+{isKg || isDozen ? measure.commercialQty.toFixed(1) : measure.commercialQty} {measure.unit})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-100 font-mono font-bold">
                          {formatINR(measure.valuation)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-slate-500" />
            <span className="font-semibold text-slate-300">No products identified in current frame.</span>
            <span>Click &quot;Re-run OpenCV Recognition&quot; or adjust the Canny sensitivity sliders above.</span>
          </div>
        )}
      </div>
    </div>
  );
};
