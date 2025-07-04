# Email Setup for Document Signing App

## Email Configuration

To enable email notifications for document signing, add the following environment variables to your `.env.local` file:

```env
# Email Configuration (Optional - for sending emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → App passwords
   - Generate password for "Mail"
   - Use this password as `SMTP_PASS`

## Testing Email

If email credentials are not configured, the app will log the email content to the console instead of sending it.

## Supported Email Providers

- Gmail (smtp.gmail.com:587)
- Outlook (smtp.office365.com:587)
- Yahoo (smtp.mail.yahoo.com:587)
- Custom SMTP servers

## Security Notes

- Never commit email credentials to version control
- Use environment variables for sensitive data
- Consider using OAuth2 for production deployments
