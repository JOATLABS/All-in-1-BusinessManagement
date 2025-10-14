import { useState } from 'react';
import type { BackgroundImage, PlaybackDepth } from '../types/content';
import { MediaUploadModal } from './MediaUploadModal';
import { MediaLibraryModal } from './MediaLibraryModal';

interface BackgroundMediaManagerProps {
  backgrounds: BackgroundImage[];
  onChange: (backgrounds: BackgroundImage[]) => void;
}

/**
 * Background Media Manager Component
 * Mobile-friendly, accessible media management with drag-and-drop
 * Following 2025 UX best practices
 */
export const BackgroundMediaManager = ({ backgrounds, onChange }: BackgroundMediaManagerProps) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  /**
   * Toggle background active/inactive
   */
  const handleToggleActive = (index: number) => {
    const updated = [...backgrounds];
    updated[index] = {
      ...updated[index],
      isActive: !updated[index].isActive
    };
    onChange(updated);
  };

  /**
   * Update playback depth
   */
  const handleDepthChange = (index: number, depth: PlaybackDepth) => {
    const updated = [...backgrounds];
    updated[index] = {
      ...updated[index],
      playbackDepth: depth
    };
    onChange(updated);
  };

  /**
   * Delete background
   */
  const handleDelete = (index: number) => {
    const updated = backgrounds.filter((_, i) => i !== index);
    onChange(updated);
  };

  /**
   * Move background up (mobile-friendly alternative to drag-and-drop)
   */
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...backgrounds];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated);
  };

  /**
   * Move background down (mobile-friendly alternative to drag-and-drop)
   */
  const handleMoveDown = (index: number) => {
    if (index === backgrounds.length - 1) return;
    const updated = [...backgrounds];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
  };

  /**
   * Drag and drop handlers for desktop
   */
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...backgrounds];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);

    onChange(updated);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  /**
   * Add new background from URL
   */
  const handleAddBackground = () => {
    const newBackground: BackgroundImage = {
      src: '',
      alt: '',
      mediaType: 'image',
      isActive: true,
      playbackDepth: 'medium',
      order: backgrounds.length,
      focalPoint: { x: 50, y: 50 }
    };
    onChange([...backgrounds, newBackground]);
  };

  return (
    <div className="bg-media-manager">
      <div className="bg-media-manager__header">
        <h3>Background Gallery</h3>
        <div className="bg-media-manager__actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setLibraryModalOpen(true)}
          >
            📁 Browse Library
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setUploadModalOpen(true)}
          >
            📤 Upload New
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handleAddBackground}
          >
            ➕ Add URL
          </button>
        </div>
      </div>

      {backgrounds.length === 0 ? (
        <div className="bg-media-manager__empty">
          <p>No background media yet. Add images or videos to create your hero background.</p>
        </div>
      ) : (
        <div className="bg-media-manager__grid">
          {backgrounds.map((background, index) => (
            <div
              key={`bg-${index}`}
              className={`bg-media-card ${!background.isActive ? 'bg-media-card--inactive' : ''} ${
                draggedIndex === index ? 'bg-media-card--dragging' : ''
              }`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              {/* Drag Handle - Desktop */}
              <div className="bg-media-card__drag-handle" title="Drag to reorder">
                <span>⠿</span>
              </div>

              {/* Preview */}
              <div className="bg-media-card__preview">
                {background.src ? (
                  background.mediaType === 'video' ? (
                    <video
                      src={background.src}
                      muted
                      loop
                      className="bg-media-card__preview-media"
                    />
                  ) : (
                    <img
                      src={background.src}
                      alt={background.alt || 'Background preview'}
                      className="bg-media-card__preview-media"
                    />
                  )
                ) : (
                  <div className="bg-media-card__preview-placeholder">
                    No media
                  </div>
                )}

                {/* Media Type Badge */}
                <span className="bg-media-card__type-badge">
                  {background.mediaType === 'video' ? '🎥' : '🖼️'}
                </span>

                {/* Order Badge */}
                <span className="bg-media-card__order-badge">#{index + 1}</span>
              </div>

              {/* Controls */}
              <div className="bg-media-card__controls">
                {/* Active Toggle - Large touch target */}
                <label className="bg-media-card__toggle">
                  <input
                    type="checkbox"
                    checked={background.isActive ?? true}
                    onChange={() => handleToggleActive(index)}
                  />
                  <span className="bg-media-card__toggle-slider"></span>
                  <span className="bg-media-card__toggle-label">
                    {background.isActive ? 'Active' : 'Inactive'}
                  </span>
                </label>

                {/* Playback Depth */}
                <div className="bg-media-card__depth">
                  <label>Parallax Depth</label>
                  <div className="bg-media-card__depth-buttons">
                    {(['shallow', 'medium', 'deep'] as PlaybackDepth[]).map((depth) => (
                      <button
                        key={depth}
                        type="button"
                        className={`btn btn--small ${
                          background.playbackDepth === depth ? 'btn--primary' : 'btn--ghost'
                        }`}
                        onClick={() => handleDepthChange(index, depth)}
                      >
                        {depth}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Reorder Buttons */}
                <div className="bg-media-card__mobile-reorder">
                  <button
                    type="button"
                    className="btn btn--icon"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    title="Move up"
                    aria-label="Move background up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn btn--icon"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === backgrounds.length - 1}
                    title="Move down"
                    aria-label="Move background down"
                  >
                    ↓
                  </button>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  className="btn btn--danger btn--small"
                  onClick={() => handleDelete(index)}
                  title="Delete background"
                >
                  🗑️ Delete
                </button>
              </div>

              {/* URL Input (when src is empty) */}
              {!background.src && (
                <div className="bg-media-card__url-input">
                  <input
                    type="url"
                    placeholder="Enter image or video URL"
                    value={background.src}
                    onChange={(e) => {
                      const updated = [...backgrounds];
                      updated[index] = { ...updated[index], src: e.target.value };
                      onChange(updated);
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal - Connected to Cloudflare R2 */}
      <MediaUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={(newBackground) => {
          // Add uploaded media to backgrounds
          onChange([...backgrounds, newBackground]);
        }}
        folder="backgrounds"
      />

      {/* Library Modal - Browse R2 Media */}
      <MediaLibraryModal
        isOpen={libraryModalOpen}
        onClose={() => setLibraryModalOpen(false)}
        onSelectMedia={(selectedBackground) => {
          // Add selected media to backgrounds
          onChange([...backgrounds, selectedBackground]);
        }}
        folder="backgrounds"
      />
    </div>
  );
};
