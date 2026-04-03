/**
 * Twilio SMS / Verify configuration. Secrets must never be logged.
 */

export interface TwilioSmsConfig {
  accountSid: string;
  /** LIVE: auth token — never log. */
  authToken: string;
  messagingServiceSid: string;
  fromNumber: string;
  verifyServiceSid: string;
  /** When true, use Verify API to send OTP instead of plain SMS (if verifyServiceSid set). */
  useVerifyApi: boolean;
}
