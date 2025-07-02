"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFormData = exports.validateConfirmPassword = exports.validateName = exports.validatePassword = exports.validateEmail = void 0;
const validateEmail = (email) => {
    if (!email) {
        return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
    }
    return null;
};
exports.validateEmail = validateEmail;
const validatePassword = (password) => {
    if (!password) {
        return 'Password is required';
    }
    if (password.length < 8) {
        return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
        return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
        return 'Password must contain at least one lowercase letter';
    }
    if (!/\d/.test(password)) {
        return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return 'Password must contain at least one special character';
    }
    return null;
};
exports.validatePassword = validatePassword;
const validateName = (name) => {
    if (!name) {
        return 'Name is required';
    }
    if (name.trim().length < 2) {
        return 'Name must be at least 2 characters long';
    }
    if (!/^[a-zA-Z\s-]+$/.test(name)) {
        return 'Name can only contain letters, spaces, and hyphens';
    }
    return null;
};
exports.validateName = validateName;
const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) {
        return 'Please confirm your password';
    }
    if (password !== confirmPassword) {
        return 'Passwords do not match';
    }
    return null;
};
exports.validateConfirmPassword = validateConfirmPassword;
const validateFormData = (data, fields) => {
    const errors = {};
    fields.forEach((field) => {
        switch (field) {
            case 'email':
                const emailError = (0, exports.validateEmail)(data.email);
                if (emailError) {
                    errors.email = emailError;
                }
                break;
            case 'password':
                const passwordError = (0, exports.validatePassword)(data.password);
                if (passwordError) {
                    errors.password = passwordError;
                }
                break;
            case 'name':
                const nameError = (0, exports.validateName)(data.name);
                if (nameError) {
                    errors.name = nameError;
                }
                break;
            case 'confirmPassword':
                const confirmPasswordError = (0, exports.validateConfirmPassword)(data.password, data.confirmPassword);
                if (confirmPasswordError) {
                    errors.confirmPassword = confirmPasswordError;
                }
                break;
            default:
                break;
        }
    });
    return errors;
};
exports.validateFormData = validateFormData;
//# sourceMappingURL=validation.js.map