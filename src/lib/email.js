import nodemailer from "nodemailer";
import { env } from "@/lib/env";

// Create transporter - you can configure this based on your email provider
const createTransporter = () => {
  // Gmail configuration example
  if (env.EMAIL_PROVIDER === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_APP_PASSWORD, // Use app password for Gmail
      },
    });
  }

  // SMTP configuration for other providers
  return nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT || 587,
    secure: env.EMAIL_SECURE === "true",
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD,
    },
  });
};

export const sendOTPEmail = async (email, otp, type = "signup") => {
  try {
    const transporter = createTransporter();

    const subject =
      type === "signup"
        ? "Verify Your Email - VidyaVerse"
        : "Reset Your Password - VidyaVerse";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 VidyaVerse</h1>
              <p>${
                type === "signup"
                  ? "Welcome to VidyaVerse!"
                  : "Password Reset Request"
              }</p>
            </div>
            <div class="content">
              <h2>Hello!</h2>
              <p>
                ${
                  type === "signup"
                    ? "Thank you for signing up with VidyaVerse! To complete your registration, please verify your email address using the OTP below:"
                    : "We received a request to reset your password. Use the OTP below to proceed with password reset:"
                }
              </p>
              
              <div class="otp-box">
                <p>Your verification code is:</p>
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                  <li>This OTP will expire in 10 minutes</li>
                  <li>Never share this code with anyone</li>
                  <li>VidyaVerse will never ask for your OTP via phone or email</li>
                </ul>
              </div>
              
              <p>
                ${
                  type === "signup"
                    ? "If you didn't create an account with VidyaVerse, please ignore this email."
                    : "If you didn't request a password reset, please ignore this email and your password will remain unchanged."
                }
              </p>
            </div>
            <div class="footer">
              <p>© 2025 VidyaVerse. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"VidyaVerse" <${env.EMAIL_FROM || env.EMAIL_USER}>`,
      to: email,
      subject,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  }
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
