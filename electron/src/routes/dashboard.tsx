import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../auth'
import { useCookies } from 'react-cookie'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context, location }) => {
    if (context.cookies.active_session !== 1) {
      throw redirect({
        to: '/',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: DashboardComponent,
})

function DashboardComponent() {
  const navigate = useNavigate({ from: '/dashboard' })
  const auth = useAuth()
  const [_, setCookie] = useCookies(['active_session'])

  const handleLogout = () => {
    auth.setUser(null)
    auth.isAuthenticated = false
    setCookie('active_session', 0)
    navigate({ to: '/' })
  }

  return (
    <div className="p-2">
      <h3>Dashboard page</h3>
      <p>Hi {auth.user}!</p>
      <p>If you can see this, that means you are authenticated.</p>
      <div className="mt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="bg-slate-500 text-white py-2 px-4 rounded-md"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
