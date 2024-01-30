import { LoginForm } from '@/components/login/login_form';
import Tiptap from '../components/Tiptap'

export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-between p-4">
      <LoginForm />
    </main>
  );
}
