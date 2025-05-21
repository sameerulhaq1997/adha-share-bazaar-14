
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted mt-auto py-8">
      <div className="container px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/lovable-uploads/logo.png" alt="Qurbani Connect Logo" className="h-10 w-auto" />
              <h3 className="font-bold text-lg">Qurbani Connect</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Facilitating the sacred tradition of Qurbani with care, transparency, and adherence to Islamic principles.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/animals" className="text-muted-foreground hover:text-foreground transition-colors">
                  Animals
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <address className="not-italic text-muted-foreground">
              <p>123 Eid Street</p>
              <p>Madina District</p>
              <p>Email: info@qurbaniconnect.com</p>
              <p>Phone: +1 (555) 123-4567</p>
            </address>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {currentYear} Qurbani Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
