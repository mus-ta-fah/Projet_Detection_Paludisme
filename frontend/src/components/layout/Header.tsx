"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../shared/ThemeToggle";

export function Header() {
  const pathname = usePathname();

  // Helper to capitalize breadcrumb segments
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <header className="w-full flex h-16 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          {/* Instead of putting <div> or <BreadcrumbSeparator> inside <BreadcrumbItem> (which renders <li>), 
            render only valid children directly under <BreadcrumbList>.
            We never put <li> inside another <li>.
          */}
          <BreadcrumbList>
            {(() => {
              const segments = pathname.split("/").filter(Boolean);
              if (segments.length === 0) {
                return (
                  <BreadcrumbItem>
                    <BreadcrumbPage>home</BreadcrumbPage>
                  </BreadcrumbItem>
                );
              }
              return segments.map((segment, idx) => {
                // href for each segment
                const href = '/' + segments.slice(0, idx + 1).join('/');
                const isLast = idx === segments.length - 1;

                // Only output BreadcrumbSeparator between items, not inside items
                return (
                  <span key={href} className="flex items-center">
                    {!isLast ? (
                      <>
                        <BreadcrumbItem>
                          <div className="hidden md:block">
                            <BreadcrumbLink href={href}>
                              {capitalize(segment)}
                            </BreadcrumbLink>
                          </div>
                          <span className="block md:hidden">
                            <BreadcrumbLink href={href}>{capitalize(segment)}</BreadcrumbLink>
                          </span>
                        </BreadcrumbItem>
                        {/* Separator directly in the list, not inside BreadcrumbItem */}
                        <BreadcrumbSeparator className="hidden md:block" />
                      </>
                    ) : (
                      <BreadcrumbItem>
                        <BreadcrumbPage>{capitalize(segment)}</BreadcrumbPage>
                      </BreadcrumbItem>
                    )}
                  </span>
                );
              });
            })()}
          </BreadcrumbList>
        </Breadcrumb>
        {/* Search */}
        <div className="flex-1 ml-auto w-full max-w-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search predictions, patients..."
              className="pl-10"
            />
          </div>
        </div>
      <ThemeToggle/>
      </div>
    </header>
  );
}
