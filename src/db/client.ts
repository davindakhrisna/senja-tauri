import { createRxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";

let dbInstance: any = null;

export async function initDB() {
	// Only initialize in browser environment
	if (typeof window === "undefined") {
		console.log("initDB: Not in browser, skipping");
		return null;
	}

	if (dbInstance) {
		console.log("initDB: Returning existing instance");
		return dbInstance;
	}

	try {
		console.log("initDB: Creating new database instance");
		const storage = getRxStorageDexie();

		// Check if database exists and needs migration
		const dbExists = await indexedDB.databases().then((dbs) =>
			dbs.some((db) => db.name === "appdb"),
		);

		if (dbExists) {
			// Delete old database to force schema refresh
			console.log("initDB: Deleting old database for schema migration");
			await indexedDB.deleteDatabase("appdb");
		}

		dbInstance = await createRxDatabase({
			name: "appdb",
			storage,
			multiInstance: false,
			eventReduce: true,
		});

		console.log("initDB: Database created successfully");
		return dbInstance;
	} catch (error) {
		console.error("initDB: Failed to create database", error);
		throw error;
	}
}

// Cleanup for HMR
if (typeof window !== "undefined" && import.meta.hot) {
	import.meta.hot.dispose(async () => {
		console.log("HMR: Disposing database");
		if (dbInstance) {
			await dbInstance.destroy();
			dbInstance = null;
		}
	});
}
