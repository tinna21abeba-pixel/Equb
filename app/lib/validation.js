export const frequencies = ["daily", "weekly", "biweekly", "monthly"];
export const methods = ["lottery", "order"];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(?:\+251|0)[79]\d{8}$/;
const cleanPhone = (phone) => phone.replace(/[\s-]/g, "");

export const text = (formData, name) => String(formData.get(name) ?? "").trim();
export const hasErrors = (errors) => Object.keys(errors).length > 0;

export function normalizePhone(phone) {
  const clean = cleanPhone(phone);
  return clean.startsWith("0") ? `+251${clean.slice(1)}` : clean;
}

export function validateSignUp({ name, email, password }) {
  const errors = {};
  if (name.length < 2 || name.length > 60) errors.name = "Enter your name (2 to 60 characters)";
  if (!emailPattern.test(email)) errors.email = "Enter a valid email address";
  if (password.length < 8) errors.password = "Use at least 8 characters";
  return errors;
}

export function validateSignIn({ email, password }) {
  const errors = {};
  if (!emailPattern.test(email)) errors.email = "Enter a valid email address";
  if (!password) errors.password = "Enter your password";
  return errors;
}

export function validateEqub({ name, amount, frequency, drawMethod, startDate, maxMembers }) {
  const errors = {};
  const value = Number(amount);
  if (name.length < 3 || name.length > 60) errors.name = "Enter a name between 3 and 60 characters";
  if (!Number.isInteger(value) || value < 50 || value > 5000000) {
    errors.amount = "Enter a whole amount between 50 and 5,000,000 ETB";
  }
  if (!frequencies.includes(frequency)) errors.frequency = "Choose how often members contribute";
  if (!methods.includes(drawMethod)) errors.drawMethod = "Choose how the winner is chosen";
  if (!startDate || Number.isNaN(Date.parse(startDate))) errors.startDate = "Choose a valid date";

  if (maxMembers !== undefined && maxMembers !== "") {
    const limit = Number(maxMembers);
    if (!Number.isInteger(limit) || limit < 2 || limit > 500) {
      errors.maxMembers = "Member limit must be between 2 and 500";
    }
  }

  return errors;
}

export function validateMember({ name, phone }) {
  const errors = {};
  if (name.length < 2 || name.length > 60) errors.name = "Enter a name between 2 and 60 characters";
  if (!phonePattern.test(cleanPhone(phone))) {
    errors.phone = "Use an Ethiopian number such as 0912345678 or +251912345678";
  }
  return errors;
}

export function validatePayment({ amountPaid, status, transactionRef }) {
  const errors = {};
  const amount = Number(amountPaid);
  if (Number.isNaN(amount) || amount < 0) {
    errors.amountPaid = "Enter a valid non-negative amount in ETB";
  }
  const validStatuses = ["paid", "pending", "overdue", "partially_paid"];
  if (status && !validStatuses.includes(status)) {
    errors.status = "Select a valid payment status";
  }
  if (transactionRef && transactionRef.length > 100) {
    errors.transactionRef = "Reference must be under 100 characters";
  }
  return errors;
}