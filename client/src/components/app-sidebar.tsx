import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { BarChart3, Zap, FolderOpen, Activity, Bell, Settings, ExternalLink, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3, badge: null },
  { title: "Projects", url: "/projects", icon: FolderOpen, badge: null },
  { title: "Request Log", url: "/requests", icon: Activity, badge: null },
  { title: "Rate Limits", url: "/rate-limits", icon: Zap, badge: "Live" },
  { title: "Alerts", url: "/alerts", icon: Bell, badge: null },
];

const bottomItems = [
  { title: "Setup Guide", url: "/setup", icon: ExternalLink },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-5 border-b border-sidebar-border">
        <Link href="/">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-sm leading-none text-sidebar-foreground">ClaudeTrack</div>
              <div className="text-xs text-muted-foreground mt-0.5">Usage Intelligence</div>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url || (item.url !== "/dashboard" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      data-active={isActive}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                    >
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <Badge className="text-xs px-1.5 py-0 h-5 bg-primary/20 text-primary border-0">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      data-active={isActive}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                    >
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3 h-3 text-green-500" />
          <span>Keys encrypted at rest</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
