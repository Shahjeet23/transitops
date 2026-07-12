export type Role = 'admin' | 'fleet_manager' | 'dispatcher' | 'safety_officer' | 'financial_analyst';

export const PERMISSIONS = {
  view_reports: ['admin', 'fleet_manager', 'financial_analyst'],
  manage_vehicles: ['admin', 'fleet_manager'],
  manage_drivers: ['admin', 'fleet_manager'],
  manage_trips: ['admin', 'fleet_manager', 'dispatcher'],
  delete_trips: ['admin'],
  manage_maintenance: ['admin', 'fleet_manager', 'safety_officer'],
  manage_fuel: ['admin', 'fleet_manager', 'dispatcher'],
  manage_expenses: ['admin', 'financial_analyst'],
} as const;

export function hasPermission(userRole: string | undefined, action: keyof typeof PERMISSIONS): boolean {
  if (!userRole) return false;
  return (PERMISSIONS[action] as readonly string[]).includes(userRole);
}
