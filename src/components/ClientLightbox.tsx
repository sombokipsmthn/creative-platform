'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface CommentItem {
  id: string;
  name: string;
  text: string;
  time: string;
}

interface CommentResponse {
  id: string;
  author_name?: string | null;
  body: string;
  created_at: string;
}

interface LightboxProps {
  isOpen: boolean;
  item: {
    id: string;
    title: string;
    url: string;
    type: string;
    exif?: { camera?: string; iso?: string; aperture?: string; shutter?: string };
  } | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

function getGalleryToken() {
  if (typeof window === 'undefined') return null;
  const parts = window.location.pathname.split('/').filter(Boolean);
  const portalIndex = parts.findIndex((part) => part === 'g');
  return portalIndex >= 0 ? parts[portalIndex + 1] || null : null;
}

export default function ClientLightbox({
  isOpen,
  item,
  onClose,
  onNext,
  onPrev,
  isFavorite,
  onToggleFavorite,
}: LightboxProps) {
  const [showComments, setShowComments] = useState(false);
  const [showExif, setShowExif] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !item) return;

    const token = getGalleryToken();
    if (!token) return;

    let cancelled = false;

    async function loadComments() {
      try {
        const response = await fetch(
          `/api/public/galleries/${encodeURIComponent(token!)}/comments?photoId=${encodeURIComponent(item!.id)}`,
          { cache: 'no-store' },
        );
        if (!response.ok) return;
        const data = await response.json() as { comments?: CommentResponse[] };
        if (cancelled) return;
        setComments(
          (data.comments || []).map((comment) => ({
            id: comment.id,
            name: comment.author_name || 'Client',
            text: comment.body,
            time: new Date(comment.created_at).toLocaleString(),
          })),
        );
      } catch (error) {
        console.warn('Failed to load gallery comments', error);
      }
    }

    void loadComments();
    return () => {
      cancelled = true;
    };
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newComment.trim();
    const token = getGalleryToken();
    if (!text || !token) return;

    setCommentLoading(true);
    try {
      const response = await fetch(
        `/api/public/galleries/${encodeURIComponent(token)}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoId: item.id, body: text }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Unable to add comment.');
      }

      const data = await response.json();
      setComments((prev) => [
        ...prev,
        {
          id: data.comment.id,
          name: data.comment.author_name || 'Client',
          text: data.comment.body,
          time: new Date(data.comment.created_at).toLocaleString(),
        },
      ]);
      setNewComment('');
    } catch (error) {
      console.warn(error);
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <div className="">
      <div className="">
        <div className="">
          <button onClick={onClose} className="">
            ✕ Close
          </button>
          <span className="">{item.title}</span>
        </div>

        <div className="">
          <button
            onClick={() => onToggleFavorite(item.id)}
            className={`px-4 py-1.5 text-xs font-sans uppercase rounded-full transition-all ${
              isFavorite ? 'bg-purple-600 text-white' : 'border border-zinc-700 text-zinc-300 hover:border-purple-500'
            }`}
          >
            {isFavorite ? '♥ Selected' : '♡ Add to Selects'}
          </button>

          <button
            onClick={() => setShowExif(!showExif)}
            className={`px-3 py-1.5 text-xs font-sans rounded-full border transition-all ${
              showExif ? 'border-purple-500 text-purple-400' : 'border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            EXIF
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`px-3 py-1.5 text-xs font-sans rounded-full border transition-all ${
              showComments ? 'border-purple-500 text-purple-400' : 'border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Comments ({comments.length})
          </button>
        </div>
      </div>

      <div className="">
        <button
          onClick={onPrev}
          className=""
        >
          ‹
        </button>

        <div className="">
          <Image src={item.url} alt={item.title} fill className="" unoptimized />
        </div>

        <button
          onClick={onNext}
          className=""
        >
          ›
        </button>

        {showExif && (
          <div className="">
            <p className="">Camera Details</p>
            <p><span className="">Camera:</span> {item.exif?.camera || 'Unknown'}</p>
            <p><span className="">Aperture:</span> {item.exif?.aperture || '—'}</p>
            <p><span className="">Shutter:</span> {item.exif?.shutter || '—'}</p>
            <p><span className="">ISO:</span> {item.exif?.iso || '—'}</p>
          </div>
        )}

        {showComments && (
          <div className="">
            <div className="">
              <div className="">
                <h4 className="">Comments & Notes</h4>
                <button onClick={() => setShowComments(false)} className="">✕</button>
              </div>

              <div className="">
                {comments.length === 0 ? (
                  <p className="">No comments yet.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="">
                      <div className="">
                        <span className="">{comment.name}</span>
                        <span>{comment.time}</span>
                      </div>
                      <p className="">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <form onSubmit={handleAddComment} className="">
              <input
                type="text"
                placeholder="Leave feedback for retoucher..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={2000}
                className=""
              />
              <button
                type="submit"
                disabled={commentLoading || !newComment.trim()}
                className=""
              >
                {commentLoading ? 'Sending...' : 'Send Comment'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
