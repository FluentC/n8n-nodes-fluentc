
import { FluentCApi } from './credentials/FluentCApi.credentials';
import { FluentCTranslate } from './nodes/FluentCTranslate/FluentCTranslate.node';
import { FluentCCheckLanguage } from './nodes/FluentCCheckLanguage/FluentCCheckLanguage.node';

module.exports = {
	credentials: {
		FluentCApi,
	},
	nodes: {
		FluentCTranslate,
		FluentCCheckLanguage,
	},
};