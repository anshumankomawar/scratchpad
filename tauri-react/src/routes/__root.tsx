import { Link, Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import { useAuth, type AuthContext } from '../auth'

interface MyRouterContext {
  auth: AuthContext
  cookies: any
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  const auth = useAuth()
  return (
    <>
      <div className="mt-8 px-2 flex gap-2 text-lg">
        <Link
          to="/"
          activeProps={{
            className: 'font-bold',
          }}
          activeOptions={{ exact: true }}
        >
          Home
        </Link>{' '}
        {auth.isAuthenticated ? (
          <Link
            to={'/dashboard'}
            activeProps={{
              className: 'font-bold',
            }}
          >
            Dashboard
          </Link>
        ) : (
          <Link
            to={'/login'}
            activeProps={{
              className: 'font-bold',
            }}
            search={{ redirect: '/' }}
          >
            Login
          </Link>
        )}
      </div>
      <hr />
      <Outlet />
    </>
  )
}
