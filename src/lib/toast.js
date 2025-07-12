import toast from "react-hot-toast";

// Auth related toasts
export const authToasts = {
  signInSuccess: () => toast.success("Signed in successfully!"),
  signInError: () => toast.error("Invalid email or password"),
  signUpSuccess: () => toast.success("Account created successfully!"),
  otpSent: () => toast.success("Verification code sent to your email"),
  otpResent: () => toast.success("Verification code resent!"),
  otpVerified: () => toast.success("Email verified successfully!"),
  otpInvalid: () => toast.error("Invalid or expired verification code"),
  otpIncomplete: () => toast.error("Please enter a complete 6-digit code"),
  emailRequired: () => toast.error("Email is required"),
  passwordRequired: () => toast.error("Password is required"),
  nameRequired: () => toast.error("Name is required"),
  networkError: () => toast.error("Network error. Please try again."),
  genericError: () => toast.error("Something went wrong. Please try again."),
};

// Generic toast functions
export const showSuccess = (message) => toast.success(message);
export const showError = (message) => toast.error(message);
export const showLoading = (message) => toast.loading(message);

// Custom toast with promise
export const showPromiseToast = (promise, messages) => {
  return toast.promise(promise, {
    loading: messages.loading || "Loading...",
    success: messages.success || "Success!",
    error: messages.error || "Something went wrong!",
  });
};
