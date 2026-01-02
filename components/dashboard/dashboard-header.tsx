
'use client';

import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Eye, LogOut, Settings, User, Bell } from 'lucide-react';

interface DashboardHeaderProps {
  user: any;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-purple-500/30">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="relative w-10 h-10">
              <Image
                src="https://static.abacusaicdn.net/images/8b3c86df-3ee5-498b-b24a-abe5f9430807.jpg"
                alt="OBSERVADOR 4D"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                OBSERVADOR 4D
              </h1>
              <p className="text-sm text-slate-400">Perspectiva Dimensional Superior</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-purple-300">
              <Bell className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-purple-300">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-slate-800/50">
                <Avatar className="h-8 w-8 border-2 border-purple-500/30">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-cyan-500 text-white text-sm font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'O'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-white">{user?.name || 'Observador'}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-700">
              <DropdownMenuItem className="text-slate-300 hover:bg-slate-800 focus:bg-slate-800">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-300 hover:bg-slate-800 focus:bg-slate-800">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-red-400 hover:bg-red-900/20 focus:bg-red-900/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
