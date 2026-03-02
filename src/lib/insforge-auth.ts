import { insforge } from './insforge'
import type { UserProfile, UserRole } from '@/types'

export interface AuthUser {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  role: UserRole
}

export interface AuthSession {
  user: AuthUser
  accessToken: string
  expiresAt?: Date
}

export async function signUp(email: string, password: string, name: string): Promise<{ data?: AuthSession; error?: string }> {
  try {
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name,
    })

    if (error) {
      return { error: error.message || 'Error al registrar usuario' }
    }

    if (data?.requireEmailVerification) {
      return { error: 'Por favor verifica tu email para continuar' }
    }

    if (data?.accessToken && data.user) {
      await createUserProfile(data.user.id, email, name)
      
      return {
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.profile?.name || name,
            avatar: data.user.profile?.avatar_url,
            role: 'CUSTOMER',
          },
          accessToken: data.accessToken,
        },
      }
    }

    return { error: 'Error inesperado al registrar' }
  } catch (err) {
    return { error: 'Error de conexión' }
  }
}

export async function signIn(email: string, password: string): Promise<{ data?: AuthSession; error?: string }> {
  try {
    const { data, error } = await insforge.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: 'Email o contraseña incorrectos' }
    }

    if (data?.accessToken && data.user) {
      let userProfile = await getUserProfile(data.user.id)

      if (!userProfile) {
        userProfile = await createUserProfile(
          data.user.id,
          data.user.email,
          data.user.profile?.name || 'Usuario'
        )
      }

      return {
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            name: userProfile?.name || data.user.profile?.name || 'Usuario',
            phone: userProfile?.phone,
            avatar: userProfile?.avatar || data.user.profile?.avatar_url,
            role: (userProfile?.role as UserRole) || 'CUSTOMER',
          },
          accessToken: data.accessToken,
        },
      }
    }

    return { error: 'Error inesperado al iniciar sesión' }
  } catch (err) {
    return { error: 'Error de conexión' }
  }
}

export async function signOut(): Promise<{ error?: string }> {
  try {
    const { error } = await insforge.auth.signOut()
    if (error) {
      return { error: error.message }
    }
    return {}
  } catch (err) {
    return { error: 'Error al cerrar sesión' }
  }
}

export async function getSession(): Promise<{ data?: AuthSession | null; error?: string }> {
  try {
    const { data, error } = await insforge.auth.getCurrentSession()

    if (error || !data?.session) {
      return { data: null }
    }

    const { session } = data
    let userProfile = await getUserProfile(session.user.id)

    if (!userProfile && session.user) {
      userProfile = await createUserProfile(
        session.user.id,
        session.user.email,
        session.user.profile?.name || 'Usuario'
      )
    }

    return {
      data: {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: userProfile?.name || session.user.profile?.name || 'Usuario',
          phone: userProfile?.phone,
          avatar: userProfile?.avatar || session.user.profile?.avatar_url,
          role: (userProfile?.role as UserRole) || 'CUSTOMER',
        },
        accessToken: session.accessToken,
        expiresAt: session.expiresAt,
      },
    }
  } catch (err) {
    return { data: null }
  }
}

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await insforge.database
      .from('user_profiles')
      .select('*')
      .eq('auth_user_id', userId)
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      avatar: data.avatar,
      role: data.role || 'CUSTOMER',
      status: data.status || 'ACTIVE',
    }
  } catch {
    return null
  }
}

async function createUserProfile(
  userId: string,
  email: string,
  name: string,
  options?: { role?: string }
): Promise<UserProfile | null> {
  try {
    const { data, error } = await insforge.database
      .from('user_profiles')
      .insert([{
        auth_user_id: userId,
        email,
        name,
        role: options?.role ?? 'CUSTOMER',
        status: 'ACTIVE',
      }])
      .select()
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      avatar: data.avatar,
      role: data.role || 'CUSTOMER',
      status: data.status || 'ACTIVE',
    }
  } catch {
    return null
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'name' | 'phone' | 'avatar' | 'role' | 'status'>>
): Promise<{ data?: UserProfile; error?: string }> {
  try {
    const { data, error } = await insforge.database
      .from('user_profiles')
      .update(updates)
      .eq('auth_user_id', userId)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    return {
      data: {
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        avatar: data.avatar,
        role: data.role || 'CUSTOMER',
        status: data.status || 'ACTIVE',
      },
    }
  } catch (err) {
    return { error: 'Error al actualizar perfil' }
  }
}

export async function verifyEmail(
  email: string, 
  code: string
): Promise<{ data?: AuthSession; error?: string }> {
  try {
    const { data, error } = await insforge.auth.verifyEmail({
      email,
      otp: code,
    })

    if (error) {
      return { error: error.message || 'Código de verificación inválido' }
    }

    if (data?.accessToken && data.user) {
      let userProfile = await getUserProfile(data.user.id)
      
      if (!userProfile) {
        userProfile = await createUserProfile(
          data.user.id,
          data.user.email,
          data.user.profile?.name || 'Usuario'
        )
      }

      return {
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            name: userProfile?.name || data.user.profile?.name || 'Usuario',
            phone: userProfile?.phone,
            avatar: userProfile?.avatar || data.user.profile?.avatar_url,
            role: (userProfile?.role as UserRole) || 'CUSTOMER',
          },
          accessToken: data.accessToken,
        },
      }
    }

    return { error: 'Error al verificar email' }
  } catch (err) {
    return { error: 'Error de conexión' }
  }
}

export async function resendVerificationCode(email: string): Promise<{ error?: string }> {
  try {
    const { error } = await insforge.auth.resendVerificationEmail({ email })

    if (error) {
      return { error: error.message || 'Error al reenviar código' }
    }

    return {}
  } catch (err) {
    return { error: 'Error de conexión' }
  }
}

// ─── Password Reset ───────────────────────────────────────────────────────────

/** Step 1: sends a 6-digit code to the user's email */
export async function sendResetPasswordEmail(
  email: string
): Promise<{ error?: string }> {
  try {
    const { error } = await insforge.auth.sendResetPasswordEmail({ email })
    if (error) return { error: error.message || 'Error al enviar el correo' }
    return {}
  } catch {
    return { error: 'Error de conexión' }
  }
}

/** Step 2: exchanges the 6-digit code for a short-lived reset token */
export async function exchangeResetPasswordToken(
  email: string,
  code: string
): Promise<{ token?: string; error?: string }> {
  try {
    const { data, error } = await insforge.auth.exchangeResetPasswordToken({ email, code })
    if (error) return { error: error.message || 'Código inválido o expirado' }
    if (!data?.token) return { error: 'No se recibió el token de restablecimiento' }
    return { token: data.token }
  } catch {
    return { error: 'Error de conexión' }
  }
}

/** Step 3: sets the new password using the reset token */
export async function resetPassword(
  newPassword: string,
  token: string
): Promise<{ error?: string }> {
  try {
    const { error } = await insforge.auth.resetPassword({ newPassword, otp: token })
    if (error) return { error: error.message || 'Error al restablecer la contraseña' }
    return {}
  } catch {
    return { error: 'Error de conexión' }
  }
}
