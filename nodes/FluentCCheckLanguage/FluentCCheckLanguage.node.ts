import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

export class FluentCCheckLanguage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FluentC Check Language',
		name: 'fluentCCheckLanguage',
		icon: 'file:logo192.png',
		group: ['transform'],
		version: 1,
		description: 'Detect the language of text or HTML content using FluentC AI',
		defaults: {
			name: 'FluentC Check Language',
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
				displayName: 'Input',
				name: 'input',
				type: 'string',
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
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
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
						url: 'https://dashboard.fluentc.ai/ai_agent/checklanguage',
						body: requestBody,
						json: true,
					},
				);

				returnData.push({
					json: {
						...response,
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
				throw error;
			}
		}

		return [returnData];
	}
}