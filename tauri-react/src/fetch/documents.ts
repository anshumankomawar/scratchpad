import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export const useDocuments = () => {
	return useQuery({
		queryKey: ["documents"],
		initialData: {},
		queryFn: async () =>
			await invoke("get_documents")
				.then((res) => {
					return res.folders;
				})
				.catch((error) => {
					console.log(error);
				}),
	});
};

export const saveDocument = async (filename, folder_id) => {
	return await invoke("save_document", {
		filename: filename,
		content: "",
		folderId: folder_id,
	})
		.then((doc_id) => {
			console.log("save", doc_id);
			return doc_id;
		})
		.catch((error) => {
			console.log(error);
		});
};

export const updateDocument = async (filename, folderId, content, currId) => {
	return await invoke("update_document", {
		filename: filename,
		content: content,
		folderId: folderId,
		currId: currId,
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
