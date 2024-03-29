import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { Button, buttonVariants } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@radix-ui/react-separator";
import { useFontFamily } from "@/context/font_context";
import { useTheme } from "@/context/theme_context";

const appearanceFormSchema = z.object({
	theme: z.enum(["light", "dark"], {
		required_error: "Please select a theme.",
	}),
	font: z.enum(["Virgil", "Barlow", "System", "Lato", "CrimsonPro"], {
		invalid_type_error: "Select a font",
		required_error: "Please select a font.",
	}),
});

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

// This can come from your database or API.

export default function SettingsPage() {
	const { fontFamily, setFontFamily } = useFontFamily();
	const { setTheme } = useTheme();

	const defaultValues: Partial<AppearanceFormValues> = {
		theme: "light",
		font: fontFamily,
	};

	const form = useForm<AppearanceFormValues>({
		resolver: zodResolver(appearanceFormSchema),
		defaultValues,
	});

	function onSubmit(data: AppearanceFormValues) {
		setFontFamily(data.font);
		setTheme(data.theme);
	}

	return (
		<div className="flex flex-col overflow-y-hidden">
			<div className="text-bold text-lg pb-1">Settings</div>
			<div className="text-sm text-gray-400">
				Mange your account preferences.
			</div>
			<Separator orientation="horizontal" />
			<div className="overflow-y-auto pt-8">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<FormField
							control={form.control}
							name="font"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Font</FormLabel>
									<FormControl defaultValue={fontFamily}>
										<Select
											defaultValue={fontFamily}
											onValueChange={field.onChange}
										>
											<SelectTrigger className="w-[180px]" {...field}>
												<SelectValue placeholder="Theme" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Virgil">Virgil</SelectItem>
												<SelectItem value="Barlow">Barlow</SelectItem>
												<SelectItem value="System">System</SelectItem>
												<SelectItem value="Lato">Lato</SelectItem>
												<SelectItem value="CrimsonPro">Crimson Pro</SelectItem>
											</SelectContent>
										</Select>
									</FormControl>
									<ChevronDownIcon className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
									<FormDescription>
										Set the font you want to use in the dashboard.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="theme"
							render={({ field }) => (
								<FormItem className="space-y-1">
									<FormLabel>Theme</FormLabel>
									<FormDescription>
										Select the theme for the dashboard.
									</FormDescription>
									<FormMessage />
									<RadioGroup
										onValueChange={field.onChange}
										defaultValue={field.value}
										className="grid max-w-md grid-cols-2 gap-8 pt-2"
									>
										<FormItem>
											<FormLabel className="[&:has([data-state=checked])>div]:border-primary">
												<FormControl>
													<RadioGroupItem value="light" className="sr-only" />
												</FormControl>
												<div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
													<div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
														<div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
															<div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
															<div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
														</div>
														<div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
															<div className="h-4 w-4 rounded-full bg-[#ecedef]" />
															<div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
														</div>
														<div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
															<div className="h-4 w-4 rounded-full bg-[#ecedef]" />
															<div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
														</div>
													</div>
												</div>
												<span className="block w-full p-2 text-center font-normal">
													Light
												</span>
											</FormLabel>
										</FormItem>
										<FormItem>
											<FormLabel className="[&:has([data-state=checked])>div]:border-primary">
												<FormControl>
													<RadioGroupItem value="dark" className="sr-only" />
												</FormControl>
												<div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
													<div className="space-y-2 rounded-sm bg-slate-950 p-2">
														<div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
															<div className="h-2 w-[80px] rounded-lg bg-slate-400" />
															<div className="h-2 w-[100px] rounded-lg bg-slate-400" />
														</div>
														<div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
															<div className="h-4 w-4 rounded-full bg-slate-400" />
															<div className="h-2 w-[100px] rounded-lg bg-slate-400" />
														</div>
														<div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
															<div className="h-4 w-4 rounded-full bg-slate-400" />
															<div className="h-2 w-[100px] rounded-lg bg-slate-400" />
														</div>
													</div>
												</div>
												<span className="block w-full p-2 text-center font-normal">
													Dark
												</span>
											</FormLabel>
										</FormItem>
									</RadioGroup>
								</FormItem>
							)}
						/>
						<Button type="submit">Update preferences</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}
