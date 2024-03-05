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

import { Input } from "@/components/ui/input"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@radix-ui/react-separator";
import { useFontFamily } from "@/context/font_context";
import { useTheme } from "@/context/theme_context";


const formSchema = z.object({
	username: z.string().min(2, {
	  message: "Username must be at least 2 characters.",
	}),
	password: z.string().min(8, {
		message: "Password must be at least 8 characters."
	}),
	email: z.string()
    .min(1, { message: "This field has to be filled." })
    .email("This is not a valid email.")
  })


export default function AccountPage() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
		  username: "",
		},
	  })
	
	function onSubmit(values: z.infer<typeof formSchema>) {
		// Do something with the form values.
		console.log(values)
	}

	return (
		<div className="flex flex-col overflow-y-hidden">
			<div className="text-bold text-lg pb-1">Account Details</div>
			<div className="text-sm text-gray-400">
				Mange your ScratchPad profile
			</div>
			<Separator orientation="horizontal" />
			<div className="pt-10">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input placeholder="john doe" {...field} />
							</FormControl>
							<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<Input placeholder="*****" {...field} />
							</FormControl>
							<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input placeholder="john@gmail.com" {...field} />
							</FormControl>
							<FormMessage />
							</FormItem>
						)}
					/>
					<Button classname="align-bottom" type="submit">Update preferences</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}
