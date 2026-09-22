import { XIcon } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

import { Button } from "./button";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
};

/**
 * Modal built on the native <dialog> element. Focus trapping, Escape
 * handling, and the backdrop all come from the browser.
 */
export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
}: ModalProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onClick={(event) => {
        // Clicks on the backdrop land on the <dialog> element itself.
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl border border-line bg-surface p-0 text-ink shadow-2xl open:animate-modal-in"
    >
      <div className="max-h-[90vh] overflow-y-auto p-6">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-ink-muted">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close"
            className="-mr-2 -mt-1"
            onClick={onClose}
          >
            <XIcon />
          </Button>
        </header>
        {open && children}
      </div>
    </dialog>
  );
};
