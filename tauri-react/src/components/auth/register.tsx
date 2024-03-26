import { RegisterForm } from "./register_form";

export type RegisterComponentProps = {
	handleLogin: () => void;
	isSubmitting: boolean;
	email: string;
	setEmail: (email: string) => void;
	password: string;
	setPassword: (password: string) => void;
	isLogin: boolean;
	setIsLogin: (value: boolean) => void;
	confirmEmail: string;
	setConfirmEmail: (confirmEmail: string) => void;
	confirmPassword: string;
	setConfirmPassword: (confirmPassword: string) => void;
};

export default function RegisterComponent(props: RegisterComponentProps) {
	return (
		<div className="flex h-full flex-col items-center justify-center ">
			<div className="flex flex-row w-full h-full items-center justify-center">
				<div className="mt-8 w-1/2 flex justify-center">
					<RegisterForm {...props} />
				</div>
			</div>
		</div>
	);
}
