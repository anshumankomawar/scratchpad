import { useFileManager } from "@/app_state";
import SyncManager from "@/utilities/sync";
import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { BaseDirectory } from "@tauri-apps/plugin-fs";
import { toast } from "@/components/ui/use-toast";
import { Store } from "@tauri-apps/plugin-store";

export const useDocuments = () => {
	return useQuery({
		queryKey: ["documents"],
		initialData: {},
		queryFn: async () => ({}),
	});
};

export const saveDocument = async (filename, folder_id, filetype) => {
	return await invoke("save_document", {
		filename: filename,
		content: "",
		folderId: folder_id,
		filetype: filetype,
	})
		.then((doc_id) => {
			console.log("save", doc_id);
			return doc_id;
		})
		.catch((error) => {
			console.log(error);
		});
};

function calculateTimeDifference(prevSyncStr, currentSyncStr) {
	const url = "http://localhost:8000/v1/sync";
	try {
		const prevSync = new Date(prevSyncStr);
		const currentSync = new Date(currentSyncStr);

		const diffMs = currentSync - prevSync;

		const diffSeconds = Math.floor(diffMs / 1000);

		if (diffSeconds < 60) {
			return `${diffSeconds} seconds`;
		} else {
			const diffMinutes = Math.floor(diffSeconds / 60);
			return `${diffMinutes} minutes`;
		}
	} catch (error) {
		console.error("Error parsing date:", error);
	}
}

function getFormattedDate(): string {
	const now = new Date();

	const options: Intl.DateTimeFormatOptions = {
		weekday: "long", // "Monday" through "Sunday"
		year: "numeric", // 4 digit year
		month: "long", // "January" through "December"
		day: "numeric", // 1, 2, ..., 31
		hour: "numeric", // 2-digit hour
		minute: "2-digit", // 2-digit minute
		hour12: true, // Use 12-hour clock
	};

	const formattedDate = new Intl.DateTimeFormat("en-US", options).format(now);

	return formattedDate.replace(",", " at"); // Replaces the first comma with ' at'
}

export const performSync = async () => {
	const url = "http://localhost:8000/v1/sync";
	try {
		const store = new Store("config.json");
		const syncManager = SyncManager.getInstance(
			useFileManager.getState().syncPath,
			BaseDirectory.AppData,
		);

		const syncData = await syncManager.readSyncFile();
		if (SyncManager.isEmptySyncData(syncData)) {
			return;
		}

		const prevSync = await store.get("last_sync");
		if (!prevSync) {
			await store.set("last_sync", new Date().toISOString());
		}

		useFileManager.setState({ isSyncing: true });
		const { update } = toast({
			itemID: "sync",
			title: "Syncing...",
			description: getFormattedDate(),
		});

		useFileManager.setState({ syncPath: "sync_swap.json" });

		const token = await store.get("token");
		const response = await fetch(url, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(syncData),
		});

		if (!response.ok) {
			const errorDetails = await response.json(); // Assuming the server sends back JSON details about the error
			const currentSync = new Date().toISOString();
			useFileManager.setState({
				isSyncing: false,
				lastSync: calculateTimeDifference(prevSync, currentSync),
			});
			await store.set("last_sync", currentSync);
			update({
				id: "sync",
				title: "Sync Failed.",
				variant: "destructive",
				description: "Settings could not be updated",
			});
			throw new Error(
				`Network response was not ok, status: ${response.status}${errorDetails}`,
			);
		}
		const data = await response.json();
		syncManager.swapSyncFile();
		syncManager.resetSwapFile();
		const currentSync = new Date().toISOString();
		useFileManager.setState({
			isSyncing: false,
			lastSync: calculateTimeDifference(prevSync, currentSync),
		});
		await store.set("last_sync", currentSync);
		update({
			id: "sync",
			title: "Synced.",
			variant: "success",
			duration: 1000,
			description: "Settings have been updated",
		});
	} catch (error) {
		console.error("Failed to sync:", error);
	}
};

export function syncData() {
	performSync();
	setInterval(performSync, 10000);
}

export const updateDocument = async (
	filename,
	folderId,
	content,
	currId,
	filetype,
) => {
	return await invoke("update_document", {
		filename: filename,
		content: content,
		folderId: folderId,
		currId: currId,
		filetype: filetype,
	})
		.then((doc_id) => {
			console.log("update", doc_id);
			return doc_id;
		})
		.catch((error) => {
			console.log(error);
		});
};

export const deleteDocument = async (fileId) => {
	return await invoke("delete_document", {
		fileId: fileId,
	})
		.then((_) => {})
		.catch((error) => {
			console.log(error);
		});
};
