import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { getCurrent } from "@tauri-apps/api/window";
import ReactDOM from "react-dom/client";
import { StoreProvider, useStore } from "./auth";
import "./index.css";
import { routeTree } from "./routeTree.gen";
import { ThemeProvider } from "./theme_context";
import { TiptapProvider } from "./tiptap_context";

document.addEventListener("DOMContentLoaded", async () => {
	await getCurrent().show();
});

//await getCurrent().listen('webview-loaded', async () => await getCurrent().show());
const queryClient = new QueryClient();
const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultPreloadStaleTime: 0,
	context: {
		auth: undefined!,
		queryClient: queryClient,
	},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function InnerApp() {
	const auth = useStore();
	return <RouterProvider router={router} context={{ auth }} />;
}

function App() {
	return (
		<ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
			<TiptapProvider>
				<StoreProvider>
					<QueryClientProvider client={queryClient}>
						<InnerApp />
					</QueryClientProvider>
				</StoreProvider>
			</TiptapProvider>
		</ThemeProvider>
	);
}

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<div className="h-screen w-full bg-white dark:bg-stone-900 overflow-x-hidden">
			<App />
		</div>,
	);
}
