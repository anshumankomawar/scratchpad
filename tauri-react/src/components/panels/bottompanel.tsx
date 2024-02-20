export default function BottomPanel({ editor }) {
	return (
		<div className="fixed z-50 left-0 bottom-0 h-min w-full justify-between items-center px-5 py-4">
			<div className="absolute right-4 bottom-4 text-end text-xs text-nowrap text-dull_black dark:text-dull_white">
				{editor.storage.characterCount.words()} |{" "}
				{editor.storage.characterCount.characters()}
			</div>
		</div>
	);
}
