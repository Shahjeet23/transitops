import * as XLSX from "xlsx";
import type { FinancialSummary, VehicleROIRecord, FuelEfficiencyRecord, ReportDateParams } from "./report.api";

export function exportReportsToExcel(
  summary: FinancialSummary | undefined,
  roiData: VehicleROIRecord[] | undefined,
  fuelData: FuelEfficiencyRecord[] | undefined,
  dateRange: ReportDateParams
) {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // 1. Financial Summary Sheet
  const summarySheetData = [
    ["Metric", "Amount"],
    ["Total Revenue", summary?.revenue || 0],
    ["Total Costs", summary?.costs?.total || 0],
    ["  - Expenses", summary?.costs?.breakdown?.expenses || 0],
    ["  - Fuel", summary?.costs?.breakdown?.fuel || 0],
    ["  - Maintenance", summary?.costs?.breakdown?.maintenance || 0],
    ["Net Profit", summary?.netProfit || 0],
    ["Profit Margin (%)", summary?.profitMargin || 0],
  ];
  const summaryWs = XLSX.utils.aoa_to_sheet(summarySheetData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Financial Overview");

  // 2. Vehicle ROI Sheet
  const roiSheetData = (roiData || []).map((r) => ({
    "Plate Number": r.vehicle?.plateNumber || "Unknown",
    "Vehicle Name": r.vehicle?.name || "Unknown",
    "Revenue (₹)": r.revenue,
    "Total Costs (₹)": r.totalCosts,
    "Net Profit (₹)": r.netProfit,
  }));
  const roiWs = XLSX.utils.json_to_sheet(roiSheetData);
  XLSX.utils.book_append_sheet(wb, roiWs, "Vehicle ROI");

  // 3. Fuel Efficiency Sheet
  const fuelSheetData = (fuelData || []).map((r) => ({
    "Plate Number": r.vehicle?.plateNumber || "Unknown",
    "Vehicle Name": r.vehicle?.name || "Unknown",
    "Distance (km)": r.distance,
    "Total Liters": r.totalLiters,
    "Fill Ups": r.fillUps,
    "Efficiency (km/L)": r.efficiency,
  }));
  const fuelWs = XLSX.utils.json_to_sheet(fuelSheetData);
  XLSX.utils.book_append_sheet(wb, fuelWs, "Fuel Efficiency");

  // Format Date Range for Filename
  let dateSuffix = "All_Time";
  if (dateRange.startDate && dateRange.endDate) {
    dateSuffix = `${dateRange.startDate}_to_${dateRange.endDate}`;
  } else if (dateRange.startDate) {
    dateSuffix = `From_${dateRange.startDate}`;
  } else if (dateRange.endDate) {
    dateSuffix = `Until_${dateRange.endDate}`;
  }

  // Trigger Download
  XLSX.writeFile(wb, `TransitOps_Report_${dateSuffix}.xlsx`);
}
