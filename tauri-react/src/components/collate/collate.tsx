import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { collateDocument } from "@/fetch/search";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useDocuments } from "@/fetch/documents";

export default function CollatePanel() {
	const [query, setQuery] = useState("");
	const [collate, setCollate] = useState("");
	const [references, setReferences] = useState([]);
	const documents = useDocuments();

	async function handleSearch() {
		const res = await collateDocument(query);
		setCollate(res.data);
		setReferences(res.references);
		await documents.refetch();
	}

	return (
		<div className=" bg-white w-full h-full overflow-hidden ">
			<div className="flex flex-col h-full w-full">
				<div className="flex w-full items-center space-x-2 pb-2">
					<Input
						type="email"
						placeholder="Query..."
						onChange={(e) => setQuery(e.target.value)}
					/>
					<Button type="submit" onClick={() => handleSearch()}>
						Search
					</Button>
				</div>
				<div className="flex flex-row h-full items-start justify-start">
					<div className="max-w-2/3 border-r h-full px-2">{collate}</div>
					<div className="h-full w-1/3 px-2 overflow-y-auto ">
						{references.map((ref, index) => (
							<Card>
								<CardHeader>
									<CardTitle className="text-sm">{ref.document_id}</CardTitle>
									<CardDescription className="text-xs">
										{ref.chunk_id}
									</CardDescription>
								</CardHeader>
								<CardContent className="text-xs">{ref.content}</CardContent>
								<CardFooter className="text-xs">
									<p>{ref.similarity}</p>
								</CardFooter>
							</Card>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
