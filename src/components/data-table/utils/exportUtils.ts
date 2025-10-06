import * as XLSX from "xlsx";
import { ExportConfig } from "@/types/tableTypes";

/**
 * Export data to CSV format
 */
export function exportToCSV<T extends Record<string, any>>(
  config: Omit<ExportConfig<T>, "format">
): void {
  const { filename, data, columns, columnLabels } = config;

  // Prepare data for export
  const exportData = prepareExportData(data, columns, columnLabels);

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Generate and download CSV
  XLSX.writeFile(workbook, `${filename}.csv`, { bookType: "csv" });
}

/**
 * Export data to Excel format (.xlsx)
 */
export function exportToExcel<T extends Record<string, any>>(
  config: Omit<ExportConfig<T>, "format">
): void {
  const { filename, data, columns, columnLabels } = config;

  // Prepare data for export
  const exportData = prepareExportData(data, columns, columnLabels);

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Auto-size columns
  const maxWidths: Record<string, number> = {};
  exportData.forEach((row) => {
    Object.keys(row).forEach((key) => {
      const value = String(row[key] || "");
      maxWidths[key] = Math.max(maxWidths[key] || 0, value.length, key.length);
    });
  });

  worksheet["!cols"] = Object.keys(maxWidths).map((key) => ({
    wch: Math.min(maxWidths[key] + 2, 50), // Max width 50
  }));

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Generate and download Excel file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Export data to JSON format
 */
export function exportToJSON<T extends Record<string, any>>(
  config: Omit<ExportConfig<T>, "format">
): void {
  const { filename, data, columns, columnLabels } = config;

  // Prepare data for export
  const exportData = prepareExportData(data, columns, columnLabels);

  // Convert to JSON string
  const jsonString = JSON.stringify(exportData, null, 2);

  // Create blob and download
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Prepare data for export by filtering columns and applying labels
 */
function prepareExportData<T extends Record<string, any>>(
  data: T[],
  columns?: (keyof T)[],
  columnLabels?: Partial<Record<keyof T, string>>
): Record<string, any>[] {
  return data.map((row) => {
    const exportRow: Record<string, any> = {};

    // If columns are specified, only include those
    const keysToInclude = columns || (Object.keys(row) as (keyof T)[]);

    keysToInclude.forEach((key) => {
      const label = columnLabels?.[key] || String(key);
      const value = row[key];

      // Handle different value types
      if (value === null || value === undefined) {
        exportRow[label] = "";
      } else if (typeof value === "object") {
        // Handle nested objects (like billingAddress)
        if (Array.isArray(value)) {
          exportRow[label] = value.join(", ");
        } else if ((value as any) instanceof Date) {
          exportRow[label] = value.toISOString();
        } else {
          exportRow[label] = JSON.stringify(value);
        }
      } else {
        exportRow[label] = value;
      }
    });

    return exportRow;
  });
}

/**
 * Generic export function that dispatches to the appropriate format handler
 */
export function exportTable<T extends Record<string, any>>(
  config: ExportConfig<T>
): void {
  switch (config.format) {
    case "csv":
      exportToCSV(config);
      break;
    case "excel":
      exportToExcel(config);
      break;
    case "json":
      exportToJSON(config);
      break;
    default:
      console.error(`Unsupported export format: ${config.format}`);
  }
}
