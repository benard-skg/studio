
"use client";

import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, UserCircle2, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation'; // Import useRouter

export function UserAvatarDropdown() {
  const { user, signOutUser, loading: authLoading } = useAuth();
  const router = useRouter(); // Initialize router

  if (authLoading) {
    return <Button variant="ghost" size="icon" disabled><Loader2 className="h-5 w-5 animate-spin" /></Button>;
  }

  if (!user) {
    return null; 
  }

  const userInitial = user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle2 className="h-5 w-5" />;

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/'); // Redirect to homepage after sign out
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-9 w-9 border border-border">
            {user.photoURL ? (
              <AvatarImage src={user.photoURL} alt={user.displayName || "User Avatar"} />
            ) : null}
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
