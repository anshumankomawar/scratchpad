import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoginComponentProps } from "./login";

export function LoginForm(props: LoginComponentProps) {
	const handleSubmit = async () => {
		props.handleLogin();
	};

	return (
		<div className="">
			<div className="space-y-4 w-full items-center">
				<Input
					id="email"
					type="Email"
					placeholder="Username"
					value={props.email}
					onChange={(e) => props.setEmail(e.target.value)}
					required
				/>
				<Input
					id="password"
					type="Password"
					placeholder="Password"
					value={props.password}
					onChange={(e) => props.setPassword(e.target.value)}
					required
				/>
				<div className="w-full items-center justify-center flex pt-2">
					<Button className=" w-[80px] h-[24px]" onClick={() => handleSubmit()}>
						Login
					</Button>
				</div>
			</div>
		</div>
	);
}
