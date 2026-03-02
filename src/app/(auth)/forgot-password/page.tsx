"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  sendResetPasswordEmail,
  exchangeResetPasswordToken,
  resetPassword,
} from "@/lib/insforge-auth"

// ─── Schemas ──────────────────────────────────────────────────────────────────
const emailSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
})

const codeSchema = z.object({
  code: z
    .string()
    .length(6, "El código debe tener exactamente 6 dígitos")
    .regex(/^\d+$/, "Solo se permiten dígitos"),
})

const passwordSchema = z
  .object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

type EmailData = z.infer<typeof emailSchema>
type CodeData = z.infer<typeof codeSchema>
type PasswordData = z.infer<typeof passwordSchema>

type Step = "email" | "code" | "password" | "success"

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)

  // ── Step 1: Email form ────────────────────────────────────────────────────
  const emailForm = useForm<EmailData>({ resolver: zodResolver(emailSchema) })

  const onEmailSubmit = async (data: EmailData) => {
    setError(null)
    const result = await sendResetPasswordEmail(data.email)
    if (result.error) {
      setError(result.error)
      return
    }
    setEmail(data.email)
    setStep("code")
  }

  // ── Step 2: Code form ─────────────────────────────────────────────────────
  const codeForm = useForm<CodeData>({ resolver: zodResolver(codeSchema) })

  const onCodeSubmit = async (data: CodeData) => {
    setError(null)
    const result = await exchangeResetPasswordToken(email, data.code)
    if (result.error) {
      setError(result.error)
      return
    }
    setResetToken(result.token!)
    setStep("password")
  }

  const handleResend = async () => {
    setResending(true)
    setError(null)
    const result = await sendResetPasswordEmail(email)
    if (result.error) setError(result.error)
    setResending(false)
  }

  // ── Step 3: New password form ─────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const passwordForm = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) })

  const onPasswordSubmit = async (data: PasswordData) => {
    setError(null)
    const result = await resetPassword(data.password, resetToken)
    if (result.error) {
      setError(result.error)
      return
    }
    setStep("success")
  }

  // ─── Shared page shell ────────────────────────────────────────────────────
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Cpu className="size-4" />
          </div>
          BasicTech
        </Link>

        {/* ── Step 1: Email ─────────────────────────────────────────────── */}
        {step === "email" && (
          <Card>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">¿Olvidaste tu contraseña?</CardTitle>
              <CardDescription>
                Ingresa tu email y te enviaremos un código para restablecer tu contraseña.
              </CardDescription>
            </CardHeader>

            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
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
                      autoComplete="email"
                      {...emailForm.register("email")}
                    />
                  </div>
                  {emailForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={emailForm.formState.isSubmitting}
                >
                  {emailForm.formState.isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
                  ) : (
                    "Enviar código"
                  )}
                </Button>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Volver al inicio de sesión
                </Link>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* ── Step 2: Code ──────────────────────────────────────────────── */}
        {step === "code" && (
          <Card>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Ingresa el código</CardTitle>
              <CardDescription>
                Enviamos un código de 6 dígitos a<br />
                <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>

            <form onSubmit={codeForm.handleSubmit(onCodeSubmit)}>
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
                    inputMode="numeric"
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                    autoComplete="one-time-code"
                    {...codeForm.register("code")}
                  />
                  {codeForm.formState.errors.code && (
                    <p className="text-sm text-destructive">
                      {codeForm.formState.errors.code.message}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={codeForm.formState.isSubmitting}
                >
                  {codeForm.formState.isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...</>
                  ) : (
                    "Verificar código"
                  )}
                </Button>

                <div className="flex flex-col items-center gap-2 text-sm">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="text-primary hover:underline disabled:opacity-50"
                  >
                    {resending ? "Reenviando..." : "Reenviar código"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep("email"); setError(null) }}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Cambiar email
                  </button>
                </div>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* ── Step 3: New password ──────────────────────────────────────── */}
        {step === "password" && (
          <Card>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Nueva contraseña</CardTitle>
              <CardDescription>
                Elige una contraseña segura de al menos 8 caracteres.
              </CardDescription>
            </CardHeader>

            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Nueva contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      autoComplete="new-password"
                      {...passwordForm.register("password")}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      autoComplete="new-password"
                      {...passwordForm.register("confirmPassword")}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={passwordForm.formState.isSubmitting}
                >
                  {passwordForm.formState.isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                  ) : (
                    "Restablecer contraseña"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* ── Step 4: Success ───────────────────────────────────────────── */}
        {step === "success" && (
          <Card>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold">¡Contraseña actualizada!</CardTitle>
              <CardDescription>
                Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full" onClick={() => router.push("/login")}>
                Ir al inicio de sesión
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
