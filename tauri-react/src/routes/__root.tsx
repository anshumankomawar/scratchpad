import { useDndStore, useDocStore } from "@/app_state";
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
		console.error("detected change");
		if (tiptap.editor && tiptap.sheetEditor) {
			console.error("found instances of both");
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
		console.error("No editor instances found");
		return <div>could not get editor instance</div>;
	}

	return (
		<div className="relative z-0 h-full w-full">
			<div className="z-50 fixed w-min top-0 right-0 h-10">
				<DndContext
					onDragStart={handleDragStart}
					onDragEnd={handleDragEnd}
					sensors={sensors}
					collisionDetection={closestCenter}
				>
					<Header />
				</DndContext>
			</div>
			<div className="-z-10 left-0 h-full w-full">
				<Outlet />
			</div>
		</div>
	);
}
