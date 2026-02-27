
export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => {
            console.error("Image load error:", error);
            reject(new Error("فشل تحميل الصورة للمعالجة"));
        });
        if (!url.startsWith('data:')) {
            image.setAttribute('crossOrigin', 'anonymous');
        }
        image.src = url;
        // Add timeout to avoid hanging
        setTimeout(() => reject(new Error("انتهت مهلة تحميل الصورة")), 10000);
    });

export function getRadianAngle(degreeValue: number) {
    return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
    const rotRad = getRadianAngle(rotation);

    return {
        width:
            Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height:
            Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
}

/**
 * This function was adapted from the one in the react-easy-crop project
 */
export default async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    rotation = 0
): Promise<Blob | null> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return null;
    }

    const rotRad = getRadianAngle(rotation);

    // calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    );

    // set canvas size to match the bounding box
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // translate canvas context to a central point to allow rotating around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);

    // draw rotated image
    ctx.drawImage(image, 0, 0);

    // Create a NEW canvas for the crop
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');

    if (!cropCtx) return null;

    // Sanitize values to be safe for getImageData/drawImage
    const safeX = Math.floor(pixelCrop.x || 0);
    const safeY = Math.floor(pixelCrop.y || 0);
    const safeWidth = Math.floor(pixelCrop.width || 1);
    const safeHeight = Math.floor(pixelCrop.height || 1);

    cropCanvas.width = safeWidth;
    cropCanvas.height = safeHeight;

    // Draw the cropped area to the new canvas
    cropCtx.drawImage(
        canvas,
        safeX,
        safeY,
        safeWidth,
        safeHeight,
        0,
        0,
        safeWidth,
        safeHeight
    );

    // Final optimization: Resize if too large but keep quality
    const maxDim = 1200;
    if (safeWidth > maxDim || safeHeight > maxDim) {
        const scale = maxDim / Math.max(safeWidth, safeHeight);
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = safeWidth * scale;
        finalCanvas.height = safeHeight * scale;
        const finalCtx = finalCanvas.getContext('2d');
        if (finalCtx) {
            finalCtx.imageSmoothingEnabled = true;
            finalCtx.imageSmoothingQuality = 'high';
            finalCtx.drawImage(cropCanvas, 0, 0, finalCanvas.width, finalCanvas.height);
            return new Promise((resolve) => {
                finalCanvas.toBlob((blob) => resolve(blob), 'image/webp', 0.85);
            });
        }
    }

    // Return the blob from the cropped canvas
    return new Promise((resolve) => {
        cropCanvas.toBlob((file) => {
            resolve(file);
        }, 'image/webp', 0.85);
    });
}
