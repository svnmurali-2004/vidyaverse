# OTP Email Verification System

This system implements email-based OTP (One-Time Password) verification for user signup in your VidyaVerse application.

## Features

- ✅ Email OTP verification for signup
- ✅ Automatic OTP expiration (10 minutes)
- ✅ Rate limiting for OTP requests
- ✅ Resend OTP functionality
- ✅ Beautiful HTML email templates
- ✅ Support for multiple email providers
- ✅ Secure temporary data handling

## API Endpoints

### 1. Signup with OTP (`POST /api/auth/signup`)

Initiates the signup process and sends OTP to the user's email.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student" // optional, defaults to "student"
}
```

**Response:**

```json
{
  "message": "OTP sent successfully. Please check your email to verify your account.",
  "email": "john@example.com",
  "tempData": "base64_encoded_user_data"
}
```

### 2. Verify OTP (`POST /api/auth/verify-otp`)

Verifies the OTP and creates the user account.

**Request Body:**

```json
{
  "email": "john@example.com",
  "otp": "123456",
  "tempData": "base64_encoded_user_data"
}
```

**Response:**

```json
{
  "message": "Email verified and account created successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### 3. Resend OTP (`POST /api/auth/resend-otp`)

Resends OTP to the user's email (rate limited to once every 2 minutes).

**Request Body:**

```json
{
  "email": "john@example.com",
  "type": "signup" // optional, defaults to "signup"
}
```

**Response:**

```json
{
  "message": "OTP sent successfully. Please check your email.",
  "email": "john@example.com"
}
```

## Environment Variables

Add these variables to your `.env.local` file:

```env
# Email Configuration
EMAIL_PROVIDER=gmail  # or "smtp"
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password  # For Gmail
EMAIL_FROM=noreply@vidyaverse.com  # Optional

# For SMTP providers (instead of Gmail)
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_PASSWORD=your-email-password
```

## Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use the app password as `EMAIL_APP_PASSWORD`

## SMTP Provider Setup

For other email providers (SendGrid, Mailgun, etc.):

1. Set `EMAIL_PROVIDER=smtp`
2. Configure `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, and `EMAIL_PASSWORD`

## Security Features

- **OTP Expiration**: OTPs expire after 10 minutes
- **Rate Limiting**: Users can only request a new OTP every 2 minutes
- **Automatic Cleanup**: Expired OTPs are automatically deleted from the database
- **Secure Data Handling**: User data is base64 encoded during the verification process

## Database Models

### OTP Model

- `email`: User's email address
- `otp`: 6-digit OTP code
- `type`: "signup" or "reset-password"
- `expiresAt`: Expiration timestamp (10 minutes)
- `verified`: Boolean flag
- `createdAt`: Creation timestamp

### User Model Updates

- `emailVerified`: Boolean flag for email verification status
- `provider`: Authentication provider ("credentials", "google", "github")

## Client-Side Implementation

See `src/lib/auth-client.js` for example functions to integrate with your frontend.

## Email Template

The system sends beautiful HTML emails with:

- VidyaVerse branding
- Clear OTP display
- Security warnings
- Professional styling

## Error Handling

The system handles various error cases:

- Invalid email format
- Missing required fields
- Expired OTPs
- Rate limiting
- Email sending failures
- Duplicate email addresses

## Testing

To test the OTP system:

1. Set up your email configuration
2. Make a signup request
3. Check your email for the OTP
4. Verify the OTP using the verification endpoint
5. Check that the user was created successfully

## Production Considerations

- Use a professional email service (SendGrid, AWS SES, etc.)
- Implement proper logging and monitoring
- Consider using Redis for OTP storage instead of MongoDB
- Add CAPTCHA to prevent spam
- Implement proper error tracking
- Use environment-specific email templates
