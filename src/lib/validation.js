/**
 * Input Validation Utilities
 * Sanitize and validate all user inputs
 */

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email) || email.length > 255) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
};

export const validatePassword = (password) => {
  if (!password || typeof password !== 'string' || password.length < 8) return false;

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  return hasUppercase && hasLowercase && hasNumber && hasSpecial;
};

// NOTE: validateUsername is unused - kept for future use
// export const validateUsername = (username) => {

export const validateString = (str, minLength = 1, maxLength = 255) => {
  if (typeof str !== 'string') return false;
  return str.length >= minLength && str.length <= maxLength;
};

export const validateNumber = (num, min = 0, max = 999999) => {
  const parsed = parseInt(num, 10);
  return !isNaN(parsed) && parsed >= min && parsed <= max;
};

export const validateDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// NOTE: validateArray is unused - kept for future use
// export const validateArray = (arr, minLength = 0, maxLength = 1000) => {
//   return Array.isArray(arr) && arr.length >= minLength && arr.length <= maxLength;
// };

export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  // Remove HTML tags and potentially dangerous characters
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim();
};

export const validateHabitData = (data) => {
  const errors = [];

  if (!validateString(data.name, 1, 100)) {
    errors.push('Habit name must be 1-100 characters');
  }

  if (data.description && !validateString(data.description, 0, 500)) {
    errors.push('Habit description must be 0-500 characters');
  }

  if (!['DAILY', 'WEEKLY', 'MONTHLY'].includes(data.frequency)) {
    errors.push('Invalid frequency');
  }

  if (data.targetDays !== undefined && !validateNumber(data.targetDays, 1, 365)) {
    errors.push('Target days must be 1-365');
  }

  if (data.color && !validateString(data.color, 3, 7)) {
    errors.push('Invalid color format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateGoalData = (data) => {
  const errors = [];

  if (!validateString(data.title, 1, 100)) {
    errors.push('Goal title must be 1-100 characters');
  }

  if (data.description && !validateString(data.description, 0, 500)) {
    errors.push('Goal description must be 0-500 characters');
  }

  if (data.targetDate && !validateDate(data.targetDate)) {
    errors.push('Invalid target date');
  }

  if (!['HEALTH', 'CAREER', 'PERSONAL', 'RELATIONSHIPS', 'FINANCIAL', 'EDUCATION'].includes(data.category)) {
    errors.push('Invalid goal category');
  }

  if (data.priority && !['LOW', 'MEDIUM', 'HIGH'].includes(data.priority)) {
    errors.push('Invalid priority level');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// NOTE: validateReminderData is unused - kept for future implementation when reminders are added
// export const validateReminderData = (data) => {

export const validateLoginData = (email, password) => {
  const errors = [];

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    errors.push(emailValidation.error || 'Invalid email format');
  }

  if (!validateString(password, 1, 255)) {
    errors.push('Invalid password');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateSignupData = (email, password, name) => {
  const errors = [];

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    errors.push(emailValidation.error || 'Invalid email format');
  }

  if (!validatePassword(password)) {
    errors.push('Password must contain: 8+ chars, 1 uppercase, 1 lowercase, 1 number, and 1 special character');
  }

  if (!validateString(name, 2, 50)) {
    errors.push('Name must be 2-50 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
