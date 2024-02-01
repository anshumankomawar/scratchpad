type LoginComponentProps = {
  handleLogin: (evt: React.FormEvent<HTMLFormElement>) => void,
  isSubmitting: boolean,
  name: string,
  setName: (name: string) => void
}

export default function LoginComponent(props: LoginComponentProps) {
  return (
      <div className="p-2">
        <h3>Login page</h3>
        <form className="mt-4" onSubmit={props.handleLogin}>
          <fieldset
            disabled={props.isSubmitting}
            className="flex flex-col gap-2 max-w-sm"
          >
            <div className="flex gap-2 items-center">
              <label htmlFor="username-input" className="text-sm font-medium">
                Username
              </label>
              <input
                id="username-input"
                type="text"
                value={props.name}
                onChange={(e) => props.setName(e.target.value)}
                className="border border-gray-300 rounded-md p-2 w-full"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md"
            >
              {props.isSubmitting ? 'Loading...' : 'Login'}
            </button>
          </fieldset>
        </form>
      </div>
  )
}
