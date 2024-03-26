import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { collateDocument } from "@/fetch/search";
import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useDocuments } from "@/fetch/documents";
import { Save, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocStore, useFileManager } from "@/app_state";

const initialMessagesOptions = [
	"Warming up the hamsters...",
	"Reticulating splines... Wait, wrong process!",
	"Loading up on coffee... I mean, electricity.",
];

const updateMessagesOptions = [
	"Compiling the Encyclopedia Galactica... Just kidding, just your request.",
	"Running at warp speed! (Note: warp drive not actually included)",
	"Consulting the oracle... I meant, calculating. Definitely calculating.",
	"Crossing the t's, dotting the i's, and bending the w's...",
	"Performing magic tricks... And by magic, I mean advanced algorithms.",
	"Applying elbow grease. Robots have elbows, right?",
	"Almost done... Just need to convince the cat to move off the keyboard.",
];

// Function to select a random subset of messages
const selectRandomMessages = (messagesArray, numberOfMessages) => {
	let selectedMessages = [];
	let availableIndices = [...messagesArray.keys()];

	for (let i = 0; i < numberOfMessages; i++) {
		if (availableIndices.length === 0) break;

		const randomIndex = availableIndices.splice(
			Math.floor(Math.random() * availableIndices.length),
			1,
		)[0];
		selectedMessages.push(messagesArray[randomIndex]);
	}

	return selectedMessages;
};

export default function CollatePanel() {
	const [query, setQuery] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [collate, setCollate] = useState("");
	const [references, setReferences] = useState([]);
	const documents = useDocuments();
	const fileManager = useFileManager((state) => state);
	const docStore = useDocStore((state) => state);
	const [displayedMessages, setDisplayedMessages] = useState([]);
	const [isDisplaying, setIsDisplaying] = useState(false);

	useEffect(() => {
		if (isDisplaying) {
			setIsGenerating(true);

			const randomInitialMessage = selectRandomMessages(
				initialMessagesOptions,
				1,
			);
			setDisplayedMessages(randomInitialMessage);

			const randomUpdateMessages = selectRandomMessages(
				updateMessagesOptions,
				3,
			);
			let nextMessageIndex = 0;
			const intervalId = setInterval(() => {
				if (nextMessageIndex < randomUpdateMessages.length) {
					setDisplayedMessages((prevMessages) => [
						...prevMessages,
						randomUpdateMessages[nextMessageIndex],
					]);

					nextMessageIndex += 1;
				} else {
					setDisplayedMessages((prevMessages) => [
						...prevMessages,
						"Ding! Order up. I mean, content generated.",
					]);
					clearInterval(intervalId);
				}
			}, 1000);

			return;
		}

		if (collate !== "") {
			setIsGenerating(false);
			setIsDisplaying(false);
		}
	}, [isDisplaying, collate]);

	async function handleSearch() {
		const res = await collateDocument(query);
		setCollate(res.data);
		setReferences(res.references);
	}

	useEffect(() => {
		if (query === "") {
			console.log("HERE");
			setCollate("");
			setReferences([]);
			setIsGenerating(false);
			setIsDisplaying(false);
		}
	}, [query]);

	return (
		<div className="w-full h-full overflow-hidden">
			<div className="flex flex-col h-full w-full">
				<div className="flex w-full items-center justify-between border-none border-accent">
					<Input
						id="search"
						placeholder="Type to collate..."
						className="text-dull_black dark:text-dull_white text-sm px-0 border-b border-accent rounded-sm w-full px-2"
						onChange={(e) => setQuery(e.target.value)}
						onKeyUp={async (e) => {
							if (e.key === "Enter") {
								setIsDisplaying(true);
								await handleSearch();
							}
						}}
						disabled={false}
					/>
				</div>
				<div className="grid grid-cols-3 h-full py-2">
					<div className="col-span-2 w-full h-full px-2 pt-2">
						{isGenerating ? (
							<div>
								{displayedMessages.map((message, index) => (
									<div
										className="messageContainer"
										key={index}
										style={{ marginBottom: "16px" }}
									>
										<p className="text-xs text-dull_black dark:text-dull_white">
											{message}
										</p>
									</div>
								))}
							</div>
						) : (
							<div className="w-full h-full text-sm text-dull_black dark:text-dull_white">
								{collate}
							</div>
						)}
					</div>
					<div className="h-full w-full space-y-2 overflow-y-auto pb-16">
						{isGenerating ? (
							<div className="flex flex-col space-y-2 py-2">
								<Skeleton className="h-[100px] w-full rounded-xl" />
								<Skeleton className="h-[100px] w-full rounded-xl" />
								<Skeleton className="h-[100px] w-full rounded-xl" />
								<Skeleton className="h-[100px] w-full rounded-xl" />
								<Skeleton className="h-[100px] w-full rounded-xl" />
								<Skeleton className="h-[100px] w-full rounded-xl" />
								<Skeleton className="h-[100px] w-full rounded-xl" />
							</div>
						) : (
							references.map((ref) => (
								<div className="h-min w-full py-2">
									<div className="w-full flex flex-col items-start justify-center text-dull_black dark:text-dull_white text-xs px-2 border-l">
										<div className="flex items-center justify-start pb-2 w-full">
											{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
											<div
												className="text-xs hover:cursor-pointer hover:underline underline-offset-2 text-start font-bold"
												onClick={() => {
													fileManager.selectFile(ref.document_path);
													docStore.setEditorContent(
														fileManager.selectedFile
															? fileManager.selectedFile.content
															: "",
													);
												}}
											>
												{ref.document_path.split("/").slice(1).join("/")}
											</div>
										</div>
										<div className="rounded-md p-1 bg-accent/50">
											<div className="line-clamp-3 text-start">
												{ref.content}
											</div>
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
