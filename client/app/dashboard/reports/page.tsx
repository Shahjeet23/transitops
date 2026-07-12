"use client";

import { useState } from "react";
import { Filter, Download } from "lucide-react";
import { FinancialSummaryCards } from "@/components/reports/financial-summary-cards";
import { ROIChart } from "@/components/reports/roi-chart";
import { FuelEfficiencyChart } from "@/components/reports/fuel-efficiency-chart";
import { exportReportsToExcel } from "@/lib/export-excel";
import {
  useFinancialSummary,
  useVehicleROI,
  useFuelEfficiency,
} from "@/hooks/use-report";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const { data: summaryData, isLoading: summaryLoading } = useFinancialSummary(dateRange);
  const { data: roiData, isLoading: roiLoading } = useVehicleROI(dateRange);
  const { data: fuelData, isLoading: fuelLoading } = useFuelEfficiency(dateRange);

  const handleExport = () => {
    exportReportsToExcel(
      summaryData?.data,
      roiData?.data,
      fuelData?.data,
      dateRange
    );
  };

  const isExportDisabled = summaryLoading || roiLoading || fuelLoading || !summaryData?.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive financial and operational insights.
          </p>
        </div>
        
        {/* Date Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2 bg-card p-2 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-2 px-2 text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {(dateRange.startDate || dateRange.endDate) && (
              <button
                onClick={() => setDateRange({ startDate: "", endDate: "" })}
                className="text-xs text-muted-foreground hover:text-foreground px-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExportDisabled}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full sm:w-auto justify-center"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      {/* KPI Cards */}
      <FinancialSummaryCards 
        data={summaryData?.data} 
        isLoading={summaryLoading} 
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ROIChart 
          data={roiData?.data || []} 
          isLoading={roiLoading} 
        />
        <FuelEfficiencyChart 
          data={fuelData?.data || []} 
          isLoading={fuelLoading} 
        />
      </div>
    </div>
  );
}
