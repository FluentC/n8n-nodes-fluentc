import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

export class FluentCTranslate implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FluentC Translate',
		name: 'fluentCTranslate',
		icon: 'file:logo192.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["mode"]}} translation',
		description: 'Translate text or HTML using FluentC AI',
		defaults: {
			name: 'FluentC Translate',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'fluentCApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Mode',
				name: 'mode',
				type: 'options',
				options: [
					{
						name: 'Real-time',
						value: 'real-time',
						description: 'Synchronous translation (faster for small content)',
					},
					{
						name: 'Batch',
						value: 'batch',
						description: 'Asynchronous translation (better for large content)',
					},
				],
				default: 'real-time',
				description: 'Choose translation processing mode',
			},
			{
				displayName: 'Input',
				name: 'input',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				placeholder: 'Text or HTML to translate',
				description: 'Content to be translated (max 100,000 bytes)',
				required: true,
			},
			{
				displayName: 'Input Format',
				name: 'inputFormat',
				type: 'options',
				options: [
					{
						name: 'Text',
						value: 'text',
					},
					{
						name: 'HTML',
						value: 'html',
					},
				],
				default: 'text',
				description: 'Format of the input content',
			},
			{
				displayName: 'Target Language',
				name: 'targetLanguage',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTargetLanguages',
				},
				default: '',
				description: 'Select target language for translation',
				required: true,
			},
			{
				displayName: 'Source Language',
				name: 'sourceLanguage',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getSourceLanguages',
				},
				default: '',
				description: 'Select source language. Leave empty for auto-detection.',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				options: [
					{
						displayName: 'Max Polling Attempts',
						name: 'maxPollingAttempts',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 100,
						},
						default: 30,
						description: 'Maximum number of polling attempts for batch jobs',
						displayOptions: {
							show: {
								'/mode': ['batch'],
							},
						},
					},
					{
						displayName: 'Manage Languages',
						name: 'manageLanguagesNotice',
						type: 'notice',
						default: '',
						displayOptions: {
							show: {
								'/targetLanguage': [''],
							},
						},
						typeOptions: {
							theme: 'info',
						},
						description: 'To enable additional languages for your API key, visit <a href="https://www.fluentc.io" target="_blank">www.fluentc.io</a>',
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			async getTargetLanguages(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'fluentCApi',
						{
							method: 'GET',
							url: 'https://dashboard.fluentc.ai/ai_agent/languages',
							json: true,
						},
					);

					const languages = response.supported_languages;
					
					return languages.map((lang: any) => ({
						name: `${lang.name} (${lang.code})`,
						value: lang.code,
						description: lang.name,
					}));

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

					return fallbackLanguages.map((lang) => ({
						name: `${lang.name} (${lang.code})`,
						value: lang.code,
						description: `${lang.name} - Visit www.fluentc.io to enable if not available`,
					}));
				}
			},
			async getSourceLanguages(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'fluentCApi',
						{
							method: 'GET',
							url: 'https://dashboard.fluentc.ai/ai_agent/languages',
							json: true,
						},
					);

					const languages = response.source_languages;
					
					const options = languages.map((lang: any) => ({
						name: `${lang.name} (${lang.code})`,
						value: lang.code,
						description: lang.name,
					}));

					// Add auto-detect option for source language
					options.unshift({
						name: 'Auto-detect',
						value: '',
						description: 'Automatically detect source language',
					});
					
					return options;

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

					const options = fallbackLanguages.map((lang) => ({
						name: `${lang.name} (${lang.code})`,
						value: lang.code,
						description: `${lang.name} - Visit www.fluentc.io to enable if not available`,
					}));

					// Add auto-detect option for source language
					options.unshift({
						name: 'Auto-detect',
						value: '',
						description: 'Automatically detect source language',
					});

					return options;
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const mode = this.getNodeParameter('mode', i) as string;
				const input = this.getNodeParameter('input', i) as string;
				const inputFormat = this.getNodeParameter('inputFormat', i) as string;
				const targetLanguage = this.getNodeParameter('targetLanguage', i) as string;
				const sourceLanguage = this.getNodeParameter('sourceLanguage', i) as string;
				const additionalFields = this.getNodeParameter('additionalFields', i) as any;

				// Validate input size
				if (Buffer.byteLength(input, 'utf8') > 100000) {
					throw new NodeOperationError(this.getNode(), 'Input content exceeds 100,000 bytes limit');
				}

				// Prepare request body
				const requestBody: any = {
					input,
					input_format: inputFormat,
					target_language: targetLanguage,
					mode,
				};

				if (sourceLanguage) {
					requestBody.source_language = sourceLanguage;
				}

				// Make initial translation request
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'fluentCApi',
					{
						method: 'POST',
						url: 'https://dashboard.fluentc.ai/ai_agent/translate',
						body: requestBody,
						json: true,
					},
				);

				let result;

				if (mode === 'real-time') {
					// Real-time mode returns immediate result
					result = response;
				} else {
					// Batch mode requires polling
					const jobId = response.job_id;
					const maxAttempts = additionalFields.maxPollingAttempts || 30;
					
					result = await FluentCTranslate.pollForBatchResult(this, jobId, maxAttempts);
				}

				// Return all fields including metadata
				returnData.push({
					json: {
						...result,
						mode,
						input_format: inputFormat,
						target_language: targetLanguage,
						...(sourceLanguage && { source_language: sourceLanguage }),
					},
					pairedItem: {
						item: i,
					},
				});

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : String(error),
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}

	private static async pollForBatchResult(executeFunctions: IExecuteFunctions, jobId: string, maxAttempts: number): Promise<any> {
		let attempts = 0;
		
		while (attempts < maxAttempts) {
			const response = await executeFunctions.helpers.httpRequestWithAuthentication.call(
				executeFunctions,
				'fluentCApi',
				{
					method: 'POST',
					url: 'https://dashboard.fluentc.ai/ai_agent/results',
					body: { job_id: jobId },
					json: true,
				},
			);

			if (response.status === 'complete') {
				return response;
			}

			if (response.status === 'failed') {
				throw new NodeOperationError(executeFunctions.getNode(), `Batch translation failed: ${response.error}`);
			}

			// Wait for the recommended time before next poll
			const waitSeconds = response.estimated_wait_seconds || 5;
			await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
			
			attempts++;
		}

		throw new NodeOperationError(executeFunctions.getNode(), `Batch translation timed out after ${maxAttempts} attempts`);
	}
}