// Global auth guard middleware
// Runs on every route navigation

export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie("auth_token")

  if (to.path === "/") {
    return navigateTo(token.value ? "/dashboard" : "/login")
  }

  // If visiting any page other than /login and no token exists, redirect to /login
  if (to.path !== "/login" && !token.value) {
    return navigateTo("/login")
  }

  // If already logged in and trying to access /login, redirect to dashboard
  if (to.path === "/login" && token.value) {
    return navigateTo("/dashboard")
  }
})
