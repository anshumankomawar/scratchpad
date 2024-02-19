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
import { Search } from "lucide-react";

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
				<div className="flex w-full items-center pb-4">
					<Input
						id="search"
						placeholder="Search..."
						className="w-full text-slate-600 px-0"
						onChange={(e) => setQuery(e.target.value)}
						disabled={false}
					/>
					<Search
						className="h-4 w-4 hover:cursor-pointer mx-2"
						onClick={() => handleSearch()}
					/>
				</div>
				<div className="grid grid-cols-3 h-full">
					<div className="col-span-2 w-full h-full pr-2">{collate}</div>
					<div className="h-full w-full space-y-2 overflow-y-auto pl-2 pb-16">
						{references.map((ref, index) => (
							<Card className="rounded-md">
								<CardHeader>
									<CardTitle className="text-sm">{ref.filename}</CardTitle>
									<CardDescription className="text-xs">
										{ref.foldername}
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
