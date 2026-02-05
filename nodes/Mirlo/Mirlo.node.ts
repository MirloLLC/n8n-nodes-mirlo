import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestMethods,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export class Mirlo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mirlo',
		name: 'mirlo',
		icon: 'file:mirlo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Send WhatsApp messages, manage broadcasts, contacts and conversations with Mirlo',
		defaults: {
			name: 'Mirlo',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'mirloApi',
				required: true,
			},
		],
		properties: [
			// Resource selector
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Message',
						value: 'message',
					},
					{
						name: 'Broadcast',
						value: 'broadcast',
					},
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'Conversation',
						value: 'conversation',
					},
					{
						name: 'Template',
						value: 'template',
					},
				],
				default: 'message',
			},

			// ==========================================
			// MESSAGE OPERATIONS
			// ==========================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['message'],
					},
				},
				options: [
					{
						name: 'Send',
						value: 'send',
						description: 'Send a direct message (text, image, video, audio, document) within 24h window',
						action: 'Send a direct message',
					},
					{
						name: 'Send Template',
						value: 'sendTemplate',
						description: 'Send a WhatsApp template message to a single recipient',
						action: 'Send a template message',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a message by ID',
						action: 'Get a message',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many messages',
						action: 'Get many messages',
					},
				],
				default: 'send',
			},

			// Message: Send & Send Template common fields
			{
				displayName: 'Organization ID',
				name: 'organizationId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send', 'sendTemplate'],
					},
				},
				default: '',
				description: 'The ID of your organization',
			},
			{
				displayName: 'Organization Address',
				name: 'organizationAddress',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send', 'sendTemplate'],
					},
				},
				default: '',
				description: 'The WhatsApp phone number ID (organization address)',
			},
			{
				displayName: 'To',
				name: 'to',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send', 'sendTemplate'],
					},
				},
				default: '',
				placeholder: '+521234567890',
				description: 'Recipient phone number with country code',
			},

			// Message: Send fields
			{
				displayName: 'Message Type',
				name: 'messageType',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send'],
					},
				},
				options: [
					{
						name: 'Text',
						value: 'text',
					},
					{
						name: 'Image',
						value: 'image',
					},
					{
						name: 'Video',
						value: 'video',
					},
					{
						name: 'Audio',
						value: 'audio',
					},
					{
						name: 'Document',
						value: 'document',
					},
				],
				default: 'text',
				description: 'The type of message to send',
			},
			{
				displayName: 'Text Body',
				name: 'textBody',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send'],
						messageType: ['text'],
					},
				},
				default: '',
				description: 'The text content of the message',
			},
			{
				displayName: 'Media URL',
				name: 'mediaUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send'],
						messageType: ['image', 'video', 'audio', 'document'],
					},
				},
				default: '',
				placeholder: 'https://example.com/media.jpg',
				description: 'The URL of the media file to send',
			},
			{
				displayName: 'Caption',
				name: 'caption',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send'],
						messageType: ['image', 'video', 'document'],
					},
				},
				default: '',
				description: 'Optional caption for the media',
			},
			{
				displayName: 'Filename',
				name: 'filename',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['send'],
						messageType: ['document'],
					},
				},
				default: '',
				description: 'Optional filename for the document',
			},

			// Message: Send Template fields
			{
				displayName: 'Template ID',
				name: 'metaTemplateId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendTemplate'],
					},
				},
				default: '',
				description: 'The Meta template ID',
			},
			{
				displayName: 'Template Components',
				name: 'components',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendTemplate'],
					},
				},
				default: '[]',
				description: 'Template components with parameters (JSON array)',
			},
			{
				displayName: 'Do Not Pause',
				name: 'doNotPause',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendTemplate'],
					},
				},
				default: true,
				description: 'Whether to bypass automatic pause rules and send the message immediately',
			},

			// Message: Get fields
			{
				displayName: 'Message ID',
				name: 'messageId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the message to retrieve',
			},

			// Message: Get All fields
			{
				displayName: 'Conversation ID',
				name: 'conversationId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['getAll'],
					},
				},
				default: '',
				description: 'Filter messages by conversation ID',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['getAll'],
					},
				},
				default: 50,
				description: 'Max number of results to return',
			},

			// ==========================================
			// BROADCAST OPERATIONS
			// ==========================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['broadcast'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new broadcast',
						action: 'Create a broadcast',
					},
					{
						name: 'Send',
						value: 'send',
						description: 'Send a broadcast',
						action: 'Send a broadcast',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a broadcast by ID',
						action: 'Get a broadcast',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many broadcasts',
						action: 'Get many broadcasts',
					},
					{
						name: 'Get Recipients',
						value: 'getRecipients',
						description: 'Get recipients of a broadcast',
						action: 'Get broadcast recipients',
					},
				],
				default: 'create',
			},

			// Broadcast: Create fields
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['broadcast'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Name of the broadcast campaign',
			},
			{
				displayName: 'Organization ID',
				name: 'organizationId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['broadcast'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The ID of your organization',
			},
			{
				displayName: 'Organization Address',
				name: 'organizationAddress',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['broadcast'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The WhatsApp phone number ID',
			},
			{
				displayName: 'Template ID',
				name: 'metaTemplateId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['broadcast'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The Meta template ID to use',
			},
			{
				displayName: 'Recipients',
				name: 'recipients',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						resource: ['broadcast'],
						operation: ['create'],
					},
				},
				default: '[{"phone_number": "+521234567890"}]',
				description: 'Array of recipients with phone numbers and optional components',
			},

			// Broadcast: Send/Get fields
			{
				displayName: 'Broadcast ID',
				name: 'broadcastId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['broadcast'],
						operation: ['send', 'get', 'getRecipients'],
					},
				},
				default: '',
				description: 'The ID of the broadcast',
			},

			// Broadcast: Get All fields
			{
				displayName: 'Organization ID',
				name: 'organizationId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['broadcast'],
						operation: ['getAll'],
					},
				},
				default: '',
				description: 'Filter by organization ID',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				displayOptions: {
					show: {
						resource: ['broadcast'],
						operation: ['getAll', 'getRecipients'],
					},
				},
				default: 50,
				description: 'Max number of results to return',
			},

			// ==========================================
			// CONTACT OPERATIONS
			// ==========================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['contact'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a contact by ID',
						action: 'Get a contact',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many contacts',
						action: 'Get many contacts',
					},
				],
				default: 'getAll',
			},

			// Contact: Get fields
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the contact to retrieve',
			},

			// Contact: Get All fields
			{
				displayName: 'Organization ID',
				name: 'organizationId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['getAll'],
					},
				},
				default: '',
				description: 'The ID of your organization',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['getAll'],
					},
				},
				default: 50,
				description: 'Max number of results to return',
			},

			// ==========================================
			// CONVERSATION OPERATIONS
			// ==========================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['conversation'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a conversation by ID',
						action: 'Get a conversation',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many conversations',
						action: 'Get many conversations',
					},
				],
				default: 'getAll',
			},

			// Conversation: Get fields
			{
				displayName: 'Conversation ID',
				name: 'conversationId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['conversation'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The ID of the conversation to retrieve',
			},

			// Conversation: Get All fields
			{
				displayName: 'Organization ID',
				name: 'organizationId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['conversation'],
						operation: ['getAll'],
					},
				},
				default: '',
				description: 'The ID of your organization',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				displayOptions: {
					show: {
						resource: ['conversation'],
						operation: ['getAll'],
					},
				},
				default: 50,
				description: 'Max number of results to return',
			},

			// ==========================================
			// TEMPLATE OPERATIONS
			// ==========================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['template'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get available WhatsApp templates',
						action: 'Get many templates',
					},
				],
				default: 'getAll',
			},

			// Template: Get All fields
			{
				displayName: 'Organization Address',
				name: 'organizationAddress',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['getAll'],
					},
				},
				default: '',
				description: 'The WhatsApp phone number ID',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		const credentials = await this.getCredentials('mirloApi');
		const baseUrl = credentials.baseUrl as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;

				// MESSAGE operations
				if (resource === 'message') {
					if (operation === 'send') {
						const organizationId = this.getNodeParameter('organizationId', i) as string;
						const organizationAddress = this.getNodeParameter('organizationAddress', i) as string;
						const to = this.getNodeParameter('to', i) as string;
						const messageType = this.getNodeParameter('messageType', i) as string;

						// Build the message object based on type
						let message: IDataObject;

						if (messageType === 'text') {
							const textBody = this.getNodeParameter('textBody', i) as string;
							message = {
								type: 'text',
								text: {
									body: textBody,
								},
							};
						} else {
							const mediaUrl = this.getNodeParameter('mediaUrl', i) as string;
							const mediaContent: IDataObject = {
								link: mediaUrl,
							};

							// Add caption for image, video, document
							if (['image', 'video', 'document'].includes(messageType)) {
								const caption = this.getNodeParameter('caption', i, '') as string;
								if (caption) {
									mediaContent.caption = caption;
								}
							}

							// Add filename for document
							if (messageType === 'document') {
								const filename = this.getNodeParameter('filename', i, '') as string;
								if (filename) {
									mediaContent.filename = filename;
								}
							}

							message = {
								type: messageType,
								[messageType]: mediaContent,
							};
						}

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'mirloApi',
							{
								method: 'POST' as IHttpRequestMethods,
								url: `${baseUrl}/v1/messages/send`,
								body: {
									organization_id: organizationId,
									organization_address: organizationAddress,
									to,
									message,
								},
								json: true,
							},
						);
					} else if (operation === 'sendTemplate') {
						const organizationId = this.getNodeParameter('organizationId', i) as string;
						const organizationAddress = this.getNodeParameter('organizationAddress', i) as string;
						const to = this.getNodeParameter('to', i) as string;
						const metaTemplateId = this.getNodeParameter('metaTemplateId', i) as string;
						const componentsJson = this.getNodeParameter('components', i) as string;
						const doNotPause = this.getNodeParameter('doNotPause', i) as boolean;

						let components = [];
						try {
							components = JSON.parse(componentsJson);
						} catch {
							// If parsing fails, use empty array
						}

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'mirloApi',
							{
								method: 'POST' as IHttpRequestMethods,
								url: `${baseUrl}/v1/messages/send-template`,
								body: {
									organization_id: organizationId,
									organization_address: organizationAddress,
									to,
									meta_template_id: metaTemplateId,
									components,
									do_not_pause: doNotPause,
								},
								json: true,
							},
						);
					} else if (operation === 'get') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'mirloApi',
							{
								method: 'GET' as IHttpRequestMethods,
								url: `${baseUrl}/v1/messages/${messageId}`,
								json: true,
							},
						);
					} else if (operation === 'getAll') {
						const conversationId = this.getNodeParameter('conversationId', i) as string;
						const limit = this.getNodeParameter('limit', i) as number;

						const qs: Record<string, string | number> = { take: limit };
						if (conversationId) {
							qs.conversation_id = conversationId;
						}

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'mirloApi',
							{
								method: 'GET' as IHttpRequestMethods,
								url: `${baseUrl}/v1/messages`,
								qs,
								json: true,
							},
						);
						responseData = responseData.data || responseData;
					}
				}

				// BROADCAST operations
				else if (resource === 'broadcast') {
					if (operation === 'create') {
						const name = this.getNodeParameter('name', i) as string;
						const organizationId = this.getNodeParameter('organizationId', i) as string;
						const organizationAddress = this.getNodeParameter('organizationAddress', i) as string;
						const metaTemplateId = this.getNodeParameter('metaTemplateId', i) as string;
						const recipientsJson = this.getNodeParameter('recipients', i) as string;

						let recipients = [];
						try {
							recipients = JSON.parse(recipientsJson);
						} catch {
							throw new NodeApiError(this.getNode(), {
								message: 'Invalid recipients JSON format',
							});
						}

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'mirloApi',
							{
								method: 'POST' as IHttpRequestMethods,
								url: `${baseUrl}/v1/broadcasts`,
								body: {
									name,
									organization_id: organizationId,
									organization_address: organizationAddress,
									meta_template_id: metaTemplateId,
									recipients,
								},
								json: true,
							},
						);
					} else if (operation === 'send') {
						const broadcastId = this.getNodeParameter('broadcastId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'mirloApi',
							{
								method: 'POST' as IHttpRequestMethods,
								url: `${baseUrl}/v1/broadcasts/${broadcastId}/send`,
								json: true,
							},
						);
					} else if (operation === 'get') {
						const broadcastId = this.getNodeParameter('broadcastId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'mirloApi',
							{
								method: 'GET' as IHttpRequestMethods,
								url: `${baseUrl}/v1/broadcasts/${broadcastId}`,
								json: true,
							},
						);
					} else if (operation === 'getAll') {
						const organizationId = this.getNodeParameter('organizationId', i) as string;
						const limit = this.getNodeParameter('limit', i) as number;

						const qs: Record<string, string | number> = { take: limit };
						if (organizationId) {
							qs.organization_id = organizationId;
						}

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'mirloApi',
							{
								method: 'GET' as IHttpRequestMethods,
								url: `${baseUrl}/v1/broadcasts`,
								qs,
								json: true,
							},
						);
						responseData = responseData.data || responseData;
					} else if (operation === 'getRecipients') {
						const broadcastId = this.getNodeParameter('broadcastId', i) as string;
						const limit = this.getNodeParameter('limit', i) as number;

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'mirloApi',
							{
								method: 'GET' as IHttpRequestMethods,
								url: `${baseUrl}/v1/broadcasts/${broadcastId}/recipients`,
								qs: { take: limit },
								json: true,
							},
						);
						responseData = responseData.data || responseData;
					}
				}

				// CONTACT operations
				else if (resource === 'contact') {
					if (operation === 'get') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'mirloApi',
							{
								method: 'GET' as IHttpRequestMethods,
								url: `${baseUrl}/v1/contacts/${contactId}`,
								json: true,
							},
						);
					} else if (operation === 'getAll') {
						const organizationId = this.getNodeParameter('organizationId', i) as string;
						const limit = this.getNodeParameter('limit', i) as number;

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'mirloApi',
							{
								method: 'GET' as IHttpRequestMethods,
								url: `${baseUrl}/v1/contacts`,
								qs: {
									organization_id: organizationId,
									take: limit,
								},
								json: true,
							},
						);
						responseData = responseData.data || responseData;
					}
				}

				// CONVERSATION operations
				else if (resource === 'conversation') {
					if (operation === 'get') {
						const conversationId = this.getNodeParameter('conversationId', i) as string;
						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'mirloApi',
							{
								method: 'GET' as IHttpRequestMethods,
								url: `${baseUrl}/v1/conversations/${conversationId}`,
								json: true,
							},
						);
					} else if (operation === 'getAll') {
						const organizationId = this.getNodeParameter('organizationId', i) as string;
						const limit = this.getNodeParameter('limit', i) as number;

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'mirloApi',
							{
								method: 'GET' as IHttpRequestMethods,
								url: `${baseUrl}/v1/conversations`,
								qs: {
									organization_id: organizationId,
									take: limit,
								},
								json: true,
							},
						);
						responseData = responseData.data || responseData;
					}
				}

				// TEMPLATE operations
				else if (resource === 'template') {
					if (operation === 'getAll') {
						const organizationAddress = this.getNodeParameter('organizationAddress', i) as string;

						responseData = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'mirloApi',
							{
								method: 'GET' as IHttpRequestMethods,
								url: `${baseUrl}/v1/whatsapp-management/templates`,
								qs: {
									organization_address: organizationAddress,
								},
								json: true,
							},
						);
						responseData = responseData.data || responseData;
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as IDataObject | IDataObject[]),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: i });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
