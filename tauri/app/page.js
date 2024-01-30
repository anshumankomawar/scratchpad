import { LoginForm } from '@/components/login/login_form';
import Tiptap from '../components/Tiptap'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-between p-4">
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login"><LoginForm/></TabsContent>
        <TabsContent value="signup">Change your password here.</TabsContent>
      </Tabs>

    </main>
  );
}
