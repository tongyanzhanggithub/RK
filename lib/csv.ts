// Minimal RFC-4180-ish CSV utilities (quotes, escaped quotes, embedded commas
// and newlines). Good enough for admin product import/export.

export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  // Strip a UTF-8 BOM if present.
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char === "\r") {
      // ignore; handled by \n
    } else {
      field += char;
    }
  }
  // Flush the trailing field/row if the file doesn't end with a newline.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
}

export function csvCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  const deFormula = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${deFormula.replace(/"/g, '""')}"`;
}

export function toCsv(rows: (string | number | null | undefined)[][]): string {
  return "﻿" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
