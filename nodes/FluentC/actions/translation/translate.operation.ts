import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	NodeOperationError,
	NodeParameterValue,
} from 'n8n-workflow';

import { pollForBatchResult } from '../../utils/pollForBatchResult';
import { rethrowExecutionError } from '../../utils/rethrowExecutionError';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['translation'],
			},
		},
		options: [
			{
				name: 'Translate',
				value: 'translate',
				description: 'Translate text, HTML, or JSON content',
				action: 'Translate content',
			},
		],
		default: 'translate',
	},
	{
		displayName: 'Mode',
		name: 'mode',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['translation'],
				operation: ['translate'],
			},
		},
		options: [
			{
				name: 'Real-Time',
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
		displayOptions: {
			show: {
				resource: ['translation'],
				operation: ['translate'],
			},
		},
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
		displayOptions: {
			show: {
				resource: ['translation'],
				operation: ['translate'],
			},
		},
		options: [
			{
				name: 'Text',
				value: 'text',
			},
			{
				name: 'HTML',
				value: 'html',
			},
			{
				name: 'JSON',
				value: 'json',
			},
		],
		default: 'text',
		description: 'Format of the input content',
	},
	{
		displayName: 'Target Language',
		name: 'targetLanguage',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['translation'],
				operation: ['translate'],
			},
		},
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
		displayOptions: {
			show: {
				resource: ['translation'],
				operation: ['translate'],
			},
		},
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
		displayOptions: {
			show: {
				resource: ['translation'],
				operation: ['translate'],
			},
		},
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
				default: 60,
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
				description:
					'To enable additional languages for your API key, visit <a href="https://www.fluentc.io" target="_blank">www.fluentc.io</a>',
			},
		],
	},
];

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const mode = this.getNodeParameter('mode', i) as string;
			const rawInput = this.getNodeParameter('input', i) as NodeParameterValue;
			const inputFormat = this.getNodeParameter('inputFormat', i) as string;
			const targetLanguage = this.getNodeParameter('targetLanguage', i) as string;
			const sourceLanguage = this.getNodeParameter('sourceLanguage', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as {
				maxPollingAttempts?: number;
			};

			const inputAsString =
				typeof rawInput === 'string' ? rawInput : JSON.stringify(rawInput ?? '');

			if (Buffer.byteLength(inputAsString, 'utf8') > 100000) {
				throw new NodeOperationError(
					this.getNode(),
					'Input content exceeds 100,000 bytes limit',
				);
			}

			let preparedInput: unknown = rawInput;

			if (inputFormat === 'json') {
				if (typeof rawInput === 'string') {
					try {
						preparedInput = JSON.parse(rawInput);
					} catch (error) {
						throw new NodeOperationError(
							this.getNode(),
							`Invalid JSON input: ${(error as Error).message}`,
							{ itemIndex: i },
						);
					}
				}
			} else if (typeof rawInput !== 'string') {
				preparedInput = inputAsString;
			}

			const requestBody: Record<string, unknown> = {
				input: preparedInput,
				input_format: inputFormat,
				target_language: targetLanguage,
				mode,
			};

			if (sourceLanguage) {
				requestBody.source_language = sourceLanguage;
			}

			const response = (await this.helpers.httpRequestWithAuthentication.call(
				this,
				'fluentCApi',
				{
					method: 'POST',
					url: 'https://dashboard.fluentc.io/ai_agent/translate',
					body: requestBody,
					json: true,
				},
			)) as Record<string, unknown>;

			let result: Record<string, unknown>;

			if (mode === 'real-time') {
				result = response;
			} else {
				const jobId = response.job_id as string;
				const maxAttempts = additionalFields.maxPollingAttempts || 60;
				result = await pollForBatchResult(this, jobId, maxAttempts);
			}

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
			rethrowExecutionError(this.getNode(), error, i);
		}
	}

	return [returnData];
}
