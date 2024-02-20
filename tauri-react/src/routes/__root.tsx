import { type StoreContext } from "@/auth";
import Header from "@/components/header/header";
import LoginComponent from "@/components/login/login";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { login } from "@/fetch/auth";
import { QueryClient, useMutation } from "@tanstack/react-query";
import {
	Outlet,
	createRootRouteWithContext,
	useRouter,
} from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

export interface MyRouterContext {
	auth: StoreContext;
	queryClient: QueryClient;
}

export type LoginType = {
	access_token: string;
	token_type: string;
};

interface LoaderData {
	token: string;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	loader: async ({ context }) => {
		const token = await context.auth.store.get("token");
		return { token };
	},
	component: () => {
		const { token } = Route.useLoaderData<LoaderData>();
		if (token !== null) return <ProtectedRoute />;
		return <PublicRoute />;
	},
});

function PublicRoute() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();

	const handleLogin = async () => {
		setIsSubmitting(true);
		await login(email, password, router);
		setIsSubmitting(false);
	};

	return (
		<>
			<LoginComponent
				handleLogin={handleLogin}
				isSubmitting={isSubmitting}
				email={email}
				setEmail={setEmail}
				password={password}
				setPassword={setPassword}
			/>
			<Toaster />
		</>
	);
}

function ProtectedRoute() {
	return (
		<div className="relative z-0 h-full w-full">
			<div className="z-50 fixed w-full top-0 h-10">
				<Header />
			</div>
			<div className="-z-10 top-0 left-0 h-full w-full">
				<Outlet />
			</div>
		</div>
	);
}
