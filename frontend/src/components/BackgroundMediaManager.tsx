import { useState } from 'react';
import type { BackgroundImage, BackgroundMediaType, PlaybackDepth } from '../types/content';
import { MediaUploadModal, UploadedMedia } from './MediaUploadModal';
import { MediaLibraryModal } from './MediaLibraryModal';
import { Icon } from './Icon';

interface BackgroundMediaManagerProps {
  backgrounds: BackgroundImage[];
  onChange: (backgrounds: BackgroundImage[]) => void;
}

/**
 * Background Media Manager Component
 * Mobile-friendly, accessible media management with drag-and-drop
 * Following 2025 UX best practices
 */
type BackgroundEntryInput = Partial<BackgroundImage> & { src: string; mediaType?: BackgroundMediaType };

const createBackgroundEntry = (input: BackgroundEntryInput, order: number): BackgroundImage => {
  const mediaType: BackgroundMediaType = input.mediaType === 'video' ? 'video' : 'image';
  const src = typeof input.src === 'string' ? input.src.trim() : '';
  const fallbackImage = input.fallbackImage?.trim() || undefined;
  const focalPoint = input.focalPoint ?? { x: 50, y: 50 };

  const entry: BackgroundImage = {
    src,
    alt: input.alt?.trim() || `Background ${order + 1}`,
    mediaType,
    isActive: input.isActive ?? true,
    playbackDepth: input.playbackDepth ?? 'medium',
    focalPoint,
    order,
    fallbackImage
  };

  if (mediaType === 'video') {
    entry.loop = input.loop ?? true;
    entry.autoplay = input.autoplay ?? true;
    entry.muted = input.muted ?? true;
  }

  return entry;
};

const createBackgroundFromUpload = (media: UploadedMedia, order: number): BackgroundImage =>
  createBackgroundEntry(
    {
      src: media.url,
      alt: media.originalFilename,
      mediaType: media.mediaType === 'video' ? 'video' : 'image',
      fallbackImage: media.thumbnailUrl,
      loop: media.mediaType === 'video' ? true : undefined,
      autoplay: media.mediaType === 'video' ? true : undefined,
      muted: media.mediaType === 'video' ? true : undefined
    },
    order
  );

const normaliseExistingBackground = (background: BackgroundImage, order: number): BackgroundImage =>
  createBackgroundEntry(
    {
      ...background,
      src: background.src,
      alt: background.alt,
      fallbackImage: background.fallbackImage,
      loop: background.loop,
      autoplay: background.autoplay,
      muted: background.muted,
      focalPoint: background.focalPoint,
      playbackDepth: background.playbackDepth,
      isActive: background.isActive,
      mediaType: background.mediaType
    },
    order
  );

const reindexBackgrounds = (items: BackgroundImage[]): BackgroundImage[] =>
  items.map((background, index) => ({ ...background, order: index }));

