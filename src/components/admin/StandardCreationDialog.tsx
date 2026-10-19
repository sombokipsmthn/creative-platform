"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "cn";

type StandardCreationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function StandardCreationDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: StandardCreationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={description ? undefined : undefined}
        className={cn(
          "max-h-[calc(100dvh-2rem)] max-w-2xl overflow-hidden gap-0 p-0 sm:max-w-2xl",
          className,
        )}
      >
        <div className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </div>
        <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
