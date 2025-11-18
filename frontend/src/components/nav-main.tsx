"use client";

import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
}: {
  items: {
    name: string;
    href: string;
    icon: LucideIcon;
  }[];
}) {
  const pathname = usePathname();
  console.log(pathname);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem
            key={item.name}
          >
            <Link
              key={item.name}
              href={item.href}
            >
              <SidebarMenuButton
                tooltip={item.name}
                className={cn(
                  pathname === item.href
                    ? "bg-primary text-primary-foreground hover:bg-primary/80"
                    : null, "cursor-pointer"
                )}
              >
                {item.icon && <item.icon />}
                <span>{item.name}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