export const BackgroundMediaManager = ({ backgrounds, onChange }: BackgroundMediaManagerProps) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const updateBackgrounds = (updater: (items: BackgroundImage[]) => BackgroundImage[]) => {
    const updated = updater(backgrounds);
    onChange(reindexBackgrounds(updated));
  };

  /**
   * Toggle background active/inactive
   */
  const handleToggleActive = (index: number) => {
    updateBackgrounds((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              isActive: !(item.isActive ?? true)
            }
          : item
      )
    );
  };

  /**
   * Update playback depth
   */
  const handleDepthChange = (index: number, depth: PlaybackDepth) => {
    updateBackgrounds((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              playbackDepth: depth
            }
          : item
      )
    );
  };

  /**
   * Delete background
   */
  const handleDelete = (index: number) => {
    updateBackgrounds((items) => items.filter((_, itemIndex) => itemIndex !== index));
  };

  /**
   * Move background up (mobile-friendly alternative to drag-and-drop)
   */
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    updateBackgrounds((items) => {
      const next = [...items];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  /**
   * Move background down (mobile-friendly alternative to drag-and-drop)
   */
  const handleMoveDown = (index: number) => {
    if (index === backgrounds.length - 1) return;
    updateBackgrounds((items) => {
      const next = [...items];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  /**
   * Update focal point
   */
  const handleFocalPointChange = (index: number, axis: 'x' | 'y', value: number) => {
    updateBackgrounds((items) =>
      items.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        const currentFocalPoint = item.focalPoint ?? { x: 50, y: 50 };
        return {
          ...item,
          focalPoint: {
            x: axis === 'x' ? value : currentFocalPoint.x,
            y: axis === 'y' ? value : currentFocalPoint.y
          }
        };
      })
    );
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

    // Only set visual indicator, don't mutate state yet
    setDropTargetIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Now we actually update the order
    updateBackgrounds((items) => {
      const next = [...items];
      const draggedItem = next[draggedIndex];
      next.splice(draggedIndex, 1);
      next.splice(index, 0, draggedItem);
      return next;
    });
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  /**
   * Add new background from URL
   */
  const handleAddBackground = () => {
    updateBackgrounds((items) => [
      ...items,
      createBackgroundEntry(
        {
          src: '',
          alt: '',
          mediaType: 'image',
          isActive: true,
          playbackDepth: 'medium',
          focalPoint: { x: 50, y: 50 }
        },
        items.length
      )
    ]);
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
            aria-label="Browse media library"
          >
            <Icon name="folder" /> Browse Library
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setUploadModalOpen(true)}
            aria-label="Upload new media"
          >
            <Icon name="upload" /> Upload New
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handleAddBackground}
            aria-label="Add media from URL"
          >
            <Icon name="plus" /> Add URL
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
              } ${dropTargetIndex === index ? 'bg-media-card--drop-target' : ''}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              {/* Drag Handle - Desktop */}
              <button
                type="button"
                className="bg-media-card__drag-handle"
                title="Drag to reorder or use arrow keys"
                aria-label={`Reorder background ${index + 1}. Use up and down arrow keys to move.`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp' && index > 0) {
                    e.preventDefault();
                    handleMoveUp(index);
                  } else if (e.key === 'ArrowDown' && index < backgrounds.length - 1) {
                    e.preventDefault();
                    handleMoveDown(index);
                  }
                }}
              >
                <span aria-hidden="true">⠿</span>
              </button>

              {/* Preview */}
              <div className="bg-media-card__preview">
                {background.src ? (
                  background.mediaType === 'video' ? (
                    <video
                      src={background.src}
                      muted
                      loop
                      controls
                      preload="metadata"
                      poster={background.fallbackImage}
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
                  <Icon name={background.mediaType === 'video' ? 'video' : 'image'} size={16} />
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

                {/* Focal Point Adjustment */}
                <div className="bg-media-card__focal-point">
                  <label>Focal Point</label>
                  <div className="focal-point-controls">
                    <div className="focal-point-axis">
                      <label htmlFor={`focal-x-${index}`}>Horizontal</label>
                      <input
                        id={`focal-x-${index}`}
                        type="range"
                        min="0"
                        max="100"
                        value={background.focalPoint?.x || 50}
                        onChange={(e) => handleFocalPointChange(index, 'x', Number(e.target.value))}
                        className="focal-point-slider"
                        aria-label="Horizontal focal point"
                      />
                      <span className="focal-point-value">{background.focalPoint?.x || 50}%</span>
                    </div>
                    <div className="focal-point-axis">
                      <label htmlFor={`focal-y-${index}`}>Vertical</label>
                      <input
                        id={`focal-y-${index}`}
                        type="range"
                        min="0"
                        max="100"
                        value={background.focalPoint?.y || 50}
                        onChange={(e) => handleFocalPointChange(index, 'y', Number(e.target.value))}
                        className="focal-point-slider"
                        aria-label="Vertical focal point"
                      />
                      <span className="focal-point-value">{background.focalPoint?.y || 50}%</span>
                    </div>
                  </div>
                  <p className="focal-point-hint">
                    Adjust where the image focuses when cropped on different screen sizes
                  </p>
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
                  aria-label="Delete background"
                >
                  <Icon name="trash" size={16} /> Delete
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
                      updateBackgrounds((items) =>
                        items.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                src: e.target.value
                              }
                            : item
                        )
                      );
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
        onUploadSuccess={(uploadedMedia) => {
          updateBackgrounds((items) => [
            ...items,
            createBackgroundFromUpload(uploadedMedia, items.length)
          ]);
        }}
        folder="backgrounds"
      />

      {/* Library Modal - Browse R2 Media */}
      <MediaLibraryModal
        isOpen={libraryModalOpen}
        onClose={() => setLibraryModalOpen(false)}
        onSelectMedia={(selectedBackground) => {
          updateBackgrounds((items) => [
            ...items,
            normaliseExistingBackground(selectedBackground, items.length)
          ]);
        }}
        folder="backgrounds"
      />
    </div>
  );
};
