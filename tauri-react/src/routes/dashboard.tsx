import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useStore } from '../auth'
import { invoke } from '@tauri-apps/api/core'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'

export const Route = createFileRoute('/dashboard')({
  loader: async ({ context, location }) => {
    const token = await context.auth.store.get("token")
    if (token == null) {
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
  const store = useStore()
  const { toast } = useToast()

  const handleLogout = async () => {
    await store.store.delete("token")
    navigate({ to: '/' })
  }

  const getUser = async () => {
    invoke("get_user")
      .then((res) => {
        console.log("frontend: ", res)
      })
      .catch((error) => {
        console.log(error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: error.code,
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        })
      })
  }

  return (
    <div className="">
      <h3>Dashboard page</h3>
      <p>If you can see this, that means you are authenticated.</p>
      <div className="mt-4">
        <button
          type="button"
          onClick={handleLogout}
          className="bg-slate-500 text-white py-2 px-4 rounded-md"
        >
          Logout
        </button>

        <button
          type="button"
          onClick={getUser}
          className="bg-slate-500 text-white py-2 px-4 rounded-md"
        >
          get user 
        </button>
      </div>
    </div>
  )
}
