import { invoke } from "@tauri-apps/api/core";

export const collateDocument = async (query: string) => (
	await invoke("search_user_documents", { query: query })
		.then((res) => {
      return res;
		})
		.catch((error) => {
			console.log(error);
		})
);
