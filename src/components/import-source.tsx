"use client";
import { useEffect, useRef, useState } from "react";
import type { XlsxSource, SourceSheet, SourceCell } from "@/lib/imports/xlsx";
import type { PDFDocumentProxy } from "pdfjs-dist";

export type SourceFocus = { reference: string; request: number } | null;
export function pageFromReference(reference: string): number | null {
  const match = /\b(?:strona|str\.?|s\.?|page)\s*(\d+)/i.exec(reference);
  return match ? Number(match[1]) : null;
}
function SpreadsheetGrid({ source, focus }: { source: XlsxSource; focus: SourceFocus }) {
  const [sheetName, setSheetName] = useState(source.sheets.find((sheet) => sheet.rows.length)?.name ?? "");
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!focus) return;
    const sheet = source.sheets.find((sheet) => focus.reference.includes(`${sheet.name}!`));
    if (sheet) setSheetName(sheet.name);
  }, [focus, source]);
  const sheet = source.sheets.find((sheet) => sheet.name === sheetName);
  useEffect(() => {
    if (!focus || !sheet) return;
    const suffix = focus.reference.split(`${sheet.name}!`)[1];
    const address = /^[A-Z]+\d+/.exec(suffix ?? "")?.[0];
    root.current?.querySelector(`[data-address="${address}"]`)?.scrollIntoView?.({ block: "center", inline: "nearest" });
  }, [focus, sheet]);
  const span = (cell: SourceSheet["rows"][number]["cells"][number]) => {
    const match = cell.merged && /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(cell.merged);
    const column = (s: string) => [...s].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0);
    return match ? { colSpan: column(match[3]) - column(match[1]) + 1, rowSpan: Number(match[4]) - Number(match[2]) + 1 } : {};
  };
  const letters = (column: number) => { let value = column, result = ""; while (value > 0) { result = String.fromCharCode((value - 1) % 26 + 65) + result; value = Math.floor((value - 1) / 26); } return result; };
  const gridCells = (row: NonNullable<typeof sheet>["rows"][number]): SourceCell[] => {
    const cells: SourceCell[] = [];
    for (let column = 1; column <= (sheet?.columns ?? 0); column++) {
      const actual = row.cells.find((cell) => cell.column === column);
      if (actual) { cells.push(actual); continue; }
      const address = `${letters(column)}${row.number}`;
      const covered = sheet!.rows.some((masterRow) => masterRow.cells.some((cell) => { const dimensions = span(cell); return cell.merged && column >= cell.column && column < cell.column + (dimensions.colSpan ?? 1) && row.number >= masterRow.number && row.number < masterRow.number + (dimensions.rowSpan ?? 1); }));
      if (!covered) cells.push({ address, column, text: "", kind: "text", strike: false, merged: null, note: null });
    }
    return cells;
  };
  return <div ref={root}><label className="source-sheet-select">Arkusz<select aria-label="Arkusz źródłowy" value={sheetName} onChange={(event) => setSheetName(event.target.value)}>{source.sheets.map((sheet) => <option key={sheet.name}>{sheet.name}</option>)}</select></label>
    {sheet && <div className="source-table-scroll"><table className="source-table"><caption>{sheet.name} — oryginalne komórki</caption><thead><tr><th scope="col">Wiersz</th>{Array.from({ length: sheet.columns }, (_, index) => <th key={index} scope="col">{letters(index + 1)}</th>)}</tr></thead><tbody>{sheet.rows.map((row) => <tr key={row.number}><th scope="row">{row.number}</th>{gridCells(row).map((cell) => <td key={cell.address} data-address={cell.address} {...span(cell)} className={`${cell.strike ? "source-strike" : ""} ${focus?.reference.includes(`${sheet.name}!${cell.address}`) ? "source-highlight" : ""}`}><small>{cell.address}</small><span>{cell.text}</span>{cell.note && <details><summary>Komentarz</summary>{cell.note}</details>}</td>)}</tr>)}</tbody></table>{!sheet.rows.length && <p>Arkusz jest pusty.</p>}</div>}
  </div>;
}

