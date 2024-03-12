import { useState, useEffect } from "react";

export function useDebounce(value, delay) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);
		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

// const debouncedEditorState = useDebounce(content, 500);
// useEffect(() => {
//   console.log("debounce")
//   if (debouncedEditorState === "") return;
//   setIsSaving(true)
//   saveMutation.mutate()
//   setIsSaving(false)
// }, [debouncedEditorState]);
