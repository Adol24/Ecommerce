import { Suspense } from "react"
import { LoginForm } from "@/components/auth/LoginForm"
import { AuthStoreLogo } from "@/components/auth/AuthStoreLogo"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <AuthStoreLogo />
        <Suspense fallback={<div className="text-center">Cargando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
