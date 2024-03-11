import { createContext, useContext, useState, useEffect } from "react";

type FontFamily = "Virgil" | "Barlow" | "System" | "Lato" | "CrimsonPro"; // Updated to include 'Barlow'

type FontFamilyProviderProps = {
	children: React.ReactNode;
	defaultFontFamily?: FontFamily;
	storageKey?: string;
};

type FontFamilyProviderState = {
	fontFamily: FontFamily;
	setFontFamily: (fontFamily: FontFamily) => void;
};

const initialState: FontFamilyProviderState = {
	fontFamily: "Virgil", // Set 'Virgil' as the default font family
	setFontFamily: () => null,
};

const FontFamilyContext = createContext<FontFamilyProviderState>(initialState);

export function FontFamilyProvider({
	children,
	defaultFontFamily = "Virgil", // Default to 'Virgil'
	storageKey = "app-font-family",
}: FontFamilyProviderProps) {
	const [fontFamily, setFontFamily] = useState<FontFamily>(
		() => (localStorage.getItem(storageKey) as FontFamily) || defaultFontFamily,
	);

	useEffect(() => {
		const root = window.document.documentElement;
		root.style.setProperty("--app-font-family", fontFamily);
		localStorage.setItem(storageKey, fontFamily);
	}, [fontFamily, storageKey]);

	const value = { fontFamily, setFontFamily };

	return (
		<FontFamilyContext.Provider value={value}>
			{children}
		</FontFamilyContext.Provider>
	);
}

export const useFontFamily = () => {
	const context = useContext(FontFamilyContext);

	if (context === undefined) {
		throw new Error("useFontFamily must be used within a FontFamilyProvider");
	}

	return context;
};
