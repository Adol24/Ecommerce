"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { signUp, verifyEmail, resendVerificationCode } from "@/lib/insforge-auth"
import { useAuth } from "@/hooks/useAuth"

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

const verifySchema = z.object({
  code: z.string().length(6, "El código debe tener 6 dígitos"),
})

type RegisterFormData = z.infer<typeof registerSchema>
type VerifyFormData = z.infer<typeof verifySchema>

export function RegisterForm() {
  const router = useRouter()
  const { refreshSession } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [resending, setResending] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const {
    register: registerVerify,
    handleSubmit: handleSubmitVerify,
    formState: { errors: verifyErrors, isSubmitting: verifySubmitting },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setError(null)

    try {
      const result = await signUp(data.email, data.password, data.name)

      if (result.error) {
        if (result.error.toLowerCase().includes("verifica")) {
          setRegisteredEmail(data.email)
          setNeedsVerification(true)
        } else {
          setError(result.error)
        }
        return
      }

      if (result.data) {
        router.push("/")
        router.refresh()
      }
    } catch {
      setError("Error al registrar usuario")
    }
  }

  const onVerify = async (data: VerifyFormData) => {
    setError(null)

    const result = await verifyEmail(registeredEmail, data.code)

    if (result.error) {
      setError(result.error)
      return
    }

    await refreshSession()
    router.push("/")
    router.refresh()
  }

  const handleResendCode = async () => {
    setResending(true)
    setError(null)

    const result = await resendVerificationCode(registeredEmail)

    if (result.error) {
      setError(result.error)
    }

    setResending(false)
  }

  if (needsVerification) {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Verifica tu Email</CardTitle>
            <CardDescription>
              Te enviamos un código de 6 dígitos a<br />
              <span className="font-medium text-foreground">{registeredEmail}</span>
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
            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button type="submit" className="w-full" disabled={verifySubmitting}>
                {verifySubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Verificar cuenta"
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
                  Volver al registro
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Crear Cuenta</CardTitle>
          <CardDescription>
            Ingresa tus datos para crear una nueva cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nombre completo</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  {...register("name")}
                />
                {errors.name && (
                  <FieldError>{errors.name.message}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  {...register("email")}
                />
                {errors.email && (
                  <FieldError>{errors.email.message}</FieldError>
                )}
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      {...register("password")}
                    />
                    {errors.password && (
                      <FieldError>{errors.password.message}</FieldError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirmar Contraseña
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                      <FieldError>{errors.confirmPassword.message}</FieldError>
                    )}
                  </Field>
                </Field>
                <FieldDescription>
                  Debe tener al menos 6 caracteres.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    "Crear Cuenta"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Iniciar Sesión
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Al continuar, aceptas nuestros{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
          Términos de Servicio
        </Link>{" "}
        y{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
          Política de Privacidad
        </Link>
        .
      </FieldDescription>
    </div>
  )
}
