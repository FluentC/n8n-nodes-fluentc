import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

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

function mapLanguages(languages: Array<{ code: string; name: string }>, includeFallbackHint = false) {
	return languages.map((lang) => ({
		name: `${lang.name} (${lang.code})`,
		value: lang.code,
		description: includeFallbackHint
			? `${lang.name} - Visit www.fluentc.io to enable if not available`
			: lang.name,
	}));
}

async function fetchLanguages(
	this: ILoadOptionsFunctions,
): Promise<Array<{ code: string; name: string }>> {
	const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'fluentCApi', {
		method: 'GET',
		url: 'https://dashboard.fluentc.io/ai_agent/languages',
		json: true,
	})) as { supported_languages: Array<{ code: string; name: string }> };

	return response.supported_languages;
}

export async function getTargetLanguages(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	try {
		const languages = await fetchLanguages.call(this);
		return mapLanguages(languages);
	} catch {
		return mapLanguages(FALLBACK_LANGUAGES, true);
	}
}

export async function getSourceLanguages(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	try {
		const languages = await fetchLanguages.call(this);
		const options = mapLanguages(languages);
		options.unshift({
			name: 'Auto-Detect',
			value: '',
			description: 'Automatically detect source language',
		});
		return options;
	} catch {
		const options = mapLanguages(FALLBACK_LANGUAGES, true);
		options.unshift({
			name: 'Auto-Detect',
			value: '',
			description: 'Automatically detect source language',
		});
		return options;
	}
}
