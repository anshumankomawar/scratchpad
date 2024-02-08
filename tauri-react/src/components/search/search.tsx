import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import {
    Search,
    Bookmark
  } from "lucide-react"
export function SearchPage() {
    const sampleText = "Architectural styles exhibit a vast spectrum, spanning from the sleek and minimalist Modern to the intricate Gothic and grand Baroque. Central to these styles are key architectural elements like columns, arches, domes, and facades, which serve both structural and aesthetic purposes, contributing to the overall design. Visionaries in the field, including Frank Lloyd Wright, are celebrated for their innovative designs, while contemporary architects like Zaha Hadid continually push the boundaries of architectural expression. Sustainable architecture emphasizes eco-friendly practices, incorporating green building materials and energy-efficient designs to minimize environmental impact. Meanwhile, iconic structures such as the Eiffel Tower, Taj Mahal, and Sydney Opera House not only demonstrate unique architectural brilliance but also hold profound historical and cultural significance. Looking ahead, the upcoming architectural midterm is scheduled for February 9th, with a review session planned on the day preceding the exam."
    
    const [isVisible, setIsVisible] = useState(false)
    const [isBookMarked, setIsBookMarked] = useState(false)

    const handleClick = () => {setIsVisible(!isVisible)}
    const handleBookmarkClick = () => {setIsBookMarked(!isBookMarked);};

    return (
        <div className="flex flex-col w-full">
            <div className='flex items-center space-x-8 w-full px-12'>
                <Input
                    id="search"
                    type="search"
                    placeholder="Search..."
                    className="w-full text-slate-600"
                    disabled={false}/>
                <Search className="h-4 w-4 hover:cursor-pointer" onClick = {() => handleClick()} />
                <Bookmark className={`h-4 w-4 hover:cursor-pointer${isBookMarked ? " fill-current text-black" : ""}`} onClick={() => handleBookmarkClick()}/>
            </div>
            <div className={isVisible ? "visible" : "invisible"}>
                <div className="text-justify p-12 rounded-md text-sm w-full text-slate-900">{sampleText}</div>
            </div>
        </div>

        
      )

      
}
