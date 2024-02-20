import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	AArrowDown,
	AArrowUp,
	AlignCenter,
	AlignLeft,
	AlignRight,
	BetweenHorizontalStart,
	BetweenVerticalStart,
	Bold,
	Code,
	Italic,
	List,
	ListTodo,
	Quote,
	SeparatorHorizontal,
	Strikethrough,
	Subscript,
	Superscript,
	Table,
	Underline,
} from "lucide-react";
import { Button } from "../ui/button";
import { usePanelStore } from "@/app_state";

export default function RightFloatingPanel({ editor }) {
	const panel = usePanelStore((state) => state);

	async function cancelAutoFocus(event) {
		event.preventDefault();
	}

	return (
		<Sheet open={panel.right} modal={false}>
			<SheetContent
				side="right"
				className="overflow-y-auto mr-4 border-none drop-shadow-2xl shadow-2xl h-1/2 w-min"
				onOpenAutoFocus={cancelAutoFocus}
			>
				<div className="flex flex-col space-y-2">
					<Button
						variant="ghost"
						onClick={() => editor.chain().focus().toggleBold().run()}
						className={editor.isActive("bold") ? "bg-accent" : ""}
						size="icon"
					>
						<Bold className="w-4 h-4" />
					</Button>

					<Button
						variant="ghost"
						onClick={() => editor.chain().focus().toggleItalic().run()}
						className={editor.isActive("italic") ? "bg-accent" : ""}
						size="icon"
					>
						<Italic className="w-4 h-4" />
					</Button>

					<Button
						variant="ghost"
						onClick={() => editor.chain().focus().toggleUnderline().run()}
						className={editor.isActive("underline") ? "bg-accent" : ""}
						size="icon"
					>
						<Underline className="w-4 h-4" />
					</Button>

					<Button
						variant="ghost"
						onClick={() => editor.chain().focus().toggleStrike().run()}
						className={editor.isActive("strike") ? "bg-accent" : ""}
						size="icon"
					>
						<Strikethrough className="w-4 h-4" />
					</Button>

					<Button
						variant="ghost"
						onClick={() => editor.chain().focus().toggleCodeBlock().run()}
						className={editor.isActive("codeBlock") ? "bg-accent" : ""}
						size="icon"
					>
						<Code className="w-4 h-4" />
					</Button>

					<Button
						variant="ghost"
						onClick={() => editor.chain().focus().toggleBlockquote().run()}
						className={editor.isActive("blockquote") ? "bg-accent" : ""}
						size="icon"
					>
						<Quote className="w-4 h-4" />
					</Button>

					<Button
						variant="ghost"
						onClick={() => editor.chain().focus().toggleBulletList().run()}
						className={editor.isActive("bulletList") ? "bg-accent" : ""}
						size="icon"
					>
						<List className="w-4 h-4" />
					</Button>

					<Button
						variant="ghost"
						onClick={() => editor.chain().focus().toggleTaskList().run()}
						className={editor.isActive("taskList") ? "bg-accent" : ""}
						size="icon"
					>
						<ListTodo className="w-4 h-4" />
					</Button>

					<Button
						variant="ghost"
						onClick={() => editor.chain().focus().toggleSubscript().run()}
						className={editor.isActive("subscript") ? "bg-accent" : ""}
						size="icon"
					>
						<Subscript className="w-4 h-4" />
					</Button>

					<Button
						variant="ghost"
						onClick={() => editor.chain().focus().toggleSuperscript().run()}
						className={editor.isActive("superscript") ? "bg-accent" : ""}
						size="icon"
					>
						<Superscript className="w-4 h-4" />
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
}
