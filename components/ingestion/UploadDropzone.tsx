"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  accept?: string;
  disabled?: boolean;
  onPickFile: (file: File) => void;
  onLoadSample: () => void;
};

export default function UploadDropzone({
  accept = ".pdf,.docx,.txt",
  disabled,
  onPickFile,
  onLoadSample,
}: Props) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const pick = () => inputRef.current?.click();

  const onFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (f) onPickFile(f);
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
        disabled={disabled}
      />

      <motion.div
        className={cn(
          "relative rounded-xl border border-dashed p-5",
          "bg-muted/30 hover:bg-muted/50 transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border"
        )}
        animate={{ scale: isDragging ? 1.01 : 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          onFiles(e.dataTransfer.files);
        }}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg border bg-background p-2">
            <Upload className="size-4" />
          </div>
          <div className="flex-1">
            <div className="font-medium">Drag &amp; drop your document</div>
            <div className="text-sm text-muted-foreground">
              Upload PDF / DOCX / TXT to enter the pipeline.
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={pick} disabled={disabled} className="flex-1">
            Upload file
          </Button>
          <Button
            onClick={onLoadSample}
            disabled={disabled}
            variant="outline"
            className="flex-1"
          >
            Load sample data
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

