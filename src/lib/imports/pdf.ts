export type PdfSourcePage = { number: number; title: string | null; text: string; rows: { y: number; cells: { x: number; text: string }[] }[] };
/** Współrzędne zachowują relacje kolumn, których płaski tekst PDF nie oddaje. */
export async function readPdfSource(bytes: Uint8Array): Promise<PdfSourcePage[]> {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loading = getDocument({ data: new Uint8Array(bytes), useSystemFonts: true, disableFontFace: true });
  const pdf = await loading.promise;
  try {
    const pages: PdfSourcePage[] = [];
    for (let number = 1; number <= pdf.numPages; number++) {
      const page = await pdf.getPage(number);
      const content = await page.getTextContent();
      const rows: PdfSourcePage["rows"] = [];
      for (const item of content.items) {
        if (!("str" in item) || !item.str.trim()) continue;
        const x = Math.round(item.transform[4]); const y = Math.round(item.transform[5]);
        let row = rows.find((row) => Math.abs(row.y - y) <= 2);
        if (!row) { row = { y, cells: [] }; rows.push(row); }
        row.cells.push({ x, text: item.str.trim() });
      }
      rows.sort((a, b) => b.y - a.y);
      for (const row of rows) row.cells.sort((a, b) => a.x - b.x);
      const plain = rows.map((row) => row.cells.map((cell) => cell.text).join(" ")).join("\n");
      const title = plain.split("\n").find((line) => /^Trening\s+(?!Trening\b)\S+/i.test(line)) ?? null;
      const text = `STRONA ${number}${title ? ` — ${title}` : ""}\n${rows.map((row) => `y=${row.y}: ${row.cells.map((cell) => `x=${cell.x} ${cell.text}`).join(" | ")}`).join("\n")}`;
      pages.push({ number, title, text, rows });
    }
    return pages;
  } finally { await loading.destroy(); }
}
