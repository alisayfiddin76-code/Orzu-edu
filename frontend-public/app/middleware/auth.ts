import { useAuthStore } from '../stores/auth';

export default defineNuxtRouteMiddleware((to, from) => {
  // Pinia storedan foydalanish
  const authStore = useAuthStore();
  
  // Agar sayt brauzerda ishga tushayotgan bo'lsa, store ni yangilaymiz
  if (process.client && !authStore.isAuthenticated) {
    authStore.initializeStore();
  }

  // Himoyalangan sahifaga kirmoqchi bo'lsayu, token yo'q bo'lsa, loginga yo'naltirish
  if (!authStore.isAuthenticated) {
    return navigateTo('/login');
  }
});
