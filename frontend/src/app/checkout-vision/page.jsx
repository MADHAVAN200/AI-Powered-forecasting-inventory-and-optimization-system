"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Camera, Loader2, ScanSearch, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { checkoutVisionService } from '@/services/checkoutVisionService';

const DEFAULT_SAMPLE_IMAGE = '/checkout-vision/multiproduct.png';

function formatPercent(value) {
    return `${(Number(value || 0) * 100).toFixed(2)}%`;
}

export default function CheckoutVisionPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [result, setResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [isLoadingSample, setIsLoadingSample] = useState(true);

    const totalDetections = result?.detections?.length || 0;
    const topLabel = useMemo(() => {
        if (!result?.item_counts?.length) return 'No detections yet';
        return result.item_counts[0][0];
    }, [result]);

    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    useEffect(() => {
        let isMounted = true;

        async function loadDefaultSample() {
            try {
                const response = await fetch(DEFAULT_SAMPLE_IMAGE);
                const blob = await response.blob();
                const defaultFile = new File([blob], 'multiproduct.png', { type: blob.type || 'image/png' });

                if (!isMounted) return;

                setSelectedFile(defaultFile);
                setPreviewUrl(DEFAULT_SAMPLE_IMAGE);
                setError('');
            } catch (err) {
                if (!isMounted) return;
                setError('Could not load the default checkout sample image.');
            } finally {
                if (isMounted) {
                    setIsLoadingSample(false);
                }
            }
        }

        loadDefaultSample();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!selectedFile || isLoadingSample || result || isAnalyzing) return;

        const shouldAnalyzeDefaultSample =
            selectedFile.name === 'multiproduct.png' && previewUrl === DEFAULT_SAMPLE_IMAGE;

        if (!shouldAnalyzeDefaultSample) return;

        handleAnalyze();
        // Intentionally responds only to the default sample becoming ready.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFile, isLoadingSample, previewUrl, result, isAnalyzing]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(file || null);
        setResult(null);
        setError('');
        setPreviewUrl(file ? URL.createObjectURL(file) : DEFAULT_SAMPLE_IMAGE);
    };

    const handleAnalyze = async () => {
        if (!selectedFile) {
            setError('Select an image before running checkout vision.');
            return;
        }

        setIsAnalyzing(true);
        setError('');

        try {
            const data = await checkoutVisionService.analyzeImage(selectedFile);
            setResult(data);
        } catch (err) {
            setError(err.message || 'Checkout vision analysis failed.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] px-6 py-8 text-white">
            <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-6">
                <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.15),transparent_30%),linear-gradient(135deg,rgba(18,18,18,0.96),rgba(8,8,8,0.98))] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
                                <Camera className="h-3.5 w-3.5" />
                                Checkout Vision
                            </div>
                            <h1 className="text-3xl font-semibold tracking-tight">Verify lane items from a single shelf or checkout image</h1>
                            <p className="max-w-3xl text-sm text-slate-400">
                                Upload a lane capture, run multimodal classification, and review the annotated image, SKU counts, and OCR evidence inside the operations workspace.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <Card className="border-white/10 bg-white/[0.04]">
                                <CardContent className="p-4">
                                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Detections</div>
                                    <div className="mt-2 text-2xl font-semibold text-white">{totalDetections}</div>
                                </CardContent>
                            </Card>
                            <Card className="border-white/10 bg-white/[0.04]">
                                <CardContent className="p-4">
                                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Top Match</div>
                                    <div className="mt-2 text-sm font-medium text-white">{topLabel}</div>
                                </CardContent>
                            </Card>
                            <Card className="border-white/10 bg-white/[0.04]">
                                <CardContent className="p-4">
                                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</div>
                                    <div className="mt-2 text-sm font-medium text-emerald-300">
                                        {isAnalyzing ? 'Running inference' : result ? 'Analysis complete' : 'Ready for upload'}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1.4fr_220px]">
                        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                            <label className="mb-3 block text-sm font-medium text-slate-300" htmlFor="checkout-image">
                                Inference image
                            </label>
                            <div className="flex flex-col gap-3 md:flex-row">
                                <Input
                                    id="checkout-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="border-white/10 bg-white/[0.05] text-white file:mr-4 file:rounded-full file:border-0 file:bg-amber-500/20 file:px-4 file:py-2 file:text-sm file:font-medium file:text-amber-100 hover:file:bg-amber-500/30"
                                />
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing || isLoadingSample || !selectedFile}
                                    className="min-w-[180px] bg-amber-600 text-white hover:bg-amber-500"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Running
                                        </>
                                    ) : isLoadingSample ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading sample
                                        </>
                                    ) : (
                                        <>
                                            <ScanSearch className="mr-2 h-4 w-4" />
                                            Run Analysis
                                        </>
                                    )}
                                </Button>
                            </div>
                            {selectedFile && (
                                <p className="mt-3 text-sm text-slate-400">
                                    Selected: <span className="text-slate-200">{selectedFile.name}</span>
                                </p>
                            )}
                            {!selectedFile && !isLoadingSample && (
                                <p className="mt-3 text-sm text-slate-500">
                                    The default sample could not be loaded. You can still upload an image manually.
                                </p>
                            )}
                            {error && (
                                <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>

                        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                                <Upload className="h-4 w-4 text-amber-300" />
                                Preview
                            </div>
                            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Selected checkout preview" className="h-48 w-full object-cover" />
                                ) : (
                                    <div className="flex h-48 items-center justify-center px-4 text-center text-sm text-slate-500">
                                        Add a shelf or checkout image to preview it here.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.8fr_0.95fr]">
                    <Card className="border-white/10 bg-[#0d0d0d]">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-white/10">
                            <div>
                                <CardTitle className="text-2xl text-white">Annotated Checkout Image</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Bounding boxes and predicted labels from the multimodal classifier.
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="border-amber-400/30 bg-amber-500/10 text-amber-200">
                                {result?.image_name || 'Awaiting analysis'}
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-6">
                            {result?.annotated_base64 ? (
                                <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black p-3">
                                    <img src={result.annotated_base64} alt="Annotated checkout" className="w-full rounded-[22px] object-contain" />
                                </div>
                            ) : (
                                <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] text-center text-sm text-slate-500">
                                    Run an analysis to render the annotated checkout image here.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-white/10 bg-[#0d0d0d]">
                        <CardHeader className="border-b border-white/10">
                            <CardTitle className="text-2xl text-white">Generated List</CardTitle>
                            <CardDescription className="text-slate-400">
                                Consolidated item counts from the current lane image.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 p-6">
                            {result?.item_counts?.length ? (
                                result.item_counts.map(([label, count]) => (
                                    <div key={`${label}-${count}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                                        <span className="max-w-[80%] text-sm text-slate-100">{label}</span>
                                        <span className="rounded-full bg-amber-200 px-3 py-1 text-sm font-semibold text-amber-950">{count}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-slate-500">
                                    No detected items yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-white/10 bg-[#0d0d0d]">
                    <CardHeader className="border-b border-white/10">
                        <CardTitle className="text-2xl text-white">Detection Evidence</CardTitle>
                        <CardDescription className="text-slate-400">
                            Product crops, confidence scores, and OCR output for each detected item.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        {result?.detections?.length ? (
                            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                                {result.detections.map((item, index) => (
                                    <article key={`${item.prediction?.label || 'item'}-${index}`} className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]">
                                        <img src={item.crop_base64} alt={`Detection ${index + 1}`} className="h-56 w-full bg-black object-contain p-3" />
                                        <div className="space-y-3 p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">{item.prediction?.label}</h3>
                                                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                                                        Confidence {formatPercent(item.prediction?.confidence)}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="border-emerald-400/20 bg-emerald-500/10 text-emerald-200">
                                                    #{index + 1}
                                                </Badge>
                                            </div>
                                            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                                                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">OCR text</div>
                                                <p className="mt-2 text-sm leading-6 text-slate-200">
                                                    {item.ocr_text || 'No OCR text extracted.'}
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-12 text-center text-sm text-slate-500">
                                Detection cards will appear here after a successful analysis run.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
