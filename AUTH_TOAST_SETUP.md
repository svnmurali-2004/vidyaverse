# Authentication System with Toast Notifications

This authentication system now includes beautiful toast notifications and OTP input component for a better user experience.

## 🎉 New Features Added

### Toast Notifications

- **Global toast provider** with react-hot-toast
- **Custom styling** matching your app theme
- **Position**: Top-right corner
- **Auto-dismiss**: 3-5 seconds based on message type
- **Toast utility functions** for consistent messaging

### Enhanced OTP Input

- **InputOTP component** from shadcn/ui
- **6-digit verification** with individual slots
- **Better UX** with visual feedback
- **Validation** before submission

## 🔧 Components Structure

```
src/
├── components/
│   ├── providers/
│   │   ├── auth-provider.js      # NextAuth session provider
│   │   └── toast-provider.js     # Global toast provider
│   └── ui/
│       ├── input-otp.jsx         # OTP input component
│       ├── button.jsx            # Button component
│       ├── card.jsx              # Card components
│       ├── input.jsx             # Input component
│       └── label.jsx             # Label component
├── lib/
│   └── toast.js                  # Toast utility functions
└── app/
    ├── layout.js                 # Root layout with providers
    └── (auth)/
        ├── signin/
        │   └── page.js           # Sign in page
        └── signup/
            └── page.js           # Sign up page with OTP
```

## 🚀 Usage Examples

### Basic Toast Usage

```javascript
import toast from "react-hot-toast";

// Success toast
toast.success("Operation completed!");

// Error toast
toast.error("Something went wrong!");

// Loading toast
const loadingToast = toast.loading("Processing...");
// Later dismiss it
toast.dismiss(loadingToast);
```

### Using Toast Utilities

```javascript
import { authToasts, showSuccess, showError } from "@/lib/toast";

// Predefined auth toasts
authToasts.signInSuccess();
authToasts.otpSent();
authToasts.otpInvalid();

// Custom messages
showSuccess("Custom success message");
showError("Custom error message");
```

### Promise Toast

```javascript
import { showPromiseToast } from "@/lib/toast"

const signUpPromise = fetch('/api/auth/signup', {...})

showPromiseToast(signUpPromise, {
  loading: "Creating account...",
  success: "Account created successfully!",
  error: "Failed to create account"
})
```

## 🎨 Toast Styling

Toasts are styled with:

- **Dark theme** for default messages
- **Green background** for success messages
- **Red background** for error messages
- **Custom duration** based on message importance
- **Smooth animations** for enter/exit

## 📱 InputOTP Features

The OTP input component provides:

- **6 individual slots** for each digit
- **Auto-focus** progression
- **Keyboard navigation** (arrow keys, backspace)
- **Copy/paste support** for OTP codes
- **Visual feedback** for filled/empty slots
- **Accessibility** compliant

## 🔒 Authentication Flow

### Sign Up Flow

1. User fills registration form
2. **Toast**: "Verification code sent to your email"
3. User enters OTP in InputOTP component
4. **Validation**: Checks if 6-digit code is complete
5. **Toast**: "Email verified successfully!" or error message
6. Redirect to sign in page

### Sign In Flow

1. User enters credentials or uses OAuth
2. **Toast**: Loading indicator during authentication
3. **Success**: "Signed in successfully!" + redirect
4. **Error**: Specific error message (invalid credentials, etc.)

## 🛠️ Customization

### Toast Themes

Edit `src/components/providers/toast-provider.js`:

```javascript
toastOptions={{
  duration: 4000,
  style: {
    background: '#your-color',
    color: '#your-text-color',
  },
  success: {
    style: {
      background: '#your-success-color',
    },
  },
  error: {
    style: {
      background: '#your-error-color',
    },
  },
}}
```

### Toast Position

Change position in toast provider:

```javascript
<Toaster
  position="top-center" // or bottom-right, bottom-center, etc.
  // ... other options
/>
```

### OTP Styling

The InputOTP component uses Tailwind classes and can be customized in the component file.

## 📦 Dependencies

```json
{
  "react-hot-toast": "^2.4.1",
  "next-auth": "^4.24.5",
  "bcryptjs": "^2.4.3",
  "mongoose": "^8.0.0",
  "nodemailer": "^6.9.0"
}
```

## 🚀 Getting Started

1. **Install dependencies**:

   ```bash
   npm install react-hot-toast
   ```

2. **Set up environment variables**:

   ```env
   NEXTAUTH_SECRET=your-secret
   MONGODB_URI=your-mongodb-uri
   EMAIL_USER=your-email
   EMAIL_APP_PASSWORD=your-app-password
   ```

3. **Test the system**:
   - Visit `/auth/signup` to test registration with OTP
   - Visit `/auth/signin` to test sign in
   - Try OAuth with Google/GitHub
   - Observe toast notifications throughout the flow

## 🔍 Troubleshooting

### Toast Not Showing

- Ensure `ToastProvider` is in your root layout
- Check browser console for errors
- Verify toast import: `import toast from "react-hot-toast"`

### OTP Component Issues

- Check if `InputOTP` is properly imported
- Verify the component path: `@/components/ui/input-otp`
- Ensure maxLength prop is set to 6

### Email/OTP Not Working

- Check email configuration in environment variables
- Verify SMTP settings
- Check database connection for OTP storage
