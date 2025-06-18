import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

export class FluentCLanguages implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FluentC Languages',
		name: 'fluentCLanguages',
		icon: 'file:logo192.png',
		group: ['transform'],
		version: 1,
		description: 'Fetches supported and source languages from FluentC AI',
		defaults: {
			name: 'FluentC Languages',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'fluentCApi',
				required: true,
			},
		],
		properties: [],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: INodeExecutionData[] = [];

		try {
			const response = await this.helpers.httpRequestWithAuthentication.call(
				this,
				'fluentCApi',
				{
					method: 'GET',
					url: 'https://dashboard.fluentc.io/ai_agent/languages',
					json: true,
				},
			);

			returnData.push({
				json: {
					supported_languages: response.supported_languages,
					source_languages: response.source_languages,
				},
			});

		} catch (error) {
			// Fallback to common languages if API call fails
			const fallbackLanguages = [
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

			if (this.continueOnFail()) {
				returnData.push({
					json: {
						error: error instanceof Error ? error.message : String(error),
						supported_languages: fallbackLanguages,
						source_languages: fallbackLanguages,
					},
				});
			} else {
				throw error;
			}
		}

		return [returnData];
	}
} 