"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const link_1 = __importDefault(require("next/link"));
const router_1 = require("next/router");
const UserContext_1 = require("../contexts/UserContext");
const Navbar_module_css_1 = __importDefault(require("../styles/Navbar.module.css"));
const Navbar = () => {
    const { user, logout } = (0, react_1.useContext)(UserContext_1.UserContext);
    const router = (0, router_1.useRouter)();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = (0, react_1.useState)(false);
    const handleLogout = async () => {
        await logout();
        setIsMobileMenuOpen(false);
        router.push('/login');
    };
    const toggleMobileMenu = async () => {
        await setIsMobileMenuOpen(!isMobileMenuOpen);
    };
    const closeMobileMenu = async () => {
        await setIsMobileMenuOpen(false);
    };
    return (<nav className={Navbar_module_css_1.default.navbar}>
      <div className={Navbar_module_css_1.default.container}>
        <link_1.default href="/" className={Navbar_module_css_1.default.logo}>
          Your App
        </link_1.default>

        
        <button className={Navbar_module_css_1.default.mobileMenuButton} onClick={toggleMobileMenu} aria-label="Toggle menu" aria-expanded={isMobileMenuOpen}>
          <span className={Navbar_module_css_1.default.hamburger}></span>
        </button>

        
        <div className={Navbar_module_css_1.default.desktopNav}>
          <div className={Navbar_module_css_1.default.navLinks}>
            <link_1.default href="/" className={router.pathname === '/' ? Navbar_module_css_1.default.active : ''}>
              Home
            </link_1.default>
            {user ? (<>
                <link_1.default href="/dashboard" className={router.pathname === '/dashboard' ? Navbar_module_css_1.default.active : ''}>
                  Dashboard
                </link_1.default>
                <link_1.default href="/profile" className={router.pathname === '/profile' ? Navbar_module_css_1.default.active : ''}>
                  Profile
                </link_1.default>
              </>) : (<>
                <link_1.default href="/about" className={router.pathname === '/about' ? Navbar_module_css_1.default.active : ''}>
                  About
                </link_1.default>
                <link_1.default href="/contact" className={router.pathname === '/contact' ? Navbar_module_css_1.default.active : ''}>
                  Contact
                </link_1.default>
              </>)}
          </div>

          <div className={Navbar_module_css_1.default.authButtons}>
            {user ? (<div className={Navbar_module_css_1.default.userMenu}>
                <span className={Navbar_module_css_1.default.userName}>Welcome, {user.name}</span>
                <button onClick={handleLogout} className={Navbar_module_css_1.default.logoutButton}>
                  Logout
                </button>
              </div>) : (<div className={Navbar_module_css_1.default.authLinks}>
                <link_1.default href="/login" className={Navbar_module_css_1.default.loginButton}>
                  Login
                </link_1.default>
                <link_1.default href="/register" className={Navbar_module_css_1.default.registerButton}>
                  Register
                </link_1.default>
              </div>)}
          </div>
        </div>

        
        <div className={`${Navbar_module_css_1.default.mobileNav} ${isMobileMenuOpen ? Navbar_module_css_1.default.open : ''}`}>
          <div className={Navbar_module_css_1.default.mobileNavLinks}>
            <link_1.default href="/" className={router.pathname === '/' ? Navbar_module_css_1.default.active : ''} onClick={closeMobileMenu}>
              Home
            </link_1.default>
            {user ? (<>
                <link_1.default href="/dashboard" className={router.pathname === '/dashboard' ? Navbar_module_css_1.default.active : ''} onClick={closeMobileMenu}>
                  Dashboard
                </link_1.default>
                <link_1.default href="/profile" className={router.pathname === '/profile' ? Navbar_module_css_1.default.active : ''} onClick={closeMobileMenu}>
                  Profile
                </link_1.default>
              </>) : (<>
                <link_1.default href="/about" className={router.pathname === '/about' ? Navbar_module_css_1.default.active : ''} onClick={closeMobileMenu}>
                  About
                </link_1.default>
                <link_1.default href="/contact" className={router.pathname === '/contact' ? Navbar_module_css_1.default.active : ''} onClick={closeMobileMenu}>
                  Contact
                </link_1.default>
              </>)}
            {user ? (<button onClick={handleLogout} className={Navbar_module_css_1.default.mobileLogoutButton}>
                Logout
              </button>) : (<>
                <link_1.default href="/login" className={Navbar_module_css_1.default.mobileAuthButton} onClick={closeMobileMenu}>
                  Login
                </link_1.default>
                <link_1.default href="/register" className={Navbar_module_css_1.default.mobileAuthButton} onClick={closeMobileMenu}>
                  Register
                </link_1.default>
              </>)}
          </div>
        </div>
      </div>
    </nav>);
};
exports.default = Navbar;
//# sourceMappingURL=Navbar.jsx.map