import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { CalendarIcon, UserIcon, LogOutIcon, SettingsIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl">
            Gestione Appuntamenti
          </Link>
          <Button asChild>
            <Link to="/auth">Accedi</Link>
          </Button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl">
          Gestione Appuntamenti
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant={isActive('/dashboard') ? 'default' : 'ghost'}
              asChild
            >
              <Link to="/dashboard">
                <UserIcon className="mr-2 h-4 w-4" />
                I miei appuntamenti
              </Link>
            </Button>
            <Button
              variant={isActive('/book') ? 'default' : 'ghost'}
              asChild
            >
              <Link to="/book">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Prenota
              </Link>
            </Button>
            {isAdmin && (
              <Button
                variant={isActive('/admin') ? 'default' : 'ghost'}
                asChild
              >
                <Link to="/admin">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Admin
                </Link>
              </Button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <UserIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{user.email}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {isAdmin ? 'Amministratore' : 'Utente'}
                </p>
              </div>
              <DropdownMenuSeparator />
              <div className="md:hidden">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="w-full">
                    <UserIcon className="mr-2 h-4 w-4" />
                    I miei appuntamenti
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/book" className="w-full">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Prenota
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="w-full">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
              </div>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Esci</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}