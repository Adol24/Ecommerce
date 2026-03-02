"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Mail, Lock, Eye, EyeOff, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { verifyEmail, resendVerificationCode } from "@/lib/insforge-auth"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

const verifySchema = z.object({
  code: z.string().length(6, "El código debe tener 6 dígitos"),
})

type LoginFormData = z.infer<typeof loginSchema>
type VerifyFormData = z.infer<typeof verifySchema>

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const { signIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [email, setEmail] = useState("")
  const [resending, setResending] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const {
    register: registerVerify,
    handleSubmit: handleSubmitVerify,
    formState: { errors: verifyErrors, isSubmitting: verifySubmitting },
    reset: resetVerify,
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
  })

  const fetchRoleAndRedirect = async (token: string, fallbackUrl: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (res.ok) {
        const { role } = json
        if (role === "ADMIN" || role === "MODERATOR") {
          router.push("/admin")
          return
        }
      }
    } catch (err) {
      console.error("[LoginForm] fetchRoleAndRedirect error:", err)
    }
    router.push(fallbackUrl)
  }

  const onSubmit = async (data: LoginFormData) => {
    setError(null)
    setEmail(data.email)

    const result = await signIn(data.email, data.password)

    if (result.error) {
      if (result.error.includes("verifica") || result.error.includes("FORBIDDEN")) {
        setNeedsVerification(true)
        resetVerify()
      } else {
        setError(result.error)
      }
      return
    }

    if (result.accessToken) {
      await fetchRoleAndRedirect(result.accessToken, callbackUrl)
    } else {
      router.push(callbackUrl)
    }
    router.refresh()
  }

  const onVerify = async (data: VerifyFormData) => {
    setError(null)

    const result = await verifyEmail(email, data.code)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.data?.accessToken) {
      await fetchRoleAndRedirect(result.data.accessToken, callbackUrl)
    } else {
      router.push(callbackUrl)
    }
    router.refresh()
  }

  const handleResendCode = async () => {
    setResending(true)
    setError(null)

    const result = await resendVerificationCode(email)

    if (result.error) {
      setError(result.error)
    } else {
      setError(null)
      alert("Código reenviado a tu email")
    }

    setResending(false)
  }

  if (needsVerification) {
    return (
      <div className="w-full max-w-md px-4">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Verificar Email</CardTitle>
            <CardDescription>
              Ingresa el código de 6 dígitos enviado a<br />
              <span className="font-medium">{email}</span>
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmitVerify(onVerify)}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="code">Código de verificación</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  {...registerVerify("code")}
                />
                {verifyErrors.code && (
                  <p className="text-sm text-destructive">{verifyErrors.code.message}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={verifySubmitting}>
                {verifySubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Verificar"
                )}
              </Button>

              <div className="flex flex-col gap-2 text-center text-sm">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="text-primary hover:underline disabled:opacity-50"
                >
                  {resending ? "Reenviando..." : "Reenviar código"}
                </button>
                <button
                  type="button"
                  onClick={() => setNeedsVerification(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Volver al login
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md px-4">
      <Card>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-10"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary"
                  tabIndex={-1}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Regístrate
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
