"use client";

import { useDashboard } from "@/hooks/use-dashboard";
import { AlertTriangle, Clock, FileText, ShieldAlert, Wrench, Receipt } from "lucide-react";
import { format } from "date-fns";

export default function AlertsPage() {
  const { data: dashboardData, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
        Failed to load alerts. Please try again later.
      </div>
    );
  }

  const alerts = dashboardData.alerts;
  const totalAlerts = 
    alerts.licenseExpired.length +
    alerts.licenseExpiring.length +
    alerts.insuranceExpiring.length +
    alerts.registrationExpiring.length +
    alerts.vehiclesInMaintenance.length +
    (alerts.pendingExpensesCount > 0 ? 1 : 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fleet Alerts</h1>
        <p className="text-muted-foreground mt-1">
          {totalAlerts === 0 
            ? "Your fleet is operating perfectly with zero active alerts."
            : `You have ${totalAlerts} active alert${totalAlerts === 1 ? '' : 's'} requiring attention.`}
        </p>
      </div>

      {totalAlerts === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">All Clear</h2>
          <p className="text-muted-foreground max-w-md mt-2">
            No expired licenses, pending renewals, or vehicles in maintenance. Great job keeping your fleet compliant!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* License Expired */}
          {alerts.licenseExpired.length > 0 && (
            <AlertSection 
              title="Licenses Expired" 
              icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
              className="border-destructive/30 bg-destructive/5"
            >
              <ul className="divide-y divide-border/50">
                {alerts.licenseExpired.map((driver) => (
                  <li key={driver._id} className="py-3 flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{driver.name}</p>
                      <p className="text-xs text-muted-foreground">License: {driver.licenseNumber}</p>
                    </div>
                    <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-1 rounded">
                      Expired {format(new Date(driver.licenseExpiry), 'MMM d, yyyy')}
                    </span>
                  </li>
                ))}
              </ul>
            </AlertSection>
          )}

          {/* License Expiring Soon */}
          {alerts.licenseExpiring.length > 0 && (
            <AlertSection 
              title="Licenses Expiring Soon (30 Days)" 
              icon={<Clock className="w-5 h-5 text-amber-500" />}
              className="border-amber-500/30 bg-amber-500/5"
            >
              <ul className="divide-y divide-border/50">
                {alerts.licenseExpiring.map((driver) => (
                  <li key={driver._id} className="py-3 flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{driver.name}</p>
                      <p className="text-xs text-muted-foreground">License: {driver.licenseNumber}</p>
                    </div>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-500/10 px-2 py-1 rounded">
                      Expiring {format(new Date(driver.licenseExpiry), 'MMM d, yyyy')}
                    </span>
                  </li>
                ))}
              </ul>
            </AlertSection>
          )}

          {/* Insurance Expiring Soon */}
          {alerts.insuranceExpiring.length > 0 && (
            <AlertSection 
              title="Insurance Expiring (30 Days)" 
              icon={<FileText className="w-5 h-5 text-amber-500" />}
              className="border-amber-500/30 bg-amber-500/5"
            >
              <ul className="divide-y divide-border/50">
                {alerts.insuranceExpiring.map((vehicle) => (
                  <li key={vehicle._id} className="py-3 flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{vehicle.plateNumber}</p>
                      <p className="text-xs text-muted-foreground">{vehicle.make} {vehicle.model}</p>
                    </div>
                    {vehicle.insuranceExpiry && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-500/10 px-2 py-1 rounded">
                        Expiring {format(new Date(vehicle.insuranceExpiry), 'MMM d, yyyy')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </AlertSection>
          )}

          {/* Registration Expiring Soon */}
          {alerts.registrationExpiring.length > 0 && (
            <AlertSection 
              title="Registration Expiring (30 Days)" 
              icon={<FileText className="w-5 h-5 text-amber-500" />}
              className="border-amber-500/30 bg-amber-500/5"
            >
              <ul className="divide-y divide-border/50">
                {alerts.registrationExpiring.map((vehicle) => (
                  <li key={vehicle._id} className="py-3 flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground">{vehicle.plateNumber}</p>
                      <p className="text-xs text-muted-foreground">{vehicle.make} {vehicle.model}</p>
                    </div>
                    {vehicle.registrationExpiry && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-500/10 px-2 py-1 rounded">
                        Expiring {format(new Date(vehicle.registrationExpiry), 'MMM d, yyyy')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </AlertSection>
          )}

          {/* Vehicles in Maintenance */}
          {alerts.vehiclesInMaintenance.length > 0 && (
            <AlertSection 
              title="Vehicles in Maintenance" 
              icon={<Wrench className="w-5 h-5 text-primary" />}
            >
              <ul className="divide-y divide-border/50">
                {alerts.vehiclesInMaintenance.map((vehicle) => (
                  <li key={vehicle._id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">{vehicle.plateNumber}</p>
                      <p className="text-xs text-muted-foreground">{vehicle.make} {vehicle.model}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                      In Shop
                    </span>
                  </li>
                ))}
              </ul>
            </AlertSection>
          )}

          {/* Pending Expenses */}
          {alerts.pendingExpensesCount > 0 && (
            <AlertSection 
              title="Pending Expenses" 
              icon={<Receipt className="w-5 h-5 text-amber-500" />}
              className="border-amber-500/30 bg-amber-500/5"
            >
              <div className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Expenses requiring approval</p>
                  <p className="text-xs text-muted-foreground">Check the expenses tab to review</p>
                </div>
                <span className="text-lg font-bold text-amber-600">
                  {alerts.pendingExpensesCount}
                </span>
              </div>
            </AlertSection>
          )}

        </div>
      )}
    </div>
  );
}

function AlertSection({ 
  title, 
  icon, 
  children, 
  className = "" 
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-5 rounded-xl border border-border bg-card ${className}`}>
      <div className="flex items-center gap-3 mb-4 border-b border-border/50 pb-3">
        {icon}
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}
