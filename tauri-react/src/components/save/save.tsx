import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "../ui/use-toast";
import { ToastAction } from "../ui/toast";
import { useDebounce } from "./useDebounce";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../ui/button";

export default function Save({ editor, updateDocuments }) {
	const [isSaving, setIsSaving] = useState(false);
	const [filename, setFilename] = useState();
	const [content, setContent] = useState(editor.getHTML());

	// const debouncedEditorState = useDebounce(content, 500);
	// useEffect(() => {
	//   console.log("debounce")
	//   if (debouncedEditorState === "") return;
	//   setIsSaving(true)
	//   saveMutation.mutate()
	//   setIsSaving(false)
	// }, [debouncedEditorState]);

	const handleSave = async () => {
		setIsSaving(true);
		saveMutation.mutate();
		setIsSaving(false);
	};

	editor.on("update", ({ editor }) => {
		setContent(editor.getHTML());
		set;
	});

	const saveMutation = useMutation({
		mutationFn: async () => {
			invoke("save_document", { filename: filename, content: content })
				.then((doc_id) => {
					console.log(doc_id);
					updateDocuments();
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

	return (
		<div>
			<Button
				variant="ghost"
				onClick={() => {
					handleSave();
				}}
				className=""
			>
				Save
			</Button>
		</div>
	);
}
