import React from "react";
import {
	CommandIcon,
	FileTextIcon,
	FileIcon,
	CopyIcon,
	SearchIcon,
} from "lucide-react";

const ActionItem = ({ icon: Icon, action, shortcut, description }) => (
	<div className="flex flex-col justify-between w-full py-2">
		<div className="flex items-center justify-between items-center px-12">
			<div className="flex flex-col items-start">
				<p className="text-xs">{action}</p>
				<p className="w-full text-xs mt-1 text-neutral-500">{description}</p>
			</div>
			<kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-accent px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
				<span className="text-xs">⌘</span>
				{shortcut}
			</kbd>
		</div>
	</div>
);

const WelcomeScreen = () => {
	return (
		<div className="flex flex-col items-center justify-center h-screen text-center px-6 py-4 space-y-6 text-dull_black dark:text-dull_white">
			{/* Centered content */}
			{/*<div>
				<h1 className="text-xl font-semibold mb-2">Welcome to Collate</h1>
				<p className="text-sm mb-4">
					<strong>Get started with Collate</strong> – your personal space for
					notes, ideas, and tasks.
				</p>
				<p className="text-xs mb-2">Here are a few things you can do:</p>
			</div>*/}

			{/* Actions and descriptions */}
			<div className="text-left w-full max-w-md">
				{/*<p className="text-xl mb-4">Collate</p>*/}
				<ActionItem
					icon={FileTextIcon}
					action="📝 Create a New Note"
					shortcut="N"
					description="Start a new note to capture your thoughts."
				/>
				<ActionItem
					icon={SearchIcon}
					action="🔍 Open the Command Pallete"
					shortcut="N"
					description="Type what you need and command away!"
				/>
				<ActionItem
					icon={FileIcon}
					action="🌳 Open File Tree"
					shortcut="Left"
					description="Navigate your notes and folders."
				/>
				<ActionItem
					icon={CopyIcon}
					action="💡 Collate Note"
					shortcut="/"
					description="Combine notes for a comprehensive overview."
				/>
			</div>
		</div>
	);
};

export default WelcomeScreen;
