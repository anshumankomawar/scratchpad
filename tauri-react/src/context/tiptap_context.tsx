import * as React from "react";
import { useEditor, Editor, mergeAttributes } from "@tiptap/react";
import Heading from "@tiptap/extension-heading";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import TextAlign from "@tiptap/extension-text-align";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import CharacterCount from "@tiptap/extension-character-count";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import FontFamily from "@tiptap/extension-font-family";
import TextStyle from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import "@/tiptap.scss";

export interface TiptapContext {
	editor: Editor | null;
}

const TiptapContext = React.createContext<TiptapContext | null>(null);

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		fontSize: {
			/**
			 * Set the font size
			 */
			setFontSize: (size: string) => ReturnType;
			/**
			 * Unset the font size
			 */
			unsetFontSize: () => ReturnType;
		};
	}
}

export const TextStyleExtended = TextStyle.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			fontSize: {
				default: null,
				parseHTML: (element) => element.style.fontSize.replace("px", ""),
				renderHTML: (attributes) => {
					if (!attributes["fontSize"]) {
						return {};
					}
					return {
						style: `font-size: ${attributes["fontSize"]}px`,
					};
				},
			},
		};
	},

	addCommands() {
		return {
			...this.parent?.(),
			setFontSize:
				(fontSize) =>
				({ commands }) => {
					return commands.setMark(this.name, { fontSize: fontSize });
				},
			unsetFontSize:
				() =>
				({ chain }) => {
					return chain()
						.setMark(this.name, { fontSize: null })
						.removeEmptyTextStyle()
						.run();
				},
		};
	},
});

export function TiptapProvider({ children }: { children: React.ReactNode }) {
	const lowlight = createLowlight();
	lowlight.register("js", javascript);

	// define your extension array
	const extensions = [
		StarterKit,
		Blockquote,
		Underline,
		TaskList,
		Subscript,
		Superscript,
		TaskItem.configure({
			nested: true,
		}),
		Placeholder.configure({
			placeholder: "Write something …",
		}),
		Table,
		TableRow,
		TableHeader,
		TableCell,
		FontFamily,
		TextStyleExtended,
		Heading.extend({
			levels: [1, 2],
			renderHTML({ node, HTMLAttributes }) {
				const level = this.options.levels.includes(node.attrs.level)
					? node.attrs.level
					: this.options.levels[0];
				const classes: { [index: number]: string } = {
					1: "text-2xl",
					2: "text-xl",
				};
				return [
					`h${level}`,
					mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
						class: `${classes[level]}`,
					}),
					0,
				];
			},
		}).configure({ levels: [1, 2] }),
		BulletList.configure({
			HTMLAttributes: {
				class: "list-disc pl-5",
			},
		}),
		CharacterCount.configure(),
		ListItem,
		TextAlign.configure({
			types: ["heading", "paragraph"],
		}),
		CodeBlockLowlight.configure({
			lowlight,
		}),
	];

	const content = ``;
	const editor = useEditor({
		extensions,
		content,
		editorProps: {
			attributes: {
				class:
					"h-full overflow-none outline-none rounded-md mt-24 mb-24 font-virgil",
			},
		},
		autofocus: "end",
	});

	return (
		<TiptapContext.Provider value={{ editor }}>
			{children}
		</TiptapContext.Provider>
	);
}

export function useTipTapEditor() {
	const context = React.useContext(TiptapContext);
	if (!context) {
		throw new Error("useEditor must be used within an EditorProvider");
	}
	return context;
}
