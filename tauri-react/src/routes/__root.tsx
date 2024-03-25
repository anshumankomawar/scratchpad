import { useDndStore, useDocStore, useFileManager } from "@/app_state";
import { type StoreContext } from "@/auth";
import Header from "@/components/header/header";
import LoginComponent from "@/components/login/login";
import { Toaster } from "@/components/ui/toaster";
import { useTipTapEditor } from "@/context/tiptap_context";
import { login } from "@/fetch/auth";
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { QueryClient } from "@tanstack/react-query";
import {
	Outlet,
	createRootRouteWithContext,
	useRouter,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { exists, BaseDirectory, mkdir, writeFile } from "@tauri-apps/plugin-fs";
import { syncData } from "@/fetch/documents";
import { getCurrent } from "@tauri-apps/api/window";

export interface MyRouterContext {
	auth: StoreContext;
	files: any;
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
		const files = useFileManager.getState();
		files.setDataPath("anshu@gmail.com");

		const filesExists = await exists(useFileManager.getState().dataPath, {
			baseDir: BaseDirectory.AppData,
		});

		const syncExists = await exists("sync.json", {
			baseDir: BaseDirectory.AppData,
		});

		if (!filesExists) {
			await mkdir(useFileManager.getState().dataPath, {
				baseDir: BaseDirectory.AppData,
			});
		}

		if (!syncExists) {
			const encoder = new TextEncoder();
			const data = encoder.encode(
				'{"add": [], "delete": [], "update": [], "rename": []}',
			);
			await writeFile("sync.json", data, { baseDir: BaseDirectory.AppData });
			await writeFile("sync_swap.json", data, {
				baseDir: BaseDirectory.AppData,
			});
		}

		syncData();
		await useFileManager.getState().readDir();
		await getCurrent().show();
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
	const updateParent = useDndStore((state) => state.updateParent);
	const tiptap = useTipTapEditor();
	const docStore = useDocStore((state) => state);
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	useEffect(() => {
		if (tiptap.editor && tiptap.sheetEditor) {
			docStore.textEditor = tiptap.editor;
			docStore.sheetEditor = tiptap.sheetEditor;
		}
	}, [tiptap.editor, tiptap.sheetEditor]);

	function handleDragEnd(event) {
		const { active, over } = event;

		if (active.id !== over.id) {
			docStore.swapTabs(active, over);
		}
	}

	function handleDragStart(event) {
		const { active } = event;
		const tab = docStore.tabs.find((tab) => tab.filename === active.id);
		docStore.updateDoc(tab);
		tiptap.editor.commands.setContent(tab.content);
		tiptap.editor.commands.focus("start");
	}

	if (!tiptap.editor && !tiptap.sheetEditor) {
		return <div>could not get editor instance</div>;
	}

	return (
		<div className="relative z-0 h-full w-full">
			<div className="z-50 fixed top-0 right-0 h-10">
				<Header />
			</div>
			<div className="-z-10 left-0 h-full w-full">
				<Outlet />
			</div>
		</div>
	);
}
