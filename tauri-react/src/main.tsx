import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { getCurrent } from "@tauri-apps/api/window";
import ReactDOM from "react-dom/client";
import { StoreProvider, useStore } from "./auth";
import "@/index.css";
import { routeTree } from "./routeTree.gen";
import { ThemeProvider } from "@/context/theme_context";
import { TiptapProvider } from "@/context/tiptap_context";
import { FontFamilyProvider } from "./context/font_context";

document.addEventListener("DOMContentLoaded", async () => {
	await getCurrent().show();
});

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
			<FontFamilyProvider>
				<TiptapProvider>
					<StoreProvider>
						<QueryClientProvider client={queryClient}>
							<InnerApp />
						</QueryClientProvider>
					</StoreProvider>
				</TiptapProvider>
			</FontFamilyProvider>
		</ThemeProvider>
	);
}

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<div className="h-screen w-full overflow-none">
			<App />
		</div>,
	);
}
