
import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Scissors, ZoomIn, RotateCcw, Check, X, Sparkles, Box } from 'lucide-react'
import getCroppedImg from '@/lib/image-utils'

interface ImageCropperProps {
    image: string
    open: boolean
    onClose: () => void
    onCropComplete: (croppedImage: Blob) => Promise<void> | void
    onSkip: () => void
}

const ImageCropper: React.FC<ImageCropperProps> = ({ image, open, onClose, onCropComplete, onSkip }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop)
    }

    const onZoomChange = (zoom: number) => {
        setZoom(zoom)
    }

    const onRotationChange = (rotation: number) => {
        setRotation(rotation)
    }

    const onCropCompleteCallback = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleCrop = async () => {
        if (!croppedAreaPixels || isProcessing) return;
        setIsProcessing(true);
        try {
            console.log("Starting crop process...");
            const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation)
            if (croppedImage) {
                console.log("Crop successful, calling completion...");
                await onCropComplete(croppedImage)
            } else {
                throw new Error("فشل توليد الصورة المقصوصة");
            }
        } catch (e: any) {
            console.error("Crop/Upload error:", e);
            alert("حدث خطأ أثناء معالجة الصورة: " + e.message);
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-white rounded-3xl p-0 overflow-hidden font-tajawal rtl max-h-[95vh] flex flex-col" dir="rtl">
                <DialogHeader className="p-6 bg-primary text-white flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-secondary p-2 rounded-xl">
                            <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black">إطار الاستوديو الاحترافي</DialogTitle>
                            <p className="text-white/60 text-sm font-bold mt-1">اضبط الصورة لتحصل على زاوية مثالية وفخامة استثنائية</p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
                    {/* Main Cropper Area */}
                    <div className="flex-grow relative bg-[#0a0a0a] p-8 flex items-center justify-center overflow-hidden">
                        {/* Studio Guidelines Overlay */}
                        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                            {/* Safe Zone indicator */}
                            <div className="w-[350px] h-[350px] border border-white/20 rounded-lg flex items-center justify-center">
                                <div className="absolute inset-0 border border-white/5" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '10% 10%' }} />
                                <div className="w-4 h-4 border-t border-l border-secondary" />
                                <div className="absolute right-0 top-0 w-4 h-4 border-t border-r border-secondary" />
                                <div className="absolute left-0 bottom-0 w-4 h-4 border-b border-l border-secondary" />
                                <div className="absolute right-0 bottom-0 w-4 h-4 border-b border-r border-secondary" />
                            </div>

                            {/* Center Crosshair */}
                            <div className="absolute w-8 h-[1px] bg-secondary/50" />
                            <div className="absolute h-8 w-[1px] bg-secondary/50" />
                        </div>

                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                            <Cropper
                                image={image}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropCompleteCallback}
                                onZoomChange={setZoom}
                                onRotationChange={setRotation}
                                showGrid={true}
                                classes={{
                                    containerClassName: 'bg-[#111]',
                                    mediaClassName: 'opacity-90',
                                    cropAreaClassName: 'border-2 border-secondary shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]'
                                }}
                            />
                        </div>

                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                            <p className="text-white text-[10px] font-bold tracking-[0.2em] uppercase">Makers Studio • Precision View</p>
                        </div>
                    </div>

                    {/* Controls Panel */}
                    <div className="w-full md:w-80 bg-white border-r border-gray-100 p-8 flex flex-col items-center gap-8 overflow-y-auto">
                        <div className="w-full space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-primary font-black text-sm flex items-center gap-2">
                                        <ZoomIn className="h-4 w-4" /> زووم العدسة
                                    </span>
                                    <span className="text-xs font-bold text-secondary">{zoom.toFixed(1)}x</span>
                                </div>
                                <Slider
                                    value={[zoom]}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onValueChange={(val) => setZoom(val[0])}
                                    className="cursor-pointer"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-primary font-black text-sm flex items-center gap-2">
                                        <RotateCcw className="h-4 w-4" /> ضبط الميل
                                    </span>
                                    <span className="text-xs font-bold text-secondary">{rotation}°</span>
                                </div>
                                <Slider
                                    value={[rotation]}
                                    min={0}
                                    max={360}
                                    step={1}
                                    onValueChange={(val) => setRotation(val[0])}
                                    className="cursor-pointer"
                                />
                            </div>
                        </div>

                        <div className="w-full h-px bg-gray-100" />

                        {/* Quality Checklist */}
                        <div className="w-full space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">قائمة فحص الجودة الاحترافية</h4>
                            <div className="space-y-2">
                                {[
                                    "المنتج متمركز تماماً",
                                    "إضاءة بيضاء متوازنة",
                                    "خلفية استوديو نظيفة",
                                    "لا يوجد ميل أو انحراف"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="h-4 w-4 rounded-full bg-secondary/10 flex items-center justify-center">
                                            <Check className="h-2 w-2 text-primary" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-600">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-full space-y-3 mt-auto pt-8">
                            <Button
                                onClick={handleCrop}
                                disabled={isProcessing || !croppedAreaPixels}
                                className="w-full rounded-2xl h-14 bg-primary hover:bg-black text-white text-lg font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
                            >
                                {isProcessing ? (
                                    <>
                                        <span>جاري الرفع...</span>
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    </>
                                ) : (
                                    <>
                                        <span>اعتماد وحفظ الصورة</span>
                                        <Scissors className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={onSkip}
                                disabled={isProcessing}
                                className="w-full rounded-xl h-10 text-xs font-bold border-dashed border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2"
                            >
                                <Box className="h-3 w-3" />
                                حفظ الصورة الأصلية بدون قص (سريع)
                            </Button>

                            <Button variant="ghost" onClick={onClose} disabled={isProcessing} className="w-full rounded-xl h-10 text-gray-400 font-bold hover:text-red-500 hover:bg-red-50">
                                إلغاء
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <label className={`text-sm tracking-wide ${className}`}>{children}</label>
)

export default ImageCropper
