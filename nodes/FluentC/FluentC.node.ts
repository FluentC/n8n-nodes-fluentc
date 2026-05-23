import {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import * as getMany from './actions/language/getMany.operation';
import * as detect from './actions/languageDetection/detect.operation';
import * as translate from './actions/translation/translate.operation';
import { getSourceLanguages, getTargetLanguages } from './methods/loadOptions';

export class FluentC implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FluentC',
		name: 'fluentC',
		icon: 'file:logo192.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Translate content, detect languages, and retrieve supported languages using FluentC AI',
		defaults: {
			name: 'FluentC',
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
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Translation',
						value: 'translation',
					},
					{
						name: 'Language Detection',
						value: 'languageDetection',
					},
					{
						name: 'Language',
						value: 'language',
					},
				],
				default: 'translation',
			},
			...translate.description,
			...detect.description,
			...getMany.description,
		],
	};

	methods = {
		loadOptions: {
			getTargetLanguages,
			getSourceLanguages,
		},
	};

	async execute(this: IExecuteFunctions) {
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		if (resource === 'translation' && operation === 'translate') {
			return translate.execute.call(this);
		}

		if (resource === 'languageDetection' && operation === 'detect') {
			return detect.execute.call(this);
		}

		if (resource === 'language' && operation === 'getMany') {
			return getMany.execute.call(this);
		}

		throw new NodeOperationError(
			this.getNode(),
			`The operation "${operation}" is not supported for resource "${resource}".`,
		);
	}
}
