import { type StoreContext } from "@/auth";
import LoginComponent from "@/components/login/login";
import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { QueryClient, useMutation } from "@tanstack/react-query";
import {
	Outlet,
	createRootRouteWithContext,
	useRouter,
} from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api/core";
import {
	ChevronsLeft,
	Menu,
	PanelLeft,
	PanelLeftOpen,
	PanelRightOpen,
} from "lucide-react";
import { useState } from "react";
import { Panel, usePanelStore } from "@/app_state";
import { cn } from "@/lib/utils";

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
	const { toast } = useToast();
	const router = useRouter();

	const mutation = useMutation({
		mutationFn: async () => {
			invoke("login", { username: email, password: password })
				.then((_) => {
					router.invalidate();
					console.log("Successfully logged in!");
				})
				.catch((error) => {
					console.log(error);
					toast({
						variant: "destructive",
						title: "Uh oh! Something went wrong.",
						description: error.code,
						action: <ToastAction altText="Try again">Try again</ToastAction>,
					});
				});
		},
	});

	const handleLogin = async () => {
		// TODO: Don't let multiple requests go through when logging in
		setIsSubmitting(true);
		mutation.mutate();
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
	const panel = usePanelStore((state) => state);

	return (
		<div className="relative z-0 h-full w-full">
			<div className="z-50 fixed w-full top-0 h-10">
				<div
					className={cn(
						"transition-all h-full flex flex-row items-center",
						panel.left ? "pl-40" : "pl-20",
					)}
					data-tauri-drag-region
				>
					<Button
						variant="ghost"
						size="menu"
						className="hover:cursor-pointer"
						onClick={() => panel.togglePanel(Panel.LEFT)}
						asChild
					>
						{panel.left ? (
							<ChevronsLeft className="stroke-dull_black dark:stroke-dark2 dark:stroke-dull_white" />
						) : (
							<Menu className="stroke-dull_black dark:stroke-dull_white" />
						)}
					</Button>
				</div>
			</div>
			<div className="-z-10 top-0 left-0 h-full w-full">
				<Outlet />
			</div>
		</div>
	);
}
