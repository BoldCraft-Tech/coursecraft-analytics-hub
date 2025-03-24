
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand & Description */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="inline-block w-8 h-8 bg-primary rounded-md"></span>
              <span className="text-xl font-medium">RuraLearn</span>
            </Link>
            <p className="text-muted-foreground text-sm md:text-base">
              Bringing quality education to rural communities through accessible, engaging online learning experiences.
            </p>
          </div>
          
          {/* Links */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/careers" className="text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link to="/press" className="text-muted-foreground hover:text-foreground transition-colors">Press</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/courses" className="text-muted-foreground hover:text-foreground transition-colors">Courses</Link></li>
              <li><Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link to="/guides" className="text-muted-foreground hover:text-foreground transition-colors">Guides</Link></li>
              <li><Link to="/community" className="text-muted-foreground hover:text-foreground transition-colors">Community</Link></li>
            </ul>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
              <li><Link to="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">Cookies</Link></li>
              <li><Link to="/licenses" className="text-muted-foreground hover:text-foreground transition-colors">Licenses</Link></li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4">Stay Updated</h4>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Subscribe to our newsletter for updates.</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-3 py-2 text-sm rounded-l-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full"
                />
                <button className="bg-primary text-white px-3 py-2 rounded-r-md hover:bg-primary/90 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} RuraLearn. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <span className="sr-only">Instagram</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <span className="sr-only">YouTube</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
