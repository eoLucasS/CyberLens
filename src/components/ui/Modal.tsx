'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Show the X close button in the header (default true) */
  showCloseButton?: boolean;
  /**
   * When true, clicking the backdrop and pressing Escape do nothing.
   * Intended for mandatory consent flows (e.g. LGPD notice).
   */
  preventClose?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  preventClose = false,
}: ModalProps) {
  // Controls CSS opacity/scale transition
  const [visible, setVisible] = useState(false);
  // Gate: only render into the portal once the component is mounted client-side
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  // Element that had focus right before the modal opened. We restore focus
  // there on close so keyboard users don't get dumped at the top of the page.
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Mark as client-mounted (needed for createPortal)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Trigger enter / leave transitions when isOpen changes
  useEffect(() => {
    if (isOpen) {
      // Small delay so the initial CSS state is painted before the transition fires
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Auto-focus the first focusable element when the modal opens, and restore
  // focus to the previous element on close. The cleanup of this effect runs
  // when isOpen flips from true to false, which is exactly when we want to
  // hand focus back.
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    // Capture the currently focused element BEFORE moving focus into the modal.
    previouslyFocusedRef.current =
      typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;

    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable[0]?.focus();

    return () => {
      // Only restore if the element is still in the DOM and is focusable.
      const previous = previouslyFocusedRef.current;
      previouslyFocusedRef.current = null;
      if (previous && document.contains(previous) && typeof previous.focus === 'function') {
        previous.focus();
      }
    };
  }, [isOpen]);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClose) {
        onClose();
      }
    },
    [onClose, preventClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = () => {
    if (!preventClose) onClose();
  };

  // Do not render on server or when fully closed
  if (!mounted || !isOpen) return null;

  const content = (
    // Backdrop
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      className={[
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black/60 backdrop-blur-sm',
        // Fade transition
        'transition-opacity duration-200',
        visible ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
      onClick={handleBackdropClick}
    >
      {/* Modal box: stop propagation so clicks inside don't close */}
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className={[
          'relative w-full max-w-lg',
          'bg-[#1a1a2e] border border-white/10 rounded-2xl',
          'shadow-[0_0_40px_rgba(0,0,0,0.6)]',
          // Scale + fade transition
          'transition-all duration-200',
          visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        ].join(' ')}
      >
        {/* Header: only rendered when there's a title or a close button */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10">
            {title && (
              <h2 id="modal-title" className="text-base font-semibold text-[#f4f4f5]">
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button
                onClick={!preventClose ? onClose : undefined}
                aria-label="Fechar"
                className={[
                  'ml-auto p-1.5 rounded-lg',
                  'text-[#9ca3af] hover:text-[#f4f4f5] hover:bg-white/10',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ffd5]/50',
                  preventClose && 'opacity-40 cursor-not-allowed',
                ].join(' ')}
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
