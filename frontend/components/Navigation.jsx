"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = require("next/router");
const link_1 = __importDefault(require("next/link"));
const UserContext_1 = require("../contexts/UserContext");
const Navigation_module_css_1 = __importDefault(require("./Navigation.module.css"));
const Navigation = () => {
    const router = (0, router_1.useRouter)();
    const { user, loading, logout } = (0, UserContext_1.useUser)();
    const handleLogout = async () => {
        await logout()
            .then(() => router.push('/'))
            .catch(() => { });
    };
    return (<nav className={Navigation_module_css_1.default.nav}>
      <div className={Navigation_module_css_1.default.container}>
        <link_1.default href="/">
          <span className={Navigation_module_css_1.default.logo}>Pear</span>
        </link_1.default>

        <div className={Navigation_module_css_1.default.links}>
          {!loading && (<>
              {user ? (<>
                  <link_1.default href="/dashboard">
                    <span className={`${Navigation_module_css_1.default.link} ${router.pathname === '/dashboard' ? Navigation_module_css_1.default.active : ''}`}>
                      Dashboard
                    </span>
                  </link_1.default>
                  <button onClick={handleLogout} className={Navigation_module_css_1.default.logoutButton}>
                    Logout
                  </button>
                </>) : (<link_1.default href="/">
                  <span className={`${Navigation_module_css_1.default.link} ${router.pathname === '/' ? Navigation_module_css_1.default.active : ''}`}>
                    Login
                  </span>
                </link_1.default>)}
            </>)}
        </div>
      </div>
    </nav>);
};
exports.default = Navigation;
//# sourceMappingURL=Navigation.jsx.map