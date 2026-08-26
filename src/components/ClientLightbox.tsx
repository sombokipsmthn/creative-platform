'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface CommentItem {
  id: string;
  name: string;
  text: string;
  time: string;
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
        const data = await response.json();
        if (cancelled) return;
        setComments(
          (data.comments || []).map((comment: any) => ({
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
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between text-white">
      <div className="h-16 px-6 border-b border-zinc-800/80 flex justify-between items-center bg-zinc-950/80">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition-colors">
            ✕ Close
          </button>
          <span className="text-xs font-mono text-zinc-400 border-l border-zinc-800 pl-4">{item.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleFavorite(item.id)}
            className={`px-4 py-1.5 text-xs font-mono uppercase rounded-full transition-all ${
              isFavorite ? 'bg-purple-600 text-white' : 'border border-zinc-700 text-zinc-300 hover:border-purple-500'
            }`}
          >
            {isFavorite ? '♥ Selected' : '♡ Add to Selects'}
          </button>

          <button
            onClick={() => setShowExif(!showExif)}
            className={`px-3 py-1.5 text-xs font-mono rounded-full border transition-all ${
              showExif ? 'border-purple-500 text-purple-400' : 'border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            EXIF
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`px-3 py-1.5 text-xs font-mono rounded-full border transition-all ${
              showComments ? 'border-purple-500 text-purple-400' : 'border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Comments ({comments.length})
          </button>
        </div>
      </div>

      <div className="relative flex-1 flex items-center justify-center p-6 overflow-hidden">
        <button
          onClick={onPrev}
          className="absolute left-6 z-10 w-12 h-12 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-xl text-zinc-300 hover:text-white hover:bg-purple-600 transition-all"
        >
          ‹
        </button>

        <div className="relative w-full h-full max-w-6xl max-h-[80vh]">
          <Image src={item.url} alt={item.title} fill className="object-contain" unoptimized />
        </div>

        <button
          onClick={onNext}
          className="absolute right-6 z-10 w-12 h-12 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-xl text-zinc-300 hover:text-white hover:bg-purple-600 transition-all"
        >
          ›
        </button>

        {showExif && (
          <div className="absolute top-8 right-8 bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl text-xs font-mono space-y-2 max-w-xs shadow-2xl backdrop-blur-md">
            <p className="text-purple-400 font-bold border-b border-zinc-800 pb-1">Camera Details</p>
            <p><span className="text-zinc-500">Camera:</span> {item.exif?.camera || 'Unknown'}</p>
            <p><span className="text-zinc-500">Aperture:</span> {item.exif?.aperture || '—'}</p>
            <p><span className="text-zinc-500">Shutter:</span> {item.exif?.shutter || '—'}</p>
            <p><span className="text-zinc-500">ISO:</span> {item.exif?.iso || '—'}</p>
          </div>
        )}

        {showComments && (
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-zinc-900/95 border-l border-zinc-800 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-md">
            <div className="space-y-4 overflow-hidden">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h4 className="text-sm font-medium">Comments & Notes</h4>
                <button onClick={() => setShowComments(false)} className="text-xs text-zinc-500 hover:text-white">✕</button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {comments.length === 0 ? (
                  <p className="text-xs text-zinc-500 font-mono">No comments yet.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 gap-3">
                        <span className="font-semibold text-purple-400">{comment.name}</span>
                        <span>{comment.time}</span>
                      </div>
                      <p className="text-xs text-zinc-300 font-light">{comment.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <form onSubmit={handleAddComment} className="pt-4 border-t border-zinc-800 space-y-2">
              <input
                type="text"
                placeholder="Leave feedback for retoucher..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={2000}
                className="w-full text-xs px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-white focus:border-purple-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={commentLoading || !newComment.trim()}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-xs font-mono uppercase tracking-widest rounded-md transition-colors"
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
