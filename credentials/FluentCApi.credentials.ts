import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class FluentCApi implements ICredentialType {
	name = 'fluentCApi';
	displayName = 'FluentC API';
	documentationUrl = 'https://docs.fluentc.io/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your FluentC API key obtained from FluentC Dashboard https://dashboard.fluentc.io',
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
			baseURL: 'https://dashboard.fluentc.io/ai_agent',
			url: '/languages',
			method: 'GET',
		},
	};
}