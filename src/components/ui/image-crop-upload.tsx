'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, X, Image as ImageIcon, Crop as CropIcon, RotateCw, FlipHorizontal, Download } from 'lucide-react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropUploadProps {
    onFileSelect: (file: File | null, croppedImage?: string) => void;
    currentImage?: string;
    accept?: string;
    maxSize?: number; // in MB
    disabled?: boolean;
    aspectRatio?: number;
    cropShape?: 'rect' | 'round';
    allowCrop?: boolean;
    allowRotate?: boolean;
    allowFlip?: boolean;
}

// Helper function to create image
function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', error => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });
}

// Helper function to get cropped canvas
async function getCroppedImg(
    imageSrc: string,
    pixelCrop: PixelCrop,
    rotation = 0,
    flip = { horizontal: false, vertical: false }
): Promise<{ canvas: HTMLCanvasElement; blob: Blob }> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    const rotRad = (rotation * Math.PI) / 180;

    // Calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    );

    // Set canvas size to match the bounding box
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // Translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);

    // Draw rotated image
    ctx.drawImage(image, 0, 0);

    // Create cropped canvas
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');

    if (!croppedCtx) {
        throw new Error('No 2d context');
    }

    croppedCanvas.width = pixelCrop.width;
    croppedCanvas.height = pixelCrop.height;

    croppedCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        croppedCanvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            resolve({ canvas: croppedCanvas, blob });
        }, 'image/jpeg', 0.9);
    });
}

