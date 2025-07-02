"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const SuccessMessage_module_css_1 = __importDefault(require("./SuccessMessage.module.css"));
const SuccessMessage = ({ message, variant = 'default', onDismiss, }) => {
    if (!message) {
        return null;
    }
    return (<div className={`${SuccessMessage_module_css_1.default.successContainer} ${SuccessMessage_module_css_1.default[variant]}`}>
      <div className={SuccessMessage_module_css_1.default.iconContainer}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={SuccessMessage_module_css_1.default.icon}>
          <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" clipRule="evenodd"/>
        </svg>
      </div>
      <div className={SuccessMessage_module_css_1.default.messageContainer}>
        <p className={SuccessMessage_module_css_1.default.message}>{message}</p>
      </div>
      {onDismiss && (<button className={SuccessMessage_module_css_1.default.dismissButton} onClick={onDismiss} aria-label="Dismiss success message">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={SuccessMessage_module_css_1.default.dismissIcon}>
            <path fillRule="evenodd" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" clipRule="evenodd"/>
          </svg>
        </button>)}
    </div>);
};
exports.default = SuccessMessage;
//# sourceMappingURL=SuccessMessage.jsx.map