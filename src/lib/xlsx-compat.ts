type Sheet = {
  rows: unknown[][];
  columns?: { wch?: number }[];
  autoFilter?: { ref: string };
};

type Workbook = {
  sheets: { name: string; sheet: Sheet }[];
};

export const utils = {
  aoa_to_sheet(rows: unknown[][]): Sheet {
    return { rows };
  },
  book_new(): Workbook {
    return { sheets: [] };
  },
  book_append_sheet(workbook: Workbook, sheet: Sheet, name: string) {
    workbook.sheets.push({ name, sheet });
  },
};

export function writeFile(workbook: Workbook, filename: string) {
  void (async () => {
    const { default: ExcelJS } = await import("exceljs");
    const excelWorkbook = new ExcelJS.Workbook();

    for (const { name, sheet } of workbook.sheets) {
      const worksheet = excelWorkbook.addWorksheet(name);
      worksheet.addRows(sheet.rows);
      if (sheet.columns) {
        worksheet.columns = sheet.columns.map((column) => ({ width: column.wch ?? 16 }));
      }
      const filterMatch = sheet.autoFilter?.ref.match(/^A(\d+):[A-Z]+(\d+)$/);
      if (filterMatch) {
        worksheet.autoFilter = {
          from: { row: Number(filterMatch[1]), column: 1 },
          to: { row: Number(filterMatch[2]), column: worksheet.columnCount },
        };
      }
    }

    const buffer = await excelWorkbook.xlsx.writeBuffer();
    const blob = new Blob([new Uint8Array(buffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  })();
}