function rotateSize(width: number, height: number, rotation: number) {
    const rotRad = (rotation * Math.PI) / 180;
    return {
        width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
}

export function ImageCropUpload({
    onFileSelect,
    currentImage,
    accept = "image/*",
    maxSize = 5,
    disabled = false,
    aspectRatio,
    cropShape = 'rect',
    allowCrop = true,
    allowRotate = false,
    allowFlip = false
}: ImageCropUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [isDragging, setIsDragging] = useState(false);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [originalImageSrc, setOriginalImageSrc] = useState<string>('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [rotation, setRotation] = useState(0);
    const [flip, setFlip] = useState({ horizontal: false, vertical: false });
    const [scale, setScale] = useState(1);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const onSelectFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            if (file.size > maxSize * 1024 * 1024) {
                alert(`File size must be less than ${maxSize}MB`);
                return;
            }

            setSelectedFile(file);
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                const imageUrl = reader.result?.toString() || '';
                setOriginalImageSrc(imageUrl);

                if (allowCrop) {
                    setIsCropModalOpen(true);
                } else {
                    setPreview(imageUrl);
                    onFileSelect(file, imageUrl);
                }
            });
            reader.readAsDataURL(file);
        }
    }, [maxSize, allowCrop, onFileSelect]);

    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        if (aspectRatio) {
            const { width, height } = e.currentTarget;
            const crop = centerCrop(
                makeAspectCrop(
                    {
                        unit: '%',
                        width: 90,
                    },
                    aspectRatio,
                    width,
                    height,
                ),
                width,
                height,
            );
            setCrop(crop);
        }
    }, [aspectRatio]);

    const handleCropComplete = useCallback(async () => {
        if (completedCrop && imgRef.current && originalImageSrc) {
            try {
                const { canvas, blob } = await getCroppedImg(
                    originalImageSrc,
                    completedCrop,
                    rotation,
                    flip
                );

                const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
                setPreview(croppedImageUrl);

                // Create a new file from the cropped image
                const croppedFile = new File([blob], selectedFile?.name || 'cropped-image.jpg', {
                    type: 'image/jpeg'
                });

                onFileSelect(croppedFile, croppedImageUrl);
                setIsCropModalOpen(false);
            } catch (error) {
                console.error('Error cropping image:', error);
            }
        }
    }, [completedCrop, originalImageSrc, rotation, flip, selectedFile, onFileSelect]);

    const downloadCroppedImage = useCallback(async () => {
        if (completedCrop && imgRef.current && originalImageSrc) {
            try {
                const { canvas } = await getCroppedImg(
                    originalImageSrc,
                    completedCrop,
                    rotation,
                    flip
                );

                const link = document.createElement('a');
                link.download = 'cropped-image.jpg';
                link.href = canvas.toDataURL('image/jpeg', 0.9);
                link.click();
            } catch (error) {
                console.error('Error downloading cropped image:', error);
            }
        }
    }, [completedCrop, originalImageSrc, rotation, flip]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.size > maxSize * 1024 * 1024) {
                alert(`File size must be less than ${maxSize}MB`);
                return;
            }

            setSelectedFile(file);
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                const imageUrl = reader.result?.toString() || '';
                setOriginalImageSrc(imageUrl);

                if (allowCrop) {
                    setIsCropModalOpen(true);
                } else {
                    setPreview(imageUrl);
                    onFileSelect(file, imageUrl);
                }
            });
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const removeImage = () => {
        setPreview(null);
        setOriginalImageSrc('');
        setSelectedFile(null);
        onFileSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const openFileDialog = () => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="space-y-4">
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={onSelectFile}
                className="hidden"
                disabled={disabled}
            />

            {preview ? (
                <div className="relative inline-block">
                    <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-contain"
                        />
                        {!disabled && (
                            <button
                                onClick={removeImage}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                type="button"
                                aria-label="Remove image"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                    {allowCrop && preview && !disabled && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (originalImageSrc || preview) {
                                    setOriginalImageSrc(preview);
                                    setIsCropModalOpen(true);
                                }
                            }}
                            className="mt-2 w-full"
                        >
                            <CropIcon className="h-4 w-4 mr-2" />
                            Edit Image
                        </Button>
                    )}
                </div>
            ) : (
                <div
                    className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
          `}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={openFileDialog}
                >
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                        {isDragging ? 'Drop your image here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to {maxSize}MB
                    </p>
                    {allowCrop && (
                        <p className="text-xs text-blue-500 mt-1">
                            Cropping and editing available after upload
                        </p>
                    )}
                </div>
            )}

            {!disabled && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openFileDialog}
                    className="w-full"
                >
                    <Upload className="h-4 w-4 mr-2" />
                    {preview ? 'Change Image' : 'Upload Image'}
                </Button>
            )}

            {/* Crop Modal */}
            <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CropIcon className="h-5 w-5" />
                            Crop & Edit Image
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {originalImageSrc && (
                            <div className="flex flex-col items-center space-y-4">
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={aspectRatio}
                                    circularCrop={cropShape === 'round'}
                                    className="max-w-full"
                                >
                                    <img
                                        ref={imgRef}
                                        alt="Crop preview"
                                        src={originalImageSrc}
                                        style={{
                                            transform: `scale(${scale}) rotate(${rotation}deg)`,
                                            maxHeight: '400px',
                                            maxWidth: '100%'
                                        }}
                                        onLoad={onImageLoad}
                                    />
                                </ReactCrop>

                                {/* Controls */}
                                <div className="flex flex-wrap gap-3 justify-center">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium">Scale:</label>
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="3"
                                            step="0.1"
                                            value={scale}
                                            onChange={(e) => setScale(Number(e.target.value))}
                                            className="w-20"
                                        />
                                        <span className="text-sm">{scale.toFixed(1)}x</span>
                                    </div>

                                    {allowRotate && (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setRotation(prev => prev + 90)}
                                            >
                                                <RotateCw className="h-4 w-4" />
                                            </Button>
                                            <span className="text-sm">{rotation}°</span>
                                        </div>
                                    )}

                                    {allowFlip && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setFlip(prev => ({ ...prev, horizontal: !prev.horizontal }))}
                                        >
                                            <FlipHorizontal className="h-4 w-4" />
                                            Flip H
                                        </Button>
                                    )}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={downloadCroppedImage}
                                        disabled={!completedCrop}
                                    >
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCropModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleCropComplete}
                                disabled={!completedCrop}
                            >
                                Apply Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 