import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

import { rethrowExecutionError } from '../../utils/rethrowExecutionError';

const FALLBACK_LANGUAGES = [
	{ code: 'en', name: 'English' },
	{ code: 'es', name: 'Spanish' },
	{ code: 'fr', name: 'French' },
	{ code: 'de', name: 'German' },
	{ code: 'it', name: 'Italian' },
	{ code: 'pt', name: 'Portuguese' },
	{ code: 'ru', name: 'Russian' },
	{ code: 'ja', name: 'Japanese' },
	{ code: 'ko', name: 'Korean' },
	{ code: 'zh', name: 'Chinese' },
];

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['language'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getMany',
				description: 'Get supported and source languages',
				action: 'Get many languages',
			},
		],
		default: 'getMany',
	},
];

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const returnData: INodeExecutionData[] = [];

	try {
		const response = (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'fluentCApi',
			{
				method: 'GET',
				url: 'https://dashboard.fluentc.io/ai_agent/languages',
				json: true,
			},
		)) as {
			supported_languages: Array<{ code: string; name: string }>;
			source_languages: Array<{ code: string; name: string }>;
		};

		returnData.push({
			json: {
				supported_languages: response.supported_languages,
				source_languages: response.source_languages,
			},
		});
	} catch (error) {
		if (this.continueOnFail()) {
			returnData.push({
				json: {
					error: error instanceof Error ? error.message : String(error),
					supported_languages: FALLBACK_LANGUAGES,
					source_languages: FALLBACK_LANGUAGES,
				},
			});
		} else {
			rethrowExecutionError(this.getNode(), error);
		}
	}

	return [returnData];
}
