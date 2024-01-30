import { LoginForm } from '@/components/login/login_form';
import { LoginLogo } from '@/components/login/login_logo';
import Tiptap from '../components/Tiptap'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center ">
      <div className='flex flex-row w-full h-full items-center justify-center'>
        <div className='w-1/2 h-full flex justify-center items-center bg-black'><LoginLogo/></div>
        <div className='w-1/2 flex justify-center'><LoginForm/></div>
      </div>
    </main>
  );
}
