import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Bookmark } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "../ui/use-toast";
import { ToastAction } from "../ui/toast";
export function SearchPage() {
	const sampleText =
		"Architectural styles exhibit a vast spectrum, spanning from the sleek and minimalist Modern to the intricate Gothic and grand Baroque. Central to these styles are key architectural elements like columns, arches, domes, and facades, which serve both structural and aesthetic purposes, contributing to the overall design. Visionaries in the field, including Frank Lloyd Wright, are celebrated for their innovative designs, while contemporary architects like Zaha Hadid continually push the boundaries of architectural expression. Sustainable architecture emphasizes eco-friendly practices, incorporating green building materials and energy-efficient designs to minimize environmental impact. Meanwhile, iconic structures such as the Eiffel Tower, Taj Mahal, and Sydney Opera House not only demonstrate unique architectural brilliance but also hold profound historical and cultural significance. Looking ahead, the upcoming architectural midterm is scheduled for February 9th, with a review session planned on the day preceding the exam.Architectural styles exhibit a vast spectrum, spanning from the sleek and minimalist Modern to the intricate Gothic and grand Baroque. Central to these styles are key architectural elements like columns, arches, domes, and facades, which serve both structural and aesthetic purposes, contributing to the overall design. Visionaries in the field, including Frank Lloyd Wright, are celebrated for their innovative designs, while contemporary architects like Zaha Hadid continually push the boundaries of architectural expression. Sustainable architecture emphasizes eco-friendly practices, incorporating green building materials and energy-efficient designs to minimize environmental impact. Meanwhile, iconic structures such as the Eiffel Tower, Taj Mahal, and Sydney Opera House not only demonstrate unique architectural brilliance but also hold profound historical and cultural significance. Looking ahead, the upcoming architectural midterm is scheduled for February 9th, with a review session planned on the day preceding the exam.Architectural styles exhibit a vast spectrum, spanning from the sleek and minimalist Modern to the intricate Gothic and grand Baroque. Central to these styles are key architectural elements like columns, arches, domes, and facades, which serve both structural and aesthetic purposes, contributing to the overall design. Visionaries in the field, including Frank Lloyd Wright, are celebrated for their innovative designs, while contemporary architects like Zaha Hadid continually push the boundaries of architectural expression. Sustainable architecture emphasizes eco-friendly practices, incorporating green building materials and energy-efficient designs to minimize environmental impact. Meanwhile, iconic structures such as the Eiffel Tower, Taj Mahal, and Sydney Opera House not only demonstrate unique architectural brilliance but also hold profound historical and cultural significance. Looking ahead, the upcoming architectural midterm is scheduled for February 9th, with a review session planned on the day preceding the exam.";

	const [isVisible, setIsVisible] = useState(false);
	const [isBookMarked, setIsBookMarked] = useState(false);

	const handleClick = () => {
		setIsVisible(!isVisible);
	};
	const handleBookmarkClick = () => {
		setIsBookMarked(!isBookMarked);
	};

	const [isLoading, setIsLoading] = useState(false);
	const [query, setQuery] = useState("");
	const [searchText, setSearchText] = useState("");

	const handleSearch = async () => {
		// TODO: Don't let multiple requests go through when logging in
		setIsLoading(true);
		invoke("search_user_documents", { query: query })
			.then((res) => {
				setSearchText(res);
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
		setIsLoading(false);
	};

	return (
		<div className="flex flex-col w-full">
			<div className="flex items-center space-x-8 w-full px-12">
				<Input
					id="search"
					type="search"
					placeholder="Search..."
					className="w-full text-slate-600"
					onChange={(e) => setQuery(e.target.value)}
					disabled={false}
				/>
				<Search
					className="h-4 w-4 hover:cursor-pointer"
					onClick={() => handleSearch()}
				/>
				<Bookmark
					className={`h-4 w-4 hover:cursor-pointer${
						isBookMarked ? " fill-current text-black" : ""
					}`}
					onClick={() => handleBookmarkClick()}
				/>
			</div>
			<div className="text-start px-12 pt-8 rounded-md text-sm w-full text-slate-900 pb-4">
				{searchText}
			</div>
		</div>
	);
}
