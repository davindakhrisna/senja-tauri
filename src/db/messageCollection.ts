import { initDB } from "./client";

let messageCollectionInstance: any = null;

export async function createMessageCollection() {
	// Protect against server-side execution
	if (typeof window === "undefined") {
		console.log("messageCollection: Not in browser, skipping");
		return null;
	}

	if (messageCollectionInstance) {
		console.log("createMessageCollection: Returning existing collection");
		return messageCollectionInstance;
	}

	try {
		console.log("createMessageCollection: Initializing database");
		const db = await initDB();

		if (!db) {
			console.error(
				"createMessageCollection: Database initialization returned null",
			);
			return null;
		}

		console.log("createMessageCollection: Adding collections");
		if (!db.messages) {
			await db.addCollections({
				messages: {
					schema: {
						version: 0,
						primaryKey: "id",
						type: "object",
						properties: {
							id: {
								type: "string",
								maxLength: 100,
							},
							sessionId: {
								type: "string",
								index: true,
							},
							title: {
								type: "string",
							},
							message: {
								type: "string",
							},
							role: {
								type: "string",
							},
							createdAt: {
								type: "string",
								format: "date-time",
							},
						},
						required: ["id", "sessionId", "message", "role", "createdAt"],
					},
				},
			});
			console.log("createMessageCollection: Collections added successfully");
		}

		// Return the RxDB collection directly
		messageCollectionInstance = db.messages;

		console.log("createMessageCollection: Collection created successfully");
		return messageCollectionInstance;
	} catch (error) {
		console.error(
			"createMessageCollection: Failed to create collection",
			error,
		);
		throw error;
	}
}
