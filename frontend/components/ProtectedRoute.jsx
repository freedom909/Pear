"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withProtection = void 0;
const react_1 = require("react");
const router_1 = require("next/router");
const UserContext_1 = require("../contexts/UserContext");
const LoadingSpinner_1 = __importDefault(require("../components/LoadingSpinner"));
const ProtectedRoute = ({ children, allowedRoles = [], }) => {
    const { user, loading } = (0, UserContext_1.useUser)();
    const router = (0, router_1.useRouter)();
    const [isChecking, setIsChecking] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        if (!loading) {
            if (!user) {
                router.push({
                    pathname: '/login',
                    query: { redirect: router.asPath },
                });
            }
            else if (allowedRoles.length > 0 &&
                user.role &&
                !allowedRoles.includes(user.role)) {
                router.push('/unauthorized');
            }
            else {
                setIsChecking(false);
            }
        }
    }, [user, loading, router, allowedRoles]);
    if (loading || isChecking) {
        return (<div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner_1.default size="large"/>
      </div>);
    }
    return <>{children}</>;
};
exports.default = ProtectedRoute;
const withProtection = (Component, allowedRoles = []) => {
    const ProtectedComponent = (props) => (<ProtectedRoute allowedRoles={allowedRoles}>
      <Component {...props}/>
    </ProtectedRoute>);
    if ('getInitialProps' in Component) {
        ProtectedComponent.getInitialProps = Component.getInitialProps;
    }
    return ProtectedComponent;
};
exports.withProtection = withProtection;
//# sourceMappingURL=ProtectedRoute.jsx.map