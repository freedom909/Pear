/**
 * Form data interface
 */
export interface FormData {
  email?: string;
  password?: string;
  name?: string;
  confirmPassword?: string;
  [key: string]: any;
}

/**
 * Validation errors interface
 */
export interface ValidationErrors {
  email?: string;
  password?: string;
  name?: string;
  confirmPassword?: string;
  [key: string]: string | undefined;
}

/**
 * Validates an email address
 * @param email - The email address to validate
 * @returns Error message if invalid, null if valid
 */
export const validateEmail = (email?: string): string | null => {
  if (!email) {
    return 'Email is required';
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }

  return null;
};

/**
 * Validates a password
 * @param password - The password to validate
 * @returns Error message if invalid, null if valid
 */
export const validatePassword = (password?: string): string | null => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return 'Password must contain at least one number';
  }

  // Check for at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character';
  }

  return null;
};

/**
 * Validates a name
 * @param name - The name to validate
 * @returns Error message if invalid, null if valid
 */
export const validateName = (name?: string): string | null => {
  if (!name) {
    return 'Name is required';
  }

  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters long';
  }

  // Check if name contains only letters, spaces, and hyphens
  if (!/^[a-zA-Z\s-]+$/.test(name)) {
    return 'Name can only contain letters, spaces, and hyphens';
  }

  return null;
};

/**
 * Validates a confirm password field
 * @param password - The original password
 * @param confirmPassword - The confirmation password
 * @returns Error message if invalid, null if valid
 */
export const validateConfirmPassword = (
  password?: string,
  confirmPassword?: string
): string | null => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return null;
};

/**
 * Validates form data object
 * @param data - The form data object to validate
 * @param fields - Array of field names to validate
 * @returns Object containing validation errors
 */
export const validateFormData = (
  data: FormData,
  fields: string[]
): ValidationErrors => {
  const errors: ValidationErrors = {};

  fields.forEach((field) => {
    switch (field) {
      case 'email':
        const emailError = validateEmail(data.email);
        if (emailError) {
          errors.email = emailError;
        }
        break;

      case 'password':
        const passwordError = validatePassword(data.password);
        if (passwordError) {
          errors.password = passwordError;
        }
        break;

      case 'name':
        const nameError = validateName(data.name);
        if (nameError) {
          errors.name = nameError;
        }
        break;

      case 'confirmPassword':
        const confirmPasswordError = validateConfirmPassword(
          data.password,
          data.confirmPassword
        );
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
