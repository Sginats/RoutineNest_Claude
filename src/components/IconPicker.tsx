"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadCardIcon } from "@/lib/storage";

// ---------------------------------------------------------------------------
// ARASAAC helpers
// ---------------------------------------------------------------------------
// TODO: If ARASAAC API is unavailable (CORS / network), implement a local
//       placeholder adapter that returns bundled sample pictograms.
const ARASAAC_SEARCH_URL =
  "https://api.arasaac.org/api/pictograms/en/search";

function arasaacImageUrl(id: number): string {
  return `https://static.arasaac.org/pictograms/${id}/${id}_300.png`;
}

interface ArasaacResult {
  _id: number;
  keywords: { keyword: string; type: number; hasLocation: boolean }[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface IconPickerProps {
  /** Currently-selected image URL (empty string = none) */
  value: string;
  /** Called with the new URL whenever the user picks or uploads an icon */
  onChange: (url: string) => void;
  /** Authenticated user ID – required for Storage uploads */
  userId: string;
}

/**
 * Dual-mode icon picker.
 *
 * ARASAAC tab  — searches the ARASAAC open pictogram API and lets the user
 *                click a result to use it.  Licensed CC BY-NC-SA 4.0.
 * Upload tab   — lets the user choose a local image which is uploaded to
 *                Supabase Storage (bucket: card-icons).
 */
export default function IconPicker({ value, onChange, userId }: IconPickerProps) {
  const [tab, setTab] = useState<"arasaac" | "upload">("arasaac");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArasaacResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  // ---- ARASAAC search ---------------------------------------------------
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;

    setSearching(true);
    setSearchError(null);
    setResults([]);

    try {
      const res = await fetch(
        `${ARASAAC_SEARCH_URL}/${encodeURIComponent(term)}`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ArasaacResult[] = await res.json();
      setResults(data.slice(0, 20));
    } catch {
      // TODO: Surface a local placeholder adapter here when ARASAAC is offline
      setSearchError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  // ---- Custom upload ----------------------------------------------------
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const url = await uploadCardIcon(file, userId);
      onChange(url);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setUploadError(msg);
    } finally {
      setUploading(false);
      // Reset so the same file can be re-selected if needed
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // -----------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-3">
      {/* Tab bar */}
      <div className="flex gap-2" role="tablist" aria-label="Icon source">
        <Button
          type="button"
          size="sm"
          variant={tab === "arasaac" ? "default" : "outline"}
          role="tab"
          aria-selected={tab === "arasaac"}
          onClick={() => setTab("arasaac")}
        >
          ARASAAC
        </Button>
        <Button
          type="button"
          size="sm"
          variant={tab === "upload" ? "default" : "outline"}
          role="tab"
          aria-selected={tab === "upload"}
          onClick={() => setTab("upload")}
        >
          Upload
        </Button>
      </div>

      {/* ---- ARASAAC panel ---- */}
      {tab === "arasaac" && (
        <div role="tabpanel" className="flex flex-col gap-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder='Search symbols (e.g. "brush teeth")'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search ARASAAC pictograms"
            />
            <Button
              type="submit"
              size="sm"
              disabled={searching || !query.trim()}
              aria-label="Search"
            >
              {searching ? "…" : "Search"}
            </Button>
          </form>

          {searchError && (
            <p className="text-sm text-destructive" role="alert">
              {searchError}
            </p>
          )}

          {results.length > 0 && (
            <ul
              className="grid grid-cols-4 gap-2 sm:grid-cols-5"
              aria-label="ARASAAC results"
            >
              {results.map((r) => {
                const imgUrl = arasaacImageUrl(r._id);
                const keyword = r.keywords[0]?.keyword ?? String(r._id);
                const isSelected = value === imgUrl;
                return (
                  <li key={r._id}>
                    <button
                      type="button"
                      className={`flex w-full flex-col items-center gap-1 rounded-lg border p-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isSelected
                          ? "border-primary ring-2 ring-primary"
                          : "hover:border-primary/50"
                      }`}
                      aria-pressed={isSelected}
                      aria-label={keyword}
                      onClick={() => onChange(imgUrl)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={keyword}
                        className="h-14 w-14 object-contain"
                        loading="lazy"
                      />
                      <span className="w-full truncate text-center">
                        {keyword}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Non-intrusive licensing attribution */}
          <p className="text-xs text-muted-foreground">
            Pictograms by{" "}
            <a
              href="https://arasaac.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              ARASAAC
            </a>{" "}
            © Gobierno de Aragón, licensed under{" "}
            <a
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              CC BY-NC-SA 4.0
            </a>
            .
          </p>
        </div>
      )}

      {/* ---- Upload panel ---- */}
      {tab === "upload" && (
        <div role="tabpanel" className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="icon-upload">Image file (PNG / JPG / GIF)</Label>
            <input
              ref={fileRef}
              id="icon-upload"
              type="file"
              accept="image/*"
              disabled={uploading || !userId}
              className="block w-full text-sm text-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-accent disabled:opacity-50"
              onChange={handleFileChange}
              aria-label="Choose image to upload"
            />
          </div>

          {!userId && (
            <p className="text-xs text-muted-foreground">
              Sign in to upload custom icons.
            </p>
          )}
          {uploading && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Uploading…
            </p>
          )}
          {uploadError && (
            <p className="text-sm text-destructive" role="alert">
              {uploadError}
            </p>
          )}
        </div>
      )}

      {/* ---- Current selection preview ---- */}
      {value && (
        <div className="flex items-center gap-3 rounded-lg border p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Selected icon"
            className="h-16 w-16 rounded object-contain"
          />
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              Selected icon
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange("")}
              aria-label="Remove selected icon"
            >
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
