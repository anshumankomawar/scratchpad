import { LoginForm } from "./login_form";

export type LoginComponentProps = {
	handleLogin: () => void;
	isSubmitting: boolean;
	email: string;
	setEmail: (email: string) => void;
	password: string;
	setPassword: (password: string) => void;
	isLogin: boolean;
	setIsLogin: (value: boolean) => void;
};

export default function LoginComponent(props: LoginComponentProps) {
	return (
		<div className="flex h-full flex-col items-center justify-center ">
			<div className="flex flex-row w-full h-full items-center justify-center">
				<div className="mt-8 w-1/2 flex justify-center">
					<LoginForm {...props} />
				</div>
			</div>
		</div>
	);
}
