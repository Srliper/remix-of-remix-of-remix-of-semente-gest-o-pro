export function exportToCsv(filename: string, rows: Array<Record<string, string | number>>) {
  const first = rows[0];
  if (!first) return;
  const headers = Object.keys(first);
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [
    headers.join(";"),
    ...rows.map((row) => headers.map((h) => escape(row[h] ?? "")).join(";")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
