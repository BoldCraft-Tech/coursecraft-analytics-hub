
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown, User } from 'lucide-react';
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

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'About', path: '/about' },
    { 
      name: 'Resources',
      path: '#',
      dropdown: [
        { name: 'Blog', path: '/blog' },
        { name: 'Documentation', path: '/docs' },
        { name: 'Community', path: '/community' },
      ] 
    },
  ];

  const authLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My Learning', path: '/learning' },
    { name: 'My Courses', path: '/my-courses' },
    { name: 'Certificates', path: '/certificates' },
  ];

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
                  className={`text-foreground/80 hover:text-foreground transition-colors ${
                    location.pathname === link.path ? 'text-foreground font-medium' : ''
                  }`}
                >
                  {link.name}
                </Link>
              )
            ))}

            {/* Show these links only when user is authenticated */}
            {user && authLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`text-foreground/80 hover:text-foreground transition-colors ${
                  location.pathname === link.path ? 'text-foreground font-medium' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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
                  <div className="font-medium">{link.name}</div>
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
                  className={`block py-2 text-foreground/80 hover:text-foreground transition-colors ${
                    location.pathname === link.path ? 'text-foreground font-medium' : ''
                  }`}
                >
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
                {authLinks.map((link) => (
                  <Link 
                    key={link.name}
                    to={link.path}
                    className="block py-2 pl-2 text-foreground/80 hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
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
