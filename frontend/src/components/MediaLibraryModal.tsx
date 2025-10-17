import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { config } from '../config/api';
import { useAuth } from '../auth/AuthContext';
import type { BackgroundImage, BackgroundMediaType } from '../types/content';
import { Icon } from './Icon';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (media: BackgroundImage) => void;
  folder?: 'backgrounds' | 'events' | 'posters' | 'general' | 'all';
}

interface R2MediaItem {
  key: string;
  url: string;
  size: number;
  lastModified: Date;
  mediaType: BackgroundMediaType;
}

/**
 * Media Library Browser Modal
 * Browse and select media from Cloudflare R2
 * Mobile-friendly grid layout with filters
 */
export const MediaLibraryModal = ({
  isOpen,
  onClose,
  onSelectMedia,
  folder = 'all'
}: MediaLibraryModalProps) => {
  const { token } = useAuth();
  const [media, setMedia] = useState<R2MediaItem[]>([]);
  const [filteredMedia, setFilteredMedia] = useState<R2MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [selectedItem, setSelectedItem] = useState<R2MediaItem | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  // Virtual scrolling setup
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: filteredMedia.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated height of each item
    overscan: 5 // Render 5 extra items outside viewport
  });

  /**
   * Load media from R2
   */
  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  /**
   * Filter media by type
   */
  useEffect(() => {
    if (filterType === 'all') {
      setFilteredMedia(media);
    } else {
      setFilteredMedia(media.filter(item => item.mediaType === filterType));
    }
  }, [media, filterType]);

  const loadMedia = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${config.apiBaseUrl}/api/v1/media`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load media library');
      }

      const data = await response.json();

      // Filter by folder if specified
      let mediaItems = data.media || [];
      if (folder !== 'all') {
        mediaItems = mediaItems.filter((item: R2MediaItem) =>
          item.key.startsWith(`${folder}/`)
        );
      }

      setMedia(mediaItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle media selection
   */
  const handleSelect = (item: R2MediaItem) => {
    setSelectedItem(item);
  };

  /**
   * Confirm selection and close
   */
  const handleConfirm = () => {
    if (!selectedItem) return;

    const background: BackgroundImage = {
      src: selectedItem.url,
      alt: selectedItem.key.split('/').pop() || '',
      mediaType: selectedItem.mediaType,
      isActive: true,
      playbackDepth: 'medium',
      focalPoint: { x: 50, y: 50 },
      order: 0
    };

    // Add video-specific settings
    if (selectedItem.mediaType === 'video') {
      background.loop = true;
      background.autoplay = true;
      background.muted = true;
    }

    onSelectMedia(background);
    handleClose();
  };

  /**
   * Delete media from R2
   */
  const handleDelete = async (item: R2MediaItem) => {
    if (!confirm(`Delete ${item.key}? This cannot be undone.`)) {
      return;
    }

    setDeletingKey(item.key);
    setError(null);

    try {
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${config.apiBaseUrl}/api/v1/media/${encodeURIComponent(item.key)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete media');
      }

      // Reload media list
      await loadMedia();

      // Clear selection if deleted item was selected
      if (selectedItem?.key === item.key) {
        setSelectedItem(null);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete media');
    } finally {
      setDeletingKey(null);
    }
  };

  /**
   * Close modal
   */
  const handleClose = () => {
    setSelectedItem(null);
    onClose();
  };

  /**
   * Format file size
   */
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal modal--library" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={handleClose}>×</button>

        <h2 className="modal__title">Media Library</h2>
        <p className="modal__subtitle">
          Select media from Cloudflare R2 {folder !== 'all' && `(${folder}/ folder)`}
        </p>

        {/* Filter Controls */}
        <div className="library-filters">
          <div className="library-filters__group">
            <label>Type:</label>
            <div className="library-filters__buttons">
              <button
                type="button"
                className={`btn btn--small ${filterType === 'all' ? 'btn--primary' : 'btn--ghost'}`}
                onClick={() => setFilterType('all')}
              >
                All ({media.length})
              </button>
              <button
                type="button"
                className={`btn btn--small ${filterType === 'image' ? 'btn--primary' : 'btn--ghost'}`}
                onClick={() => setFilterType('image')}
                aria-label="Filter images"
              >
                <Icon name="image" size={16} /> Images ({media.filter(m => m.mediaType === 'image').length})
              </button>
              <button
                type="button"
                className={`btn btn--small ${filterType === 'video' ? 'btn--primary' : 'btn--ghost'}`}
                onClick={() => setFilterType('video')}
                aria-label="Filter videos"
              >
                <Icon name="video" size={16} /> Videos ({media.filter(m => m.mediaType === 'video').length})
              </button>
            </div>
          </div>

          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={loadMedia}
            disabled={loading}
            aria-label="Refresh media library"
          >
            <Icon name="refresh" size={16} /> Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="library-loading">
            <p>Loading media from R2...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="library-error" role="alert">
            <Icon name="warning" size={16} /> {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredMedia.length === 0 && (
          <div className="library-empty">
            <p>No media found. Upload some files to get started!</p>
          </div>
        )}

        {/* Media Grid with Virtual Scrolling */}
        {!loading && filteredMedia.length > 0 && (
          <div
            ref={parentRef}
            className="library-grid-container"
            style={{
              height: '500px',
              overflow: 'auto'
            }}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative'
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const item = filteredMedia[virtualRow.index];
                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`
                    }}
                  >
                    <div
                      className={`library-item ${selectedItem?.key === item.key ? 'library-item--selected' : ''}`}
                      onClick={() => handleSelect(item)}
                    >
                      {/* Preview */}
                      <div className="library-item__preview">
                        {item.mediaType === 'video' ? (
                          <video
                            src={item.url}
                            muted
                            className="library-item__media"
                          />
                        ) : (
                          <img
                            src={item.url}
                            alt={item.key}
                            className="library-item__media"
                            loading="lazy"
                          />
                        )}

                        {/* Type Badge */}
                        <span className="library-item__badge">
                          <Icon name={item.mediaType === 'video' ? 'video' : 'image'} size={14} />
                        </span>

                        {/* Selected Checkmark */}
                        {selectedItem?.key === item.key && (
                          <span className="library-item__checkmark">
                            <Icon name="check" size={20} />
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="library-item__info">
                        <p className="library-item__name" title={item.key}>
                          {item.key.split('/').pop()}
                        </p>
                        <p className="library-item__size">
                          {formatSize(item.size)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="library-item__actions">
                        <button
                          type="button"
                          className="btn btn--icon btn--danger btn--small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item);
                          }}
                          disabled={deletingKey === item.key}
                          aria-label={deletingKey === item.key ? 'Deleting...' : 'Delete from R2'}
                        >
                          <Icon name={deletingKey === item.key ? 'clock' : 'trash'} size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selection Info */}
        {selectedItem && (
          <div className="library-selection">
            <div className="library-selection__info">
              <strong>Selected:</strong> {selectedItem.key.split('/').pop()}
              <span className="library-selection__meta">
                {formatSize(selectedItem.size)} • {selectedItem.mediaType}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="modal__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleConfirm}
            disabled={!selectedItem}
          >
            Select Media
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
