import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class FluentCApi implements ICredentialType {
	name = 'fluentCApi';
	displayName = 'FluentC API';
	documentationUrl = 'https://fluentc.ai/docs';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your FluentC API key obtained from the sales website',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.fluentc.ai',
			url: '/checklanguage',
			method: 'POST',
			body: {
				input: 'Hello world',
				input_format: 'text',
			},
		},
	};
}