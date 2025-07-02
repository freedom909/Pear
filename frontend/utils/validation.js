/**
 * Validates an email address
 * @param {string} email - The email address to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateEmail = (email) => {
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
 * @param {string} password - The password to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validatePassword = (password) => {
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
 * @param {string} name - The name to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateName = (name) => {
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
 * @param {string} password - The original password
 * @param {string} confirmPassword - The confirmation password
 * @returns {string|null} Error message if invalid, null if valid
 */
export const validateConfirmPassword = (password, confirmPassword) => {
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
 * @param {Object} data - The form data object to validate
 * @param {Array<string>} fields - Array of field names to validate
 * @returns {Object} Object containing validation errors
 */
export const validateFormData = (data, fields) => {
  const errors = {};

  fields.forEach((field) => {
    switch (field) {
      case 'email':
        const emailError = validateEmail(data.email);
        if (emailError) errors.email = emailError;
        break;

      case 'password':
        const passwordError = validatePassword(data.password);
        if (passwordError) errors.password = passwordError;
        break;

      case 'name':
        const nameError = validateName(data.name);
        if (nameError) errors.name = nameError;
        break;

      case 'confirmPassword':
        const confirmPasswordError = validateConfirmPassword(
          data.password,
          data.confirmPassword
        );
        if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
        break;

      default:
        break;
    }
  });

  return errors;
};
