import { useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export const useDocuments = () => {
	return useQuery({
		queryKey: ["documents"],
		initialData: [],
		queryFn: () =>
			invoke("get_documents")
				.then((res) => {
					console.log("updating documents");
					return res.documents;
				})
				.catch((error) => {
					console.log(error);
				}),
	});
};

export const saveDocument = async (filename, foldername) => {
	await invoke("save_document", {
		filename: filename,
		content: "",
		foldername: foldername,
	})
		.then(() => {
			console.log("worked");
			return true;
		})
		.catch((error) => {
			console.log(error);
		});
};

export const updateDocument = async (filename, foldername, content, id) => {
	await invoke("update_document", {
		filename: filename,
		content: content,
		foldername: foldername,
		currId: id,
	})
		.then((doc_id) => {
			console.log(doc_id);
		})
		.catch((error) => {
			console.log(error);
		});
};

export const currDocument = () =>
	useQuery({
		queryKey: ["doc"],
		initialData: {
			filename: "",
			foldername: "unfiled",
			id: "",
		},
	});

