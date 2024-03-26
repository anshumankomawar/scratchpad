import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegisterComponentProps } from "./register";

export function RegisterForm(props: RegisterComponentProps) {
	const handleSubmit = async () => {
		props.handleLogin();
	};

	return (
		<div className="">
			<div className="space-y-2 w-full items-center w-[250px] text-center">
				<Input
					id="email"
					type="Email"
					placeholder="Username"
					value={props.email}
					onChange={(e) => props.setEmail(e.target.value)}
					required
					className="text-xs text-dull_black dark:text-dull_white"
				/>
				<Input
					id="confirm-email"
					type="Email"
					placeholder="Confirm Username"
					value={props.confirmEmail}
					onChange={(e) => props.setConfirmEmail(e.target.value)}
					required
					className="text-xs text-dull_black dark:text-dull_white"
				/>
				<Input
					id="password"
					type="Password"
					placeholder="Password"
					value={props.password}
					onChange={(e) => props.setPassword(e.target.value)}
					className="text-xs text-dull_black dark:text-dull_white"
					required
				/>
				<Input
					id="confirm-password"
					type="Password"
					placeholder="Confirm Password"
					value={props.confirmPassword}
					onChange={(e) => props.setConfirmPassword(e.target.value)}
					className="text-xs text-dull_black dark:text-dull_white"
					required
				/>
				<div
					className="pt-2 pb-2 text-xs hover:underline hover:cursor-pointer text-dull_black/50 dark:text-neutral-100 dark:text-neutral-500 hover:text-dull_black hover:dark:text-dull_white"
					onClick={() => props.setIsLogin(true)}
				>
					Already have an account? Login.
				</div>
				<div className="w-full items-center justify-center flex pt-2">
					<Button className=" w-[80px] h-[24px]" onClick={() => handleSubmit()}>
						Register
					</Button>
				</div>
			</div>
		</div>
	);
}
