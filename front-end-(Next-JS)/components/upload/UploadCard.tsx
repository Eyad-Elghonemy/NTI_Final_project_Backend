"use client";

import { ChangeEvent, RefObject } from "react";
import { Upload, X, FileImage } from "lucide-react";

interface UploadCardProps {
  inputRef: RefObject<HTMLInputElement>;
  image: string | null;
  fileName: string;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export default function UploadCard({
  inputRef,
  image,
  fileName,
  onFileChange,
  onRemove,
}: UploadCardProps) {
  return (
    <section className="card rounded-2xl p-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ff5b45] font-bold">
          1
        </span>

        <div>
          <h2 className="font-semibold">Upload Vehicle</h2>

          <p className="text-xs text-white/35">
            Upload an image of the damaged vehicle
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={onFileChange}
      />

      {/* Upload area */}
      {!image ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/20 transition hover:border-[#ff5b45]/50 hover:bg-[#ff5b45]/5"
        >
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-[#ff5b45]/30 bg-[#ff5b45]/10 text-[#ff654f]">
            <Upload size={24} />
          </div>

          <h3 className="font-semibold">Upload vehicle image</h3>

          <p className="mt-2 text-xs text-white/35">PNG, JPG or WEBP</p>

          <span className="mt-5 rounded-lg bg-[#ff5b45] px-5 py-2 text-xs font-semibold text-white">
            Choose Image
          </span>
        </button>
      ) : (
        <>
          {/* Image preview */}
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
            <div className="relative overflow-hidden bg-black">
              <img
                src={image}
                alt="Uploaded vehicle"
                className="block max-h-[520px] w-full object-contain"
              />

              <button
                type="button"
                onClick={onRemove}
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg bg-black/70 text-white/70 backdrop-blur transition hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* File information */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <FileImage size={15} className="text-[#ff654f]" />

                <div>
                  <div className="text-xs font-medium">{fileName}</div>

                  <div className="text-[10px] text-white/30">
                    Uploaded vehicle image
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-xs text-white/40 transition hover:text-white"
              >
                Replace
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
