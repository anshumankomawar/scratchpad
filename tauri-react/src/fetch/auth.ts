import { Router } from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api/core";

export const login = async (
	email: string,
	password: string,
	router: Router,
) => {
	await invoke("login", { username: email, password: password })
		.then((_) => {
			router.invalidate();
			console.log("Successfully logged in!");
		})
		.catch((error) => {
			console.log(error);
		});
};
