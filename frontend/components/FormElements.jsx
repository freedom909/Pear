"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Textarea = exports.Select = exports.Checkbox = exports.FormSection = exports.Form = exports.Button = exports.Input = void 0;
const react_1 = __importDefault(require("react"));
const FormElements_module_css_1 = __importDefault(require("./FormElements.module.css"));
const Input = ({ id, label, type = 'text', value, onChange, error, placeholder = '', required = false, autoComplete = 'on', }) => {
    return (<div className={FormElements_module_css_1.default.formGroup}>
      <label htmlFor={id} className={FormElements_module_css_1.default.label}>
        {label} {required && <span className={FormElements_module_css_1.default.required}>*</span>}
      </label>
      <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} className={`${FormElements_module_css_1.default.input} ${error ? FormElements_module_css_1.default.inputError : ''}`} required={required} autoComplete={autoComplete}/>
      {error && <div className={FormElements_module_css_1.default.errorMessage}>{error}</div>}
    </div>);
};
exports.Input = Input;
const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false, fullWidth = false, className = '', }) => {
    return (<button type={type} onClick={onClick} disabled={disabled} className={`${FormElements_module_css_1.default.button} ${FormElements_module_css_1.default[variant]} ${fullWidth ? FormElements_module_css_1.default.fullWidth : ''} ${className}`}>
      {children}
    </button>);
};
exports.Button = Button;
const Form = ({ children, onSubmit, className = '', }) => {
    return (<form onSubmit={onSubmit} className={`${FormElements_module_css_1.default.form} ${className}`}>
      {children}
    </form>);
};
exports.Form = Form;
const FormSection = ({ title, description, children, }) => {
    return (<div className={FormElements_module_css_1.default.formSection}>
      {title && <h2 className={FormElements_module_css_1.default.sectionTitle}>{title}</h2>}
      {description && (<p className={FormElements_module_css_1.default.sectionDescription}>{description}</p>)}
      {children}
    </div>);
};
exports.FormSection = FormSection;
const Checkbox = ({ id, label, checked, onChange, error, }) => {
    return (<div className={FormElements_module_css_1.default.checkboxGroup}>
      <div className={FormElements_module_css_1.default.checkboxWrapper}>
        <input id={id} type="checkbox" checked={checked} onChange={onChange} className={FormElements_module_css_1.default.checkbox}/>
        <label htmlFor={id} className={FormElements_module_css_1.default.checkboxLabel}>
          {label}
        </label>
      </div>
      {error && <div className={FormElements_module_css_1.default.errorMessage}>{error}</div>}
    </div>);
};
exports.Checkbox = Checkbox;
const Select = ({ id, label, value, onChange, options, error, required = false, }) => {
    return (<div className={FormElements_module_css_1.default.formGroup}>
      <label htmlFor={id} className={FormElements_module_css_1.default.label}>
        {label} {required && <span className={FormElements_module_css_1.default.required}>*</span>}
      </label>
      <select id={id} value={value} onChange={onChange} className={`${FormElements_module_css_1.default.select} ${error ? FormElements_module_css_1.default.inputError : ''}`} required={required}>
        {options.map((option) => (<option key={option.value} value={option.value}>
            {option.label}
          </option>))}
      </select>
      {error && <div className={FormElements_module_css_1.default.errorMessage}>{error}</div>}
    </div>);
};
exports.Select = Select;
const Textarea = ({ id, label, value, onChange, error, placeholder = '', required = false, rows = 4, }) => {
    return (<div className={FormElements_module_css_1.default.formGroup}>
      <label htmlFor={id} className={FormElements_module_css_1.default.label}>
        {label} {required && <span className={FormElements_module_css_1.default.required}>*</span>}
      </label>
      <textarea id={id} value={value} onChange={onChange} placeholder={placeholder} className={`${FormElements_module_css_1.default.textarea} ${error ? FormElements_module_css_1.default.inputError : ''}`} required={required} rows={rows}/>
      {error && <div className={FormElements_module_css_1.default.errorMessage}>{error}</div>}
    </div>);
};
exports.Textarea = Textarea;
//# sourceMappingURL=FormElements.jsx.map