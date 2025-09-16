import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth';
import AuthDialog from './AuthDialog';
import { Waves, MapPin, Calendar, BookOpen, Settings, User } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { href: '/', label: 'Dashboard', icon: Waves },
    { href: '/spots', label: 'Spots', icon: MapPin },
    { href: '/plan', label: 'Plan Session', icon: Calendar },
    { href: '/logs', label: 'Session Log', icon: BookOpen },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-ocean rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Waves className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-foreground">SCSA</span>
              <Badge variant="secondary" className="ml-2 text-xs">Beta</Badge>
            </div>
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className={`transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-wave' 
                      : 'hover:bg-accent/20 hover:text-accent-foreground'
                  }`}
                >
                  <Link to={item.href} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            {navItems.slice(0, 3).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                >
                  <Link to={item.href}>
                    <Icon className="h-4 w-4" />
                  </Link>
                </Button>
              );
            })}
          </div>

          {/* Settings */}
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;