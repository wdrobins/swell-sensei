import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Waves, MapPin, Calendar, BookOpen, Settings, User, LogOut, LogIn, BarChart3 } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const navItems = [
    { href: '/', label: 'Dashboard', icon: Waves },
    { href: '/spots', label: 'Spots', icon: MapPin },
    { href: '/plan', label: 'Plan Session', icon: Calendar },
    { href: '/logs', label: 'Session Log', icon: BookOpen },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
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
              <span className="font-bold text-foreground">🏄‍♂️</span>
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

          {/* Auth Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            ) : (
              <Button 
                asChild
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-foreground"
              >
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;