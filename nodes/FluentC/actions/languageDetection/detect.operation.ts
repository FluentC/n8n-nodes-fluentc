import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

import { rethrowExecutionError } from '../../utils/rethrowExecutionError';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['languageDetection'],
			},
		},
		options: [
			{
				name: 'Detect',
				value: 'detect',
				description: 'Detect the language of text or HTML content',
				action: 'Detect language',
			},
		],
		default: 'detect',
	},
	{
		displayName: 'Input',
		name: 'input',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['languageDetection'],
				operation: ['detect'],
			},
		},
		typeOptions: {
			rows: 4,
		},
		default: '',
		placeholder: 'Text or HTML to analyze',
		description: 'Content to detect language for',
		required: true,
	},
	{
		displayName: 'Input Format',
		name: 'inputFormat',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['languageDetection'],
				operation: ['detect'],
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
		],
		default: 'text',
		description: 'Format of the input content',
	},
];

export async function execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		try {
			const input = this.getNodeParameter('input', i) as string;
			const inputFormat = this.getNodeParameter('inputFormat', i) as string;

			const requestBody = {
				input,
				input_format: inputFormat,
			};

			const response = await this.helpers.httpRequestWithAuthentication.call(
				this,
				'fluentCApi',
				{
					method: 'POST',
					url: 'https://dashboard.fluentc.io/ai_agent/checklanguage',
					body: requestBody,
					json: true,
				},
			);

			returnData.push({
				json: {
					...(response as Record<string, unknown>),
					input_format: inputFormat,
					input_length: input.length,
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
