"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  className,
  children,
  showOverlay = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { showOverlay?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      {showOverlay ? <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/25 backdrop-blur-sm" /> : null}
      <DialogPrimitive.Content className={cn("fixed inset-y-0 right-0 z-50 flex min-w-0 w-full max-w-md flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl outline-none", className)} {...props}>
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="닫기"><X className="size-5" /></DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("border-b border-slate-100 p-5 pr-14", className)} {...props} />;
}

export const SheetTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(({ className, ...props }, ref) => <DialogPrimitive.Title ref={ref} className={cn("font-bold text-slate-950", className)} {...props} />);
SheetTitle.displayName = "SheetTitle";

export const SheetDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(({ className, ...props }, ref) => <DialogPrimitive.Description ref={ref} className={cn("mt-1 text-sm leading-6 text-slate-500", className)} {...props} />);
SheetDescription.displayName = "SheetDescription";
