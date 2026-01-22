# n8n-nodes-mirlo

This is an n8n community node that lets you use [Mirlo](https://mirlo.com) in your n8n workflows.

Mirlo is a WhatsApp Business API platform that enables you to send messages, manage broadcasts, handle contacts, and track conversations.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Message

- **Send Template**: Send a WhatsApp template message to a single recipient
- **Get**: Retrieve a message by ID
- **Get Many**: List messages with optional filters

### Broadcast

- **Create**: Create a new broadcast campaign
- **Send**: Send a broadcast to all recipients
- **Get**: Retrieve a broadcast by ID
- **Get Many**: List all broadcasts
- **Get Recipients**: List recipients of a broadcast

### Contact

- **Get**: Retrieve a contact by ID
- **Get Many**: List all contacts

### Conversation

- **Get**: Retrieve a conversation by ID
- **Get Many**: List all conversations

### Template

- **Get Many**: List available WhatsApp templates

## Credentials

To use this node, you need a Mirlo API Key:

1. Log in to your [Mirlo dashboard](https://app.mirlo.com)
2. Go to Settings > API Keys
3. Create a new API Key
4. Copy the key (starts with `sk_live_`)

## Usage Examples

### Send a Template Message

1. Add the **Mirlo** node to your workflow
2. Select **Message** as the resource
3. Select **Send Template** as the operation
4. Fill in:
   - **Organization ID**: Your organization UUID
   - **Organization Address**: Your WhatsApp phone number ID
   - **To**: Recipient phone number (e.g., `+521234567890`)
   - **Template ID**: The Meta template ID
   - **Template Components**: JSON array with parameters (if template has variables)

Example components JSON for a template with variables:

```json
[
  {
    "type": "body",
    "parameters": [
      { "type": "text", "parameter_name": "customer_name", "text": "John Doe" }
    ]
  }
]
```

### Create and Send a Broadcast

1. Add two **Mirlo** nodes in sequence
2. First node - Create broadcast:
   - Resource: **Broadcast**
   - Operation: **Create**
   - Fill in name, organization details, template ID, and recipients
3. Second node - Send broadcast:
   - Resource: **Broadcast**
   - Operation: **Send**
   - Broadcast ID: `{{ $json.id }}` (from previous node)

Example recipients JSON:

```json
[
  { "phone_number": "+521234567890" },
  { "phone_number": "+521234567891" },
  {
    "phone_number": "+521234567892",
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "parameter_name": "name", "text": "Maria" }
        ]
      }
    ]
  }
]
```

### Monitor Message Status

1. After sending a message, store the returned `id`
2. Use **Message > Get** operation to check the status
3. The `status` object shows timestamps for each state:
   - `pending`: Message created
   - `accepted`: Accepted by WhatsApp
   - `delivered`: Delivered to device
   - `read`: Read by recipient

## Resources

- [Mirlo Documentation](https://docs.mirlo.com)
- [Mirlo API Reference](https://docs.mirlo.com/api)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE.md)
