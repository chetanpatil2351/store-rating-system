import { ValidationErrors } from './types';

export const validateName = (name: string): string | null => {
  if (!name || !name.trim()) {
    return 'Name is required';
  }

  const trimmed = name.trim();

  if (trimmed.length < 20) {
    return `Name must be at least 20 characters long (Current: ${trimmed.length})`;
  }

  if (trimmed.length > 60) {
    return `Name must not exceed 60 characters (Current: ${trimmed.length})`;
  }

  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }

  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address (e.g. user@domain.com)';
  }

  return null;
};

export const validateAddress = (
  address: string
): string | null => {
  if (!address || !address.trim()) {
    return 'Address is required';
  }

  if (address.length > 400) {
    return `Address must not exceed 400 characters (Current: ${address.length})`;
  }

  return null;
};

export const validatePassword = (
  password: string
): string | null => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters long';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (!/[!@#$%^&*(),.?":{}|<>\-_=+]/.test(password)) {
    return 'Password must contain at least one special character (e.g. @, #, $, !)';
  }

  return null;
};

export const validateUserForm = (
  data: {
    name: string;
    email: string;
    address: string;
    password?: string;
  },
  isUpdate: boolean = false
): ValidationErrors => {
  const errors: ValidationErrors = {};

  const nameError = validateName(data.name);
  if (nameError) {
    errors.name = nameError;
  }

  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.email = emailError;
  }

  const addressError = validateAddress(data.address);
  if (addressError) {
    errors.address = addressError;
  }

  if (!isUpdate || data.password) {
    const passwordError = validatePassword(
      data.password || ''
    );

    if (passwordError) {
      errors.password = passwordError;
    }
  }

  return errors;
};

export const validateStoreForm = (data: {
  name: string;
  email: string;
  address: string;
}): ValidationErrors => {
  const errors: ValidationErrors = {};

  const nameError = validateName(data.name);
  if (nameError) {
    errors.name = nameError;
  }

  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.email = emailError;
  }

  const addressError = validateAddress(data.address);
  if (addressError) {
    errors.address = addressError;
  }

  return errors;
};