"use client";

import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/use-notifications";
import { format } from "date-fns";
import { Bell, Truck, Wrench, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function AlertsPage() {
  const { data, isLoading } = useNotifications({ limit: 50 });
  const { mutate: markAsRead, isPending: markingRead } = useMarkNotificationRead();
  const { mutate: markAllAsRead, isPending: markingAll } = useMarkAllNotificationsRead();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading alerts...</div>;
  }

  const notifications = data?.data || [];
  const unreadCount = data?.meta?.unreadCount || 0;

  const getIcon = (type: string) => {
    switch (type) {
      case "trip": return <Truck className="w-5 h-5 text-blue-500" />;
      case "maintenance": return <Wrench className="w-5 h-5 text-orange-500" />;
      case "system": return <AlertTriangle className="w-5 h-5 text-destructive" />;
      default: return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Alerts & Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated with system events and phase transitions.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            disabled={markingAll}
            className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {markingAll ? "Marking..." : "Mark All Read"}
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <Bell className="w-12 h-12 mb-4 opacity-20" />
            <p>You have no notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n: any) => (
              <div 
                key={n._id} 
                className={`p-5 flex gap-4 transition-colors cursor-pointer ${!n.isRead ? "bg-primary/5" : "hover:bg-muted/30"}`}
                onClick={() => {
                  if (!n.isRead && !markingRead) markAsRead(n._id);
                }}
              >
                <div className={`mt-0.5 p-2 rounded-full h-fit shrink-0 ${!n.isRead ? "bg-background shadow-sm" : "bg-muted"}`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm tracking-tight ${!n.isRead ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>
                      {n.title}
                    </h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(n.createdAt), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${!n.isRead ? "text-foreground/90" : "text-muted-foreground"}`}>
                    {n.message}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="flex items-center justify-center pl-2">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-sm" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
