import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';

export async function pollForBatchResult(
	executeFunctions: IExecuteFunctions,
	jobId: string,
	maxAttempts: number,
): Promise<Record<string, unknown>> {
	let attempts = 0;
	let lastResponse: Record<string, unknown> | null = null;

	while (attempts < maxAttempts) {
		const response = (await executeFunctions.helpers.httpRequestWithAuthentication.call(
			executeFunctions,
			'fluentCApi',
			{
				method: 'POST',
				url: 'https://dashboard.fluentc.io/ai_agent/results',
				body: { job_id: jobId },
				json: true,
			},
		)) as Record<string, unknown>;

		lastResponse = response;

		if (response.status === 'complete') {
			return response;
		}

		if (response.status === 'failed') {
			throw new NodeOperationError(
				executeFunctions.getNode(),
				`Batch translation failed: ${response.error}`,
			);
		}

		const waitSeconds = Math.max((response.estimated_wait_seconds as number) || 0, 5);
		const startTime = Date.now();
		while (Date.now() - startTime < waitSeconds * 1000) {
			await Promise.resolve();
		}

		attempts++;
	}

	throw new NodeOperationError(
		executeFunctions.getNode(),
		`Batch translation timed out for job_id ${jobId} after ${maxAttempts} attempts. Last response: ${JSON.stringify(lastResponse)}`,
	);
}
