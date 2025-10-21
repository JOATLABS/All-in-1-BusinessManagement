import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { config } from '../config/api';
import { useAuth } from '../auth/AuthContext';
import type { MediaType } from '../types/content';
import '../styles/components/upload-modal-mobile.css';

const DEFAULT_ALLOWED_TYPES: MediaType[] = ['image', 'video'];

const MIME_TYPES_BY_KIND: Record<MediaType, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif', 'image/heic', 'image/heif'],
  video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'],
  model: ['model/gltf-binary', 'model/gltf+json', 'model/gltf']
};

const ACCEPT_PATTERNS_BY_KIND: Record<MediaType, string[]> = {
  image: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif', '.heic', '.heif', 'image/*'],
  video: ['.mp4', '.webm', '.mov', '.m4v', 'video/*'],
  model: ['.glb', '.gltf', '.gbl', 'model/gltf-binary']
};

const MODEL_FILE_EXTENSIONS = ['.glb', '.gltf', '.gbl'];

const mediaTypeErrorMessage =
  'Invalid file type. Only common image formats (JPEG, PNG, WebP, GIF, SVG, AVIF, HEIC), videos (MP4, WebM, MOV, M4V), and 3D ' +
  'models (GLB/GLTF) are allowed.';

const describeMediaType = (kind: MediaType): string => {
  if (kind === 'model') {
    return '3D model';
  }

  if (kind === 'video') {
    return 'Video';
  }

  return 'Image';
};

export type UploadedMedia = {
  url: string;
  key: string;
  mediaType: MediaType;
  mimetype: string;
  size: number;
  folder: string;
  originalFilename: string;
  thumbnailUrl?: string;
};

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (media: UploadedMedia) => void;
  folder?: 'backgrounds' | 'events' | 'posters' | 'general';
  allowedTypes?: MediaType[];
}

interface UploadResponse {
  message: string;
  media: UploadedMedia;
}

/**
 * Media Upload Modal Component
 * Mobile-friendly file upload with drag-and-drop
 * Uploads directly to Cloudflare R2
 */
export const MediaUploadModal = ({
  isOpen,
  onClose,
  onUploadSuccess,
  folder = 'backgrounds',
  allowedTypes
}: MediaUploadModalProps) => {
  const { token } = useAuth();
  const allowedKinds = useMemo<MediaType[]>(() => {
    const values = allowedTypes?.length ? allowedTypes : DEFAULT_ALLOWED_TYPES;
    const unique = Array.from(new Set(values));
    return (unique.length ? unique : DEFAULT_ALLOWED_TYPES) as MediaType[];
  }, [allowedTypes]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedKind, setSelectedKind] = useState<MediaType>(allowedKinds[0]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!allowedKinds.includes(selectedKind)) {
      setSelectedKind(allowedKinds[0]);
    }
  }, [allowedKinds, selectedKind]);

  const allowedMimeTypes = useMemo(() => allowedKinds.flatMap((kind) => MIME_TYPES_BY_KIND[kind]), [allowedKinds]);
  const acceptAttribute = useMemo(
    () => allowedKinds.flatMap((kind) => ACCEPT_PATTERNS_BY_KIND[kind]).join(','),
    [allowedKinds]
  );
  const hintLines = useMemo(() => {
    const lines = allowedKinds.map((kind) => {
      if (kind === 'image') {
        return 'Images: JPEG, PNG, WebP, GIF, SVG, AVIF, HEIC';
      }

      if (kind === 'video') {
        return 'Videos: MP4, WebM, MOV, M4V';
      }

      return '3D: GLB (binary GLTF) or GLTF';
    });

    lines.push('Max 50MB per file');

    return lines;
  }, [allowedKinds]);

  const determineKind = (file: File): MediaType => {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();

    if (type.startsWith('video/')) {
      return 'video';
    }

    if (type.startsWith('image/')) {
      return 'image';
    }

    if (type.startsWith('model/')) {
      return 'model';
    }

    if (MODEL_FILE_EXTENSIONS.some((ext) => name.endsWith(ext))) {
      return 'model';
    }

    return 'image';
  };

  const resetSelection = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedKind(allowedKinds[0]);
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = (file: File) => {
    const kind = determineKind(file);

    if (!allowedKinds.includes(kind)) {
      setError(mediaTypeErrorMessage);
      return;
    }

    if (kind === 'model') {
      const lowerName = file.name.toLowerCase();
      const hasValidExtension = MODEL_FILE_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
      if (!hasValidExtension) {
        setError('3D models must use the .glb or .gltf extension.');
        return;
      }
    } else if (!allowedMimeTypes.includes(file.type)) {
      setError(mediaTypeErrorMessage);
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 50MB.');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setSelectedKind(kind);
    setError(null);

    if (kind === 'image' || kind === 'video') {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  };

  /**
   * Handle file input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Handle drag and drop
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Upload file to R2
   */
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Check auth token
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('folder', folder);

      // Upload to R2
      const response = await fetch(`${config.apiBaseUrl}/api/v1/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data: UploadResponse = await response.json();

      // Create BackgroundImage object
      const newBackground: BackgroundImage = {
        src: data.media.url,
        alt: selectedFile.name,
        mediaType: data.media.mediaType,
        isActive: true,
        playbackDepth: 'medium',
        focalPoint: { x: 50, y: 50 },
        order: 0,
        fallbackImage: data.media.thumbnailUrl
      };

      // Handle video-specific settings
      if (data.media.mediaType === 'video') {
        newBackground.loop = true;
        newBackground.autoplay = true;
        newBackground.muted = true;
      }

      setProgress(100);

      onUploadSuccess(data.media);

      setTimeout(() => {
        handleClose();
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Clean up and close
   */
  const handleClose = () => {
    resetSelection();
    setError(null);
    setProgress(0);
    setUploading(false);
    setIsDragging(false);
    onClose();
  };

  /**
   * Open file picker
   */
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  // Use Portal to render modal at document root level, breaking out of parent stacking context
  return createPortal(
    <div className="upload-modal-mobile" onClick={handleClose}>
      <div className="upload-modal-mobile__panel" onClick={(e) => e.stopPropagation()}>
        <header className="upload-modal-mobile__header">
          <div className="upload-modal-mobile__handle"></div>
          <h2 className="upload-modal-mobile__title">Upload Media</h2>
          <p className="upload-modal-mobile__subtitle">Upload to {folder}/ folder</p>
        </header>

        <div className="upload-modal-mobile__body">
          {/* File Select Button (NO drag-drop text on mobile) */}
          {!selectedFile && (
          <button
            type="button"
            className={`upload-file-button ${isDragging ? 'upload-file-button--dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
          >
            <div className="upload-file-button__icon">📤</div>
            <p className="upload-file-button__text">Tap to select file</p>
            <p className="upload-file-button__hint">
              {hintLines.map((line, index) => (
                <span key={`${line}-${index}`}>
                  {line}
                  {index < hintLines.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
          </button>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptAttribute}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        {/* Preview (shows BELOW button) */}
        {selectedFile && (
          <div className="upload-preview-mobile">
            <div className="upload-preview-mobile__thumbnail">
              {selectedKind === 'video' && previewUrl ? (
                <video
                  src={previewUrl}
                  controls
                  muted
                  className="upload-preview-mobile__video"
                />
              ) : selectedKind === 'image' && previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="upload-preview-mobile__image"
                />
              ) : (
                <div className="upload-preview-mobile__model-hint" aria-hidden="true">
                  <span className="upload-preview-mobile__model-icon" role="img" aria-hidden="true">
                    🧊
                  </span>
                  <p>3D preview available after upload.</p>
                </div>
              )}
            </div>

            <div className="upload-preview-mobile__info">
              <div className="upload-preview-mobile__details">
                <p className="upload-preview-mobile__filename">
                  {selectedFile.name}
                </p>
                <p className="upload-preview-mobile__meta">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {describeMediaType(selectedKind)}
                </p>
              </div>

              {!uploading && (
                <button
                  type="button"
                  className="btn btn--secondary"
                  style={{ minHeight: '44px', padding: '0 1rem' }}
                  onClick={resetSelection}
                >
                  Change
                </button>
              )}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {uploading && (
          <div className="upload-progress-mobile">
            <div className="upload-progress-mobile__bar">
              <div
                className="upload-progress-mobile__fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="upload-progress-mobile__text">
              Uploading... {progress}%
            </p>
          </div>
        )}

          {/* Error Message */}
          {error && (
            <div className="upload-alert-mobile" role="alert">
              <span className="upload-alert-mobile__icon">⚠️</span>
              <p className="upload-alert-mobile__message">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <footer className="upload-modal-mobile__footer">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload to R2'}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
};
