# Cloudflare Email Service - Unified Email Platform

## Overview
Cloudflare Email Service is a unified developer platform for handling both inbound and outbound email operations, announced September 25, 2025. It combines Email Sending (new capability) with Email Routing (existing service) into a single, integrated developer experience.

## Key Features

### Email Sending (Private Beta - November 2025)
- **Direct Worker Integration**: Send transactional emails directly from Cloudflare Workers
- **No API Key Management**: Uses Worker bindings instead of managing API keys and secrets
- **Global Delivery**: Low-latency email delivery worldwide through Cloudflare's network
- **Auto DNS Configuration**: Automatically configures SPF, DKIM, and DMARC records
- **Framework Support**: Compatible with React Email and other email templating frameworks
- **Multiple Protocols**: Supports REST API and SMTP for external service integration

### Email Routing (Currently Available)
- **Programmatic Processing**: Handle incoming emails with Workers
- **Custom Email Addresses**: Create custom addresses on your domain
- **AI Integration**: Parse and classify emails using Workers AI
- **Attachment Storage**: Store attachments in R2
- **Workflow Automation**: Create tickets, process invoices, generate auto-responses

## Implementation Examples

### Basic Email Sending
```javascript
export default {
  async fetch(request, env, ctx) {
    await env.SEND_EMAIL.send({
      to: [{ email: "hello@example.com" }],
      from: { email: "api-sender@your-domain.com", name: "Your App" },
      subject: "Hello World",
      text: "Hello World!"
    });
    return new Response(`Successfully sent email!`);
  },
};
```

### With React Email Templates
```javascript
import { render, pretty, toPlainText } from '@react-email/render';
import { SignupConfirmation } from './templates';

export default {
  async fetch(request, env, ctx) {
    const html = await pretty(await render(
      <SignupConfirmation url="https://your-domain.com/confirmation-id"/>
    ));
    
    await env.SEND_EMAIL.send({
      to: [{ email: "hello@example.com" }],
      from: { email: "api-sender@your-domain.com", name: "Welcome" },
      subject: "Signup Confirmation",
      html,
      text: toPlainText(html)
    });
    
    return new Response(`Successfully sent email!`);
  }
};
```

### Email Routing Handler
```javascript
export default {
  async email(message, env, ctx) {
    // Classify incoming emails using Workers AI
    const { score, label } = await env.AI.run(
      "@cf/huggingface/distilbert-sst-2-int8", 
      { text: message.raw }
    );
    
    env.PROCESSED_EMAILS.send({score, label, message});
  },
};
```

## Use Cases

### Application Communication
- User signup validation
- Password reset links
- Magic login links
- Purchase receipts and invoices
- Event notifications
- Onboarding flows

### Workflow Automation
- Support ticket creation from emails
- Invoice processing with attachment storage
- AI-powered email classification and labeling
- Automatic response generation
- Security event flagging

### AI and Agentic Workflows
- Email as input/output for AI agents
- Automated workflow triggers
- Background task notifications
- Cross-system integration via email

## Technical Benefits

### Developer Experience
- **Wrangler Integration**: Local development and testing support
- **No Credential Management**: Secure Worker bindings eliminate API key risks
- **Queue Integration**: Process emails asynchronously with Cloudflare Queues
- **Clear Observability**: Monitor bounce rates and delivery events

### Deliverability Focus
- **Time-to-Inbox Optimization**: Critical for time-sensitive emails (magic links, resets)
- **Spam Prevention**: Proper authentication reduces spam folder delivery
- **Global Infrastructure**: Leverages Cloudflare's worldwide network

## Pricing Model
- Requires paid Workers subscription
- Message-based pricing (details pending)
- Email Routing remains free
- Final pricing to be announced before charging begins

## Integration Considerations

### Complete Email Loop
Combining inbound and outbound capabilities enables:
1. Receive email at support address
2. Parse content with Worker
3. Call third-party API to create ticket
4. Send confirmation email with ticket number
5. All within Cloudflare's platform

### DNS Integration
- Automatic configuration of email authentication records
- Verification of sending domain
- Trust establishment with email providers

## Related Technologies
- [[Cloudflare Workers]]
- [[Cloudflare R2 Storage]]
- [[Cloudflare Queues]]
- [[Cloudflare Workers AI]]
- [[React Email]]

## Status
- **Email Routing**: Currently available (free)
- **Email Sending**: Private beta launching November 2025
- **Waitlist**: Open for Email Sending beta

## References
- [Original Blog Post](https://blog.cloudflare.com/announcing-cloudflare-email-service-private-beta) - September 25, 2025
- [Email Routing Documentation](https://developers.cloudflare.com/email-routing/)
- [Workers Documentation](https://developers.cloudflare.com/workers/)

## Tags
#email #cloudflare #workers #api #transactional-email #email-routing #developer-platform #saas #infrastructure #2025-announcement