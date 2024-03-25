import { ThemeProvider } from "@/context/theme_context";
import { TiptapProvider } from "@/context/tiptap_context";
import "@/index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { StoreProvider, useStore } from "./auth";
import { FontFamilyProvider } from "./context/font_context";
import { routeTree } from "./routeTree.gen";
import { useFileManager } from "./app_state";
import { Toaster } from "./components/ui/toaster";

const queryClient = new QueryClient();
const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultPreloadStaleTime: 0,
	context: {
		auth: undefined!,
		files: undefined!,
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
	const files = useFileManager((state) => state);
	return <RouterProvider router={router} context={{ auth, files }} />;
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
			<Toaster />
		</div>,
	);
}
