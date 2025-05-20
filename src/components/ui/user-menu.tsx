"use client";
import { useUser } from '@/lib/user-context';
import { useRouter } from 'next/navigation';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './dropdown-menu';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function UserMenu() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    router.replace('/login');
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-2">
          {user.email}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem asChild>
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout} disabled={loading}>
            {loading ? 'Logging out...' : 'Logout'}
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 