function PdfPreview({ url, focus, allowFullscreen }: { url: string; focus: SourceFocus; allowFullscreen: boolean }) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState("");
  const [rendering, setRendering] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    let loading: { destroy: () => Promise<void> } | undefined;
    void (async () => {
      try {
        const response = await fetch(url, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Źródłowy PDF jest niedostępny.");
        const bytes = new Uint8Array(await response.arrayBuffer());
        const engine = await import("pdfjs-dist/legacy/build/pdf.mjs");
        if (!active) return;
        engine.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const task = engine.getDocument({ data: bytes }); loading = task;
        const doc = await task.promise;
        if (active) setPdf(doc);
      } catch (cause) { if (active) setError((cause as Error).message); }
    })();
    return () => { active = false; controller.abort(); void loading?.destroy(); };
  }, [url]);
  useEffect(() => { const page = focus && pageFromReference(focus.reference); if (pdf && page && page >= 1 && page <= pdf.numPages) setPageNumber(page); }, [focus, pdf]);
  useEffect(() => {
    if (!pdf || !canvas.current) return;
    let active = true;
    let renderTask: { cancel: () => void; promise: Promise<void> } | undefined;
    setRendering(true);
    void (async () => {
      try {
        const page = await pdf.getPage(pageNumber);
        if (!active || !canvas.current) return;
        const initial = page.getViewport({ scale: 1 });
        const width = Math.max(280, (container.current?.clientWidth ?? 650) - 20);
        const viewport = page.getViewport({ scale: width / initial.width * zoom });
        const density = Math.min(window.devicePixelRatio || 1, 2);
        const surface = canvas.current;
        surface.width = Math.floor(viewport.width * density); surface.height = Math.floor(viewport.height * density);
        surface.style.width = `${viewport.width}px`; surface.style.height = `${viewport.height}px`;
        renderTask = page.render({ canvas: surface, viewport, transform: density === 1 ? undefined : [density, 0, 0, density, 0, 0] });
        await renderTask.promise;
      } catch (cause) { if (active && (cause as Error).name !== "RenderingCancelledException") setError("Nie udało się wyświetlić strony PDF."); }
      finally { if (active) setRendering(false); }
    })();
    return () => { active = false; renderTask?.cancel(); };
  }, [pdf, pageNumber, zoom, expanded]);
  useEffect(() => { if (!expanded) return; const listener = (event: KeyboardEvent) => { if (event.key === "Escape") setExpanded(false); }; window.addEventListener("keydown", listener); return () => window.removeEventListener("keydown", listener); }, [expanded]);
  return <div ref={container} className={`pdf-preview ${expanded ? "pdf-expanded" : ""}`} role={expanded ? "dialog" : "region"} aria-modal={expanded || undefined} aria-label="Podgląd oryginalnego PDF">
    <div className="pdf-controls"><button type="button" disabled={!pdf || pageNumber <= 1} onClick={() => setPageNumber((n) => n - 1)}>← Poprzednia strona</button>
      <label>Strona<select aria-label="Strona PDF" value={pageNumber} onChange={(event) => setPageNumber(Number(event.target.value))}>{Array.from({ length: pdf?.numPages ?? 1 }, (_, index) => <option key={index} value={index + 1}>{index + 1}</option>)}</select> / {pdf?.numPages ?? "…"}</label>
      <button type="button" disabled={!pdf || pageNumber >= pdf.numPages} onClick={() => setPageNumber((n) => n + 1)}>Następna strona →</button>
      <button type="button" disabled={zoom <= .5} aria-label="Pomniejsz PDF" onClick={() => setZoom((n) => Math.max(.5, n - .25))}>−</button><span>{Math.round(zoom * 100)}%</span><button type="button" aria-label="Powiększ PDF" disabled={zoom >= 3} onClick={() => setZoom((n) => Math.min(3, n + .25))}>+</button>
      {allowFullscreen && <button type="button" onClick={() => setExpanded((value) => !value)}>{expanded ? "Zamknij pełny ekran" : "Pełny ekran"}</button>}</div>
    {error && <p role="alert">{error}</p>}{!pdf && !error && <p role="status">Wczytywanie wszystkich stron PDF…</p>}
    <div className="pdf-page-scroll">{rendering && <p role="status">Wyświetlanie strony {pageNumber}…</p>}<canvas ref={canvas} aria-label={`Oryginalny PDF — strona ${pageNumber}`} /></div>
    <a href={url} target="_blank" rel="noreferrer">Otwórz oryginalny PDF w osobnej karcie ↗</a>
  </div>;
}
export function ImportSource({ id, kind, focus, text, allowFullscreen = true }: { id: string; kind: string; focus: SourceFocus; text: string; allowFullscreen?: boolean }) {
  const [source, setSource] = useState<XlsxSource | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (kind !== "xlsx") return;
    const controller = new AbortController();
    void fetch(`/api/imports/${id}/source?view=grid`, { cache: "no-store", signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error("Arkusz źródłowy jest niedostępny.");
      setSource(await response.json());
    }).catch((cause) => { if (!controller.signal.aborted) setError((cause as Error).message); });
    return () => controller.abort();
  }, [id, kind]);
  const url = `/api/imports/${id}/source`;
  if (kind === "pdf") return <PdfPreview key={id} url={url} focus={focus} allowFullscreen={allowFullscreen} />;
  if (kind === "xlsx") return error ? <p role="alert">{error}</p> : source ? <SpreadsheetGrid source={source} focus={focus} /> : <p role="status">Wczytywanie arkuszy…</p>;
  if (kind === "text") return <pre>{text}</pre>;
  return <a href={url} target="_blank" rel="noreferrer"><img alt="Oryginalne zdjęcie planu — otwórz, aby powiększyć" src={url} /></a>;
}
