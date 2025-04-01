
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown, User, Video, BookOpen, Home, Info, Newspaper, Users, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Define types for navigation links
  type NavLink = {
    name: string;
    path: string;
    icon: React.ReactNode;
    dropdown?: { name: string; path: string }[];
  };

  // Public navigation links (shown when user is not logged in)
  const publicNavLinks: NavLink[] = [
    { name: 'Home', path: '/', icon: <Home className="h-4 w-4 mr-2" /> },
    { name: 'Courses', path: '/courses', icon: <BookOpen className="h-4 w-4 mr-2" /> },
    { name: 'About', path: '/about', icon: <Info className="h-4 w-4 mr-2" /> },
    { 
      name: 'Resources',
      path: '#',
      icon: <Newspaper className="h-4 w-4 mr-2" />,
      dropdown: [
        { name: 'Blog', path: '/blog' },
        { name: 'Documentation', path: '/docs' },
        { name: 'Community', path: '/community' },
      ] 
    },
  ];

  // Authenticated user navigation links
  const authNavLinks: NavLink[] = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home className="h-4 w-4 mr-2" /> },
    { name: 'My Learning', path: '/learning', icon: <BookOpen className="h-4 w-4 mr-2" /> },
    { name: 'My Courses', path: '/my-courses', icon: <Video className="h-4 w-4 mr-2" /> },
    { name: 'Certificates', path: '/certificates', icon: <Award className="h-4 w-4 mr-2" /> },
    { name: 'Browse Courses', path: '/courses', icon: <Users className="h-4 w-4 mr-2" /> },
  ];

  // Use the appropriate navigation links based on authentication status
  const navLinks = user ? authNavLinks : publicNavLinks;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-subtle' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="inline-block w-8 h-8 bg-primary rounded-md"></span>
            <span className="text-xl font-medium">RuraLearn</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              link.dropdown ? (
                <div key={link.name} className="relative group">
                  <button className="flex items-center text-foreground/80 hover:text-foreground transition-colors py-2">
                    {link.icon}
                    {link.name}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                  <div className="absolute left-0 mt-2 w-48 origin-top-left rounded-md overflow-hidden shadow-elevated bg-white dark:bg-black border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                    <div className="p-2 space-y-1">
                      {link.dropdown.map((dropdownLink) => (
                        <Link 
                          key={dropdownLink.name} 
                          to={dropdownLink.path} 
                          className="block px-4 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
                        >
                          {dropdownLink.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className={`flex items-center text-foreground/80 hover:text-foreground transition-colors ${
                    location.pathname === link.path ? 'text-foreground font-medium' : ''
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              )
            ))}
          </nav>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0 bg-primary/10 hover:bg-primary/20">
                    <User className="h-5 w-5 text-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium border-b border-border mb-1">
                    {user.email}
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer w-full">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/learning" className="cursor-pointer w-full">My Learning</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/certificates" className="cursor-pointer w-full">Certificates</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="text-red-500 cursor-pointer">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="ghost" size="sm" className="button-animation">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="button-animation">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-foreground hover:bg-secondary transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden ${
          isMenuOpen ? 'max-h-screen opacity-100 visible' : 'max-h-0 opacity-0 invisible'
        } transition-all duration-300 ease-in-out overflow-hidden bg-background border-t border-border`}
      >
        <div className="container mx-auto px-4 py-4 space-y-4">
          {/* Regular nav links */}
          {navLinks.map((link) => (
            <div key={link.name}>
              {link.dropdown ? (
                <div className="space-y-2">
                  <div className="font-medium flex items-center">
                    {link.icon}
                    {link.name}
                  </div>
                  <div className="pl-4 space-y-2 border-l border-border">
                    {link.dropdown.map((dropdownLink) => (
                      <Link 
                        key={dropdownLink.name} 
                        to={dropdownLink.path} 
                        className="block py-1 text-foreground/80 hover:text-foreground transition-colors"
                      >
                        {dropdownLink.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className={`flex items-center py-2 text-foreground/80 hover:text-foreground transition-colors ${
                    location.pathname === link.path ? 'text-foreground font-medium' : ''
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              )}
            </div>
          ))}

          {/* Auth links for mobile */}
          {user ? (
            <>
              <div className="pt-4 border-t border-border">
                <div className="font-medium mb-2">Account</div>
                <div className="text-sm text-muted-foreground mb-4">{user.email}</div>
                <button 
                  onClick={signOut}
                  className="block w-full text-left py-2 pl-2 text-red-500 hover:text-red-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-4 space-y-3 border-t border-border">
              <Link to="/signin" className="block">
                <Button variant="outline" size="sm" className="w-full button-animation">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup" className="block">
                <Button size="sm" className="w-full button-animation">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
