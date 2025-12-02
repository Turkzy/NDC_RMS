# n8n Integration Guide for NDC_RMS

This guide explains how to integrate and use n8n (workflow automation tool) with your NDC Request Management System.

## What is n8n?

n8n is a workflow automation tool that allows you to connect different services and automate tasks. It's perfect for:
- Sending notifications (email, Slack, SMS) when concerns are created/updated
- Integrating with external systems
- Automated report generation
- Webhook integrations

## Installation Options

### Option 1: n8n Cloud (Recommended for Quick Start)
1. Sign up at [https://n8n.io/](https://n8n.io/)
2. Create workflows in the cloud interface
3. Use webhooks to connect to your local/remote API

### Option 2: Self-Hosted n8n (Local/Server)
Install n8n locally or on your server:

```bash
# Using npm
npm install n8n -g
n8n start

# Using Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

n8n will be available at `http://localhost:5678`

## Integration Approaches

### Approach 1: Webhook Triggers (Recommended)

Your Express.js server can send HTTP requests to n8n webhooks when events occur (e.g., when a concern is created).

**How it works:**
1. Create a webhook URL in n8n
2. Configure your server to call this webhook when events happen
3. n8n processes the data and performs actions (send email, notifications, etc.)

### Approach 2: HTTP Request Nodes

n8n can poll your API or make requests to fetch data on a schedule.

**How it works:**
1. Create a workflow in n8n that runs on a schedule
2. Use HTTP Request node to call your API endpoints
3. Process the response and perform actions

### Approach 3: Webhook Endpoints in Your Server

Create endpoints in your Express.js server that n8n can call to retrieve data.

## Example Use Cases

### Use Case 1: Email Notification on New Concern

**Setup:**
1. When a concern is created, your server calls an n8n webhook
2. n8n sends an email notification to relevant stakeholders

**Implementation:**
- Add webhook call in `createConcern` function
- Configure n8n workflow to receive webhook and send email

### Use Case 2: Slack Notifications

**Setup:**
1. When a concern status changes to "Resolved", notify team on Slack
2. Include concern details in the notification

**Implementation:**
- Add webhook call in `updateConcern` function when status changes
- Configure n8n to format message and send to Slack

### Use Case 3: Daily Report Generation

**Setup:**
1. n8n runs daily at 8 AM
2. Fetches all concerns from your API
3. Generates a summary report and emails it

**Implementation:**
- Use n8n's Schedule Trigger
- HTTP Request node to fetch concerns
- Process data and send formatted email

## Next Steps

See the implementation files:
- `server/utils/n8nWebhook.js` - Helper functions to call n8n webhooks
- `server/config/n8n.config.js` - Configuration for n8n webhook URLs
- Example workflow JSON files in `n8n-workflows/` directory

## Configuration

1. Create a `.env` file in the `server` directory with:
```env
N8N_WEBHOOK_NEW_CONCERN=https://your-n8n-instance.com/webhook/new-concern
N8N_WEBHOOK_STATUS_CHANGE=https://your-n8n-instance.com/webhook/status-change
N8N_API_KEY=your-optional-api-key
```

2. Import and use the webhook utilities in your controllers

## Getting Webhook URLs from n8n

1. Open n8n (cloud or local)
2. Create a new workflow
3. Add a "Webhook" node
4. Click "Listen for Test Event" or "Execute Node"
5. Copy the webhook URL shown
6. Use this URL in your `.env` file

## Example n8n Workflow Structure

```
Webhook (Trigger)
  ↓
Set (Map data)
  ↓
HTTP Request (Optional: Call external API)
  ↓
Email / Slack / SMS (Action)
```

## Testing

1. Start your Express.js server
2. Create a test concern
3. Check n8n workflow execution logs
4. Verify the automated action was performed (email sent, etc.)

## Resources

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Community Forum](https://community.n8n.io/)
- [n8n Workflow Examples](https://n8n.io/workflows/)

