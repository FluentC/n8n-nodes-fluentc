import { INode, JsonObject, NodeApiError, NodeOperationError } from 'n8n-workflow';

export function rethrowExecutionError(
	node: INode,
	error: unknown,
	itemIndex?: number,
): never {
	if (error instanceof NodeOperationError || error instanceof NodeApiError) {
		throw error;
	}

	throw new NodeApiError(
		node,
		error as JsonObject,
		itemIndex !== undefined ? { itemIndex } : undefined,
	);
}
