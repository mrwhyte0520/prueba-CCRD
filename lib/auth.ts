// Sistema de autenticación con Supabase
import { supabase } from "./supabaseClient"

export interface User {
  id: string
  username: string
  name: string
  email: string
  role: string
  isStudent?: boolean
}

export async function login(username: string, password: string) {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("username", username)
      .eq("contrasena", password)
      .maybeSingle()

    if (error || !data) {
      console.error("[v0] Login error:", error?.message)
      return null
    }

    return {
      id: data.id,
      username: data.username,
      name: data.nombre,
      email: data.email,
      role: data.rol || "Usuario",
    }
  } catch (error) {
    console.error("[v0] Login exception:", error)
    return null
  }
}

export async function register(
  username: string,
  name: string,
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
          username: username,
        },
      },
    })

    if (error) {
      console.error("[v0] Registration error:", error.message)
      return { success: false, error: error.message }
    }

    if (data.user) {
  // Crear o actualizar el perfil en la tabla usuarios
  const { error: profileError } = await supabase
    .from("usuarios")
    .upsert(
      {
        id: data.user.id,
        username: username,
        nombre: name,
        email: email,
        contrasena: password, // 👈 esta línea guarda la contraseña
        rol: "Usuario",
        activo: true,
      },
      { onConflict: "id" } // 👈 evita el error de clave duplicada
    )

  if (profileError) {
    console.error("[v0] Profile creation error:", profileError.message)
  }

  const user: User = {
    id: data.user.id,
    username: username,
    name: name,
    email: email,
    role: "Usuario",
  }

  return { success: true, user }
}

    return { success: false, error: "Error al crear usuario" }
  } catch (error) {
    console.error("[v0] Registration exception:", error)
    return { success: false, error: "Error al registrar usuario" }
  }
}

export async function logout() {
  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error("[v0] Logout error:", error)
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get user profile from usuarios table
    const { data: profile, error: profileError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      // Return basic user info if profile doesn't exist
      return {
        id: user.id,
        username: user.email?.split("@")[0] || "",
        name: user.user_metadata?.name || "",
        email: user.email || "",
        role: "Usuario",
      }
    }

    return {
      id: profile.id,
      username: profile.username || user.email?.split("@")[0] || "",
      name: profile.nombre || user.user_metadata?.name || "",
      email: profile.email || user.email || "",
      role: profile.rol || "Usuario",
    }
  } catch (error) {
    console.error("[v0] Get current user error:", error)
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session !== null
  } catch (error) {
    console.error("[v0] Auth check error:", error)
    return false
  }
}

// Sistema de autenticación para estudiantes
export interface Student {
  email: string
  password: string
  name: string
  id: string
}

export function isInstitutionalEmail(email: string): boolean {
  const educationalDomains = [
    ".edu",
    ".edu.do",
    ".edu.mx",
    ".edu.co",
    ".edu.ar",
    ".edu.pe",
    ".edu.ve",
    ".ac.uk",
    ".edu.es",
  ]
  return educationalDomains.some((domain) => email.toLowerCase().endsWith(domain))
}

export async function studentLogin(email: string, password: string): Promise<User | null> {
  if (!isInstitutionalEmail(email)) {
    return null
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error || !data.user) {
      return null
    }

    // Verify user is a student
    const { data: profile } = await supabase.from("usuarios").select("*").eq("id", data.user.id).single()

    if (profile && profile.rol === "Estudiante") {
      return {
        id: profile.id,
        username: email.split("@")[0],
        name: profile.nombre,
        email: profile.email,
        role: "Estudiante",
        isStudent: true,
      }
    }

    return null
  } catch (error) {
    console.error("[v0] Student login error:", error)
    return null
  }
}

export async function studentRegister(
  name: string,
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string; user?: User }> {
  if (!isInstitutionalEmail(email)) {
    return {
      success: false,
      error: "Debes usar un correo institucional (.edu, .edu.do, etc.)",
    }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
          is_student: true,
        },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (data.user) {
      // Create student profile
      const { error: profileError } = await supabase.from("usuarios").insert({
        id: data.user.id,
        username: email.split("@")[0],
        nombre: name,
        email: email,
        rol: "Estudiante",
        activo: true,
      })

      if (profileError) {
        console.error("[v0] Student profile creation error:", profileError.message)
      }

      const studentUser: User = {
        id: data.user.id,
        username: email.split("@")[0],
        name: name,
        email: email,
        role: "Estudiante",
        isStudent: true,
      }

      return { success: true, user: studentUser }
    }

    return { success: false, error: "Error al crear cuenta de estudiante" }
  } catch (error) {
    console.error("[v0] Student registration error:", error)
    return { success: false, error: "Error al registrar estudiante" }
  }
}

export async function loginWithGoogle(): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: "Error al iniciar sesión con Google",
    }
  }
}

export async function loginWithX(): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: "Error al iniciar sesión con X",
    }
  }
}
