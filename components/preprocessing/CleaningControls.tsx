"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePlaygroundStore } from "@/store/playgroundStore";
import { Badge } from "@/components/ui/badge";

export default function CleaningControls() {
  const rawText = usePlaygroundStore((s) => s.rawText);
  const cleanedText = usePlaygroundStore((s) => s.cleanedText);
  const setCleanedText = usePlaygroundStore((s) => s.setCleanedText);
  const addLog = usePlaygroundStore((s) => s.addLog);
  const options = usePlaygroundStore((s) => s.preprocessingOptions);
  const setOptions = usePlaygroundStore((s) => s.setPreprocessingOptions);

  const baseText = cleanedText || rawText;

  const normalizeUnicode = (t: string) => t.normalize("NFKC");

  const removeNoise = (t: string) =>
    t
      .replace(/[^\S\r\n\t ]+/g, " ")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

  const removePageHeaders = (t: string) =>
    t
      .split("\n")
      .filter((l) => !/^\s*(page\s+\d+|header:)/i.test(l))
      .join("\n");

  const removeExtraSpaces = (t: string) =>
    t.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");

  const removeEmptyLines = (t: string) =>
    t
      .split("\n")
      .filter((l) => l.trim().length > 0)
      .join("\n");

  const ocrCleanup = (t: string) =>
    t
      .replace(/-\n([a-z])/gi, "$1")
      .replace(/\uFB01/g, "fi")
      .replace(/\uFB02/g, "fl")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'");

  const applyToggles = (t: string) => {
    let next = t;
    if (options.ocrCleanup) next = ocrCleanup(next);
    if (!options.preservePunctuation) next = next.replace(/[^\w\s]/g, "");
    if (options.lowercase) next = next.toLowerCase();
    return next;
  };

  const runAll = () => {
    addLog("preprocessing", "Preprocessing started");
    let next = baseText.replace(/\r\n/g, "\n");
    next = normalizeUnicode(next);
    next = removeNoise(next);
    next = removePageHeaders(next);
    next = removeExtraSpaces(next);
    next = removeEmptyLines(next);
    next = applyToggles(next).trim();
    setCleanedText(next);
    addLog("preprocessing", "Preprocessing complete");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span>Preprocessing & Cleaning</span>
          <Badge variant="secondary">Stage 2</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={options.lowercase ? "default" : "outline"}
            onClick={() => setOptions({ lowercase: !options.lowercase })}
            disabled={!rawText}
          >
            Lowercase
          </Button>
          <Button
            variant={options.preservePunctuation ? "default" : "outline"}
            onClick={() =>
              setOptions({ preservePunctuation: !options.preservePunctuation })
            }
            disabled={!rawText}
          >
            Preserve punctuation
          </Button>
          <Button
            variant={options.ocrCleanup ? "default" : "outline"}
            onClick={() => setOptions({ ocrCleanup: !options.ocrCleanup })}
            disabled={!rawText}
          >
            OCR cleanup
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const next = applyToggles(baseText);
              setCleanedText(next);
              addLog("preprocessing", "Applied toggles");
            }}
            disabled={!rawText}
          >
            Apply toggles
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            className="w-full"
            variant="outline"
            onClick={() => {
              setCleanedText(removeNoise(baseText));
              addLog("preprocessing", "Removed noise");
            }}
            disabled={!rawText}
          >
            Remove noise
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => {
              setCleanedText(removeExtraSpaces(baseText));
              addLog("preprocessing", "Removed extra spaces");
            }}
            disabled={!rawText}
          >
            Remove extra spaces
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => {
              setCleanedText(removePageHeaders(baseText));
              addLog("preprocessing", "Removed page headers (heuristic)");
            }}
            disabled={!rawText}
          >
            Remove page headers
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => {
              setCleanedText(normalizeUnicode(baseText));
              addLog("preprocessing", "Normalized unicode (NFKC)");
            }}
            disabled={!rawText}
          >
            Normalize unicode
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => {
              setCleanedText(removeEmptyLines(baseText));
              addLog("preprocessing", "Removed empty lines");
            }}
            disabled={!rawText}
          >
            Remove empty lines
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => {
              const next = baseText.replace(/\r\n/g, "\n").trim();
              setCleanedText(next);
              addLog("preprocessing", "Normalized whitespace/newlines");
            }}
            disabled={!rawText}
          >
            Normalize whitespace
          </Button>
        </div>

        <Button className="w-full" onClick={runAll} disabled={!rawText}>
          Run Preprocessing
        </Button>
      </CardContent>
    </Card>
  );
}