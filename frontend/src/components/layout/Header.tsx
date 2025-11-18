'use client';

import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
      {/* Search */}
      <div className="flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search predictions, patients..."
            className="pl-10"
          />
        </div>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="capitalize">
          {user?.role?.replace('_', ' ')}
        </Badge>
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            3
          </span>
        </Button>
      </div>
    </header>
  );
}