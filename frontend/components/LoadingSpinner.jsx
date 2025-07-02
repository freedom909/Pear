"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const LoadingSpinner_module_css_1 = __importDefault(require("./LoadingSpinner.module.css"));
const LoadingSpinner = ({ size = 'medium', color = 'primary', className = '', }) => {
    const spinnerClasses = [
        LoadingSpinner_module_css_1.default.spinner,
        LoadingSpinner_module_css_1.default[`spinner-${size}`],
        LoadingSpinner_module_css_1.default[`spinner-${color}`],
        className,
    ]
        .filter(Boolean)
        .join(' ');
    return (<div className={spinnerClasses} role="status" aria-label="Loading">
      <span className={LoadingSpinner_module_css_1.default.visuallyHidden}>Loading...</span>
    </div>);
};
exports.default = LoadingSpinner;
//# sourceMappingURL=LoadingSpinner.jsx.map