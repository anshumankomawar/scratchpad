import { invoke } from "@tauri-apps/api/core";

export const addFolder = async (foldername) =>
	await invoke("add_folder", {
		foldername: foldername,
	})
		.then((folder_id) => {
			console.log("save", folder_id);
			return folder_id;
		})
		.catch((error) => {
			console.log(error);
		});
