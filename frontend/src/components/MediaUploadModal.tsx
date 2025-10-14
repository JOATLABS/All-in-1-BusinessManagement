import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { config } from '../config/api';
import { useAuth } from '../auth/AuthContext';
import type { BackgroundImage, BackgroundMediaType } from '../types/content';
import '../styles/components/upload-modal-mobile.css';

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (media: BackgroundImage) => void;
  folder?: 'backgrounds' | 'events' | 'posters' | 'general';
}

interface UploadResponse {
  message: string;
  media: {
    url: string;
    key: string;
    mediaType: BackgroundMediaType;
    mimetype: string;
    size: number;
    folder: string;
    originalFilename: string;
  };
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
  folder = 'backgrounds'
}: MediaUploadModalProps) => {
  const { token } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM) are allowed.');
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 50MB.');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
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
        order: 0
      };

      // Handle video-specific settings
      if (data.media.mediaType === 'video') {
        newBackground.loop = true;
        newBackground.autoplay = true;
        newBackground.muted = true;
      }

      setProgress(100);

      // Call success callback
      onUploadSuccess(newBackground);

      // Close modal after short delay
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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setProgress(0);
    setUploading(false);
    onClose();
  };

  /**
   * Open file picker
   */
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const mediaType = selectedFile?.type.startsWith('video/') ? 'video' : 'image';

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
              Images: JPEG, PNG, WebP, GIF<br/>
              Videos: MP4, WebM • Max 50MB
            </p>
          </button>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />

        {/* Preview (shows BELOW button) */}
        {selectedFile && previewUrl && (
          <div className="upload-preview-mobile">
            <div className="upload-preview-mobile__thumbnail">
              {mediaType === 'video' ? (
                <video
                  src={previewUrl}
                  controls
                  muted
                  className="upload-preview-mobile__video"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="upload-preview-mobile__image"
                />
              )}
            </div>

            <div className="upload-preview-mobile__info">
              <div className="upload-preview-mobile__details">
                <p className="upload-preview-mobile__filename">
                  {selectedFile.name}
                </p>
                <p className="upload-preview-mobile__meta">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                </p>
              </div>

              {!uploading && (
                <button
                  type="button"
                  className="btn btn--secondary"
                  style={{ minHeight: '44px', padding: '0 1rem' }}
                  onClick={() => {
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
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
