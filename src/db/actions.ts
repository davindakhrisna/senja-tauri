import { createMessageCollection } from "./messageCollection";

let collectionPromise: Promise<any> | null = null;

async function getCollection() {
	if (typeof window === "undefined") {
		return null;
	}

	if (!collectionPromise) {
		collectionPromise = createMessageCollection();
	}
	return collectionPromise;
}

export const MessageActions = {
	/**
	 * Get all messages for a specific session
	 */
	async getSessionMessages(sessionId: string) {
		try {
			const collection = await getCollection();
			if (!collection) return [];

			const docs = await collection
				.find({
					selector: { sessionId },
					sort: [{ createdAt: "asc" }],
				})
				.exec();

			return docs.map((doc: any) => ({
				id: doc.id,
				sessionId: doc.sessionId,
				title: doc.title,
				message: doc.message,
				role: doc.role,
				createdAt: doc.createdAt,
			}));
		} catch (error) {
			console.error("MessageActions.getSessionMessages error:", error);
			throw error;
		}
	},

	/**
	 * Get all unique session IDs with their latest message info
	 */
	async getSessionIds() {
		try {
			const collection = await getCollection();
			if (!collection) return [];

			const docs = await collection
				.find({
					sort: [{ createdAt: "desc" }],
				})
				.exec();

			// Group by sessionId
			const sessionMap = new Map<
				string,
				{ id: string; title: string; lastMessageAt: string }
			>();

			docs.forEach((doc: any) => {
				const existing = sessionMap.get(doc.sessionId);
				if (!existing) {
					sessionMap.set(doc.sessionId, {
						id: doc.sessionId,
						title: doc.title || "New Chat",
						lastMessageAt: doc.createdAt,
					});
				} else {
					// If we already have the session (which means we have its LATEST message due to sort)
					// but the title is "New Chat", try to use this older message's title if it's better
					if (existing.title === "New Chat" && doc.title) {
						existing.title = doc.title;
					}
				}
			});

			return Array.from(sessionMap.values()).sort(
				(a, b) =>
					new Date(b.lastMessageAt).getTime() -
					new Date(a.lastMessageAt).getTime(),
			);
		} catch (error) {
			console.error("MessageActions.getSessionIds error:", error);
			throw error;
		}
	},

	/**
	 * Get session title by sessionId
	 */
	async getSessionTitle(sessionId: string) {
		try {
			const collection = await getCollection();
			if (!collection) return null;

			const doc = await collection
				.findOne({
					selector: { sessionId },
					sort: [{ createdAt: "asc" }],
				})
				.exec();

			return doc?.title || null;
		} catch (error) {
			console.error("MessageActions.getSessionTitle error:", error);
			throw error;
		}
	},

	/**
	 * Save a message to the database
	 */
	async saveMessage(
		sessionId: string,
		role: string,
		message: string,
		title?: string,
	) {
		const collection = await getCollection();
		if (!collection) throw new Error("Collection not initialized");

		await collection.insert({
			id: crypto.randomUUID(),
			sessionId,
			title: title || "",
			message,
			role,
			createdAt: new Date().toISOString(),
		});
	},

	/**
	 * Update the title for all messages in a session
	 */
	async updateSessionTitle(sessionId: string, title: string) {
		const collection = await getCollection();
		if (!collection) throw new Error("Collection not initialized");

		const docs = await collection
			.find({
				selector: { sessionId },
			})
			.exec();

		for (const doc of docs) {
			await doc.patch({ title });
		}
	},

	/**
	 * Delete a session and all its messages
	 */
	async deleteSession(sessionId: string) {
		const collection = await getCollection();
		if (!collection) throw new Error("Collection not initialized");

		const docs = await collection
			.find({
				selector: { sessionId },
			})
			.exec();

		for (const doc of docs) {
			await doc.remove();
		}
	},

	/**
	 * Delete all messages and sessions
	 */
	async clearAllMessages() {
		const collection = await getCollection();
		if (!collection) throw new Error("Collection not initialized");

		const docs = await collection.find().exec();
		for (const doc of docs) {
			await doc.remove();
		}
	},

	// Legacy methods for backwards compatibility
	async getChat(id: string) {
		return this.getSessionMessages(id);
	},

	async getId(sessionId: string) {
		try {
			const collection = await getCollection();
			if (!collection) return null;

			const doc = await collection.findOne(sessionId).exec();
			return doc ? { id: doc.id } : null;
		} catch {
			return "NULL";
		}
	},

	async add(title: string, role: string, message: string) {
		const collection = await getCollection();
		if (!collection) throw new Error("Collection not initialized");

		await collection.insert({
			id: crypto.randomUUID(),
			sessionId: crypto.randomUUID(),
			title,
			message,
			role,
			createdAt: new Date().toISOString(),
		});
	},

	async update(
		id: string,
		changes: Partial<{ title: string; completed: boolean }>,
	) {
		const collection = await getCollection();
		if (!collection) throw new Error("Collection not initialized");

		const doc = await collection.findOne(id).exec();
		if (doc) {
			const patch: any = {};
			if (typeof changes.title !== "undefined") patch.title = changes.title;
			if (typeof changes.completed !== "undefined")
				patch.completed = changes.completed;
			if (Object.keys(patch).length > 0) {
				await doc.patch(patch);
			}
		}
	},

	async remove(id: string) {
		const collection = await getCollection();
		if (!collection) throw new Error("Collection not initialized");

		const doc = await collection.findOne(id).exec();
		if (doc) {
			await doc.remove();
		}
	},
};
