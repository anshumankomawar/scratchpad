import { toast } from "@/components/ui/use-toast";
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
		})
		.catch(() => {
			toast({
				itemID: "login",
				description: "incorrect username or password",
			});
		});
};

export const register = async (
	email: string,
	password: string,
	router: Router,
) => {
	await invoke("register", { username: email, password: password })
		.then((_) => {
			router.invalidate();
		})
		.catch(() => {
			toast({
				itemID: "register",
				description: "username already exists",
			});
		});
};
