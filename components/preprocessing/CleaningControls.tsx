"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePlaygroundStore } from "@/store/playgroundStore";

export default function CleaningControls() {
  const rawText = usePlaygroundStore((s) => s.rawText);
  const setCleanedText = usePlaygroundStore((s) => s.setCleanedText);
  const addLog = usePlaygroundStore((s) => s.addLog);

  const removeExtraSpaces = () => {
    const next = rawText.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n");
    setCleanedText(next);
    addLog("preprocessing", "Removed extra spaces");
  };

  const removeHeaders = () => {
    const lines = rawText.split("\n");
    const next = lines.filter((l) => !/^\s*(page\s+\d+|header:)/i.test(l)).join("\n");
    setCleanedText(next);
    addLog("preprocessing", "Removed headers (heuristic)");
  };

  const normalizeText = () => {
    const next = rawText.replace(/\r\n/g, "\n").trim();
    setCleanedText(next);
    addLog("preprocessing", "Normalized text");
  };

  const runAll = () => {
    addLog("preprocessing", "Preprocessing started");
    const next = rawText
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    setCleanedText(next);
    addLog("preprocessing", "Preprocessing complete");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cleaning Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full" onClick={removeExtraSpaces} disabled={!rawText}>
          Remove Extra Spaces
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={removeHeaders}
          disabled={!rawText}
        >
          Remove Headers
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={normalizeText}
          disabled={!rawText}
        >
          Normalize Text
        </Button>
        <Button className="w-full" onClick={runAll} disabled={!rawText}>
          Run Preprocessing
        </Button>
      </CardContent>
    </Card>
  );
}