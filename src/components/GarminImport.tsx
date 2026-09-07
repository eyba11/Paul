"use client";

import { useRef, useState } from "react";
import { Card, GhostButton, PrimaryButton } from "@/components/ui";
import { parseGarminCsv, type GarminImportDraft } from "@/lib/garmin-csv";
import { useCoach } from "@/lib/store";

export function GarminImport() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { importGarmin } = useCoach();
  const [draft, setDraft] = useState<GarminImportDraft | null>(null);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function readFile(file: File) {
    setError(null);
    setResult(null);
    const text = await file.text();
    const parsed = parseGarminCsv(text);
    setFileName(file.name);
    setDraft(parsed);
    if (parsed.warnings[0] && !parsed.logs.length && !parsed.weights.length) {
      setError(parsed.warnings[0]);
    }
  }

  async function onPick(list: FileList | null) {
    const file = list?.[0];
    if (!file) return;
    await readFile(file);
  }

  async function loadSample(path: string) {
    const res = await fetch(path);
    const text = await res.text();
    const parsed = parseGarminCsv(text);
    setFileName(`${path.split("/").pop()} (sample)`);
    setDraft(parsed);
    setError(null);
    setResult(null);
    if (parsed.warnings[0] && !parsed.logs.length && !parsed.weights.length) {
      setError(parsed.warnings[0]);
    }
  }

  function commit() {
    if (!draft) return;
    const imported = importGarmin(draft);
    setResult(
      `Imported ${imported.logs} activities and ${imported.weights} weigh-ins. Skipped ${imported.duplicates} duplicates${draft.skipped ? `, ignored ${draft.skipped} blank rows` : ""}.`,
    );
    setDraft(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <Card>
      <h2 className="text-sm uppercase tracking-[0.16em] text-mist">Garmin CSV import</h2>
      <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-mist">
        <li>Open Garmin Connect in a browser (not just the phone app).</li>
        <li>
          Activities: filter the list, open the export menu, choose <span className="text-foam">Export CSV</span>.
        </li>
        <li>
          Weight: Health Stats → Weight → export CSV if you want scale history.
        </li>
        <li>Upload the file here. Units follow your Garmin export (kg/km preferred).</li>
      </ol>

      <input
        ref={fileRef}
        className="mt-3 w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-volt file:px-4 file:py-2 file:font-semibold file:text-ink-950"
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => onPick(e.target.files)}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <GhostButton type="button" onClick={() => loadSample("/samples/garmin-activities.csv")}>
          Load sample activities
        </GhostButton>
        <GhostButton type="button" onClick={() => loadSample("/samples/garmin-weight.csv")}>
          Load sample weight
        </GhostButton>
        {draft && (draft.logs.length > 0 || draft.weights.length > 0) && (
          <PrimaryButton type="button" onClick={commit}>
            Import {draft.logs.length} sessions{draft.weights.length ? ` · ${draft.weights.length} weights` : ""}
          </PrimaryButton>
        )}
      </div>

      {fileName && <p className="mt-2 text-xs text-mist">{fileName}</p>}
      {draft && (
        <p className="mt-2 text-sm text-foam">
          Ready: {draft.logs.length} activities, {draft.weights.length} weigh-ins
          {draft.skipped ? `, ${draft.skipped} skipped` : ""}.
        </p>
      )}
      {error && <p className="mt-2 text-sm text-amber-200">{error}</p>}
      {result && <p className="mt-2 text-sm text-volt">{result}</p>}
    </Card>
  );
}
