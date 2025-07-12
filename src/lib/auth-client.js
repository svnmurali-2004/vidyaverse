// Example usage for signup with OTP verification

// Step 1: Initial signup request
export const signupUser = async (userData) => {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Signup failed");
  }

  return data;
};

// Step 2: Verify OTP
export const verifyOTP = async (email, otp, tempData) => {
  const response = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp, tempData }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "OTP verification failed");
  }

  return data;
};

// Step 3: Resend OTP if needed
export const resendOTP = async (email, type = "signup") => {
  const response = await fetch("/api/auth/resend-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, type }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to resend OTP");
  }

  return data;
};

// Example React component usage:
/*
const SignupForm = () => {
  const [step, setStep] = useState(1); // 1: signup form, 2: OTP verification
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [tempData, setTempData] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (formData) => {
    try {
      setLoading(true);
      const result = await signupUser(formData);
      setEmail(result.email);
      setTempData(result.tempData);
      setStep(2);
    } catch (error) {
      console.error('Signup error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      const result = await verifyOTP(email, otp, tempData);
      console.log('Account created successfully:', result);
      // Redirect to login or dashboard
    } catch (error) {
      console.error('OTP verification error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP(email);
      console.log('OTP resent successfully');
    } catch (error) {
      console.error('Resend OTP error:', error.message);
    }
  };

  // Render form based on step...
};
*/
