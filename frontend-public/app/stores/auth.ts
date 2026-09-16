import { defineStore } from 'pinia';

interface User {
  _id: string
  firstname: string
  lastname: string
  phone: string
  role: string
  status: string
  birthdate?: string
  birthDate?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isAuthenticated: false,
  }),

  actions: {
    // Tizimga kirish logikasi (Telefon + Tug'ilgan kun)
    async login(phone: string, birthdate: string) {
      try {
        const response = await $fetch('/api/v1/auth/public-login', {
          method: 'POST',
          body: { phone, birthdate },
        });

        if (response.status === 'success') {
          this.user = response.data.user;
          this.token = response.token;
          this.isAuthenticated = true;

          // LocalStorage orqali saqlaymiz (agar client-side bo'lsa)
          if (process.client) {
            localStorage.setItem('orzu_public_token', this.token);
            localStorage.setItem('orzu_public_user', JSON.stringify(this.user));
          }

          // Role asosida redirect manzilini qaytaramiz
          return response.redirectTo || '/dashboard';
        }
      } catch (error: any) {
        console.error('Login error:', error);
        throw error;
      }
    },

    // Ota-onalar uchun faqat telefon orqali kirish
    async parentLogin(phone: string) {
      try {
        const response = await $fetch('/api/v1/auth/parent-login', {
          method: 'POST',
          body: { phone },
        });

        if (response.status === 'success') {
          this.user = response.data.user;
          this.token = response.token;
          this.isAuthenticated = true;

          if (process.client) {
            localStorage.setItem('orzu_public_token', this.token);
            localStorage.setItem('orzu_public_user', JSON.stringify(this.user));
          }

          return response.redirectTo || '/parent/dashboard';
        }
      } catch (error: any) {
        console.error('Parent Login error:', error);
        throw error;
      }
    },

    // Tizimdan chiqish
    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;

      if (process.client) {
        localStorage.removeItem('orzu_public_token');
        localStorage.removeItem('orzu_public_user');
      }
    },

    // Sahifa yangilanganda tokenni tiklash
    initializeStore() {
      if (process.client) {
        const token = localStorage.getItem('orzu_public_token');
        const user = localStorage.getItem('orzu_public_user');

        if (token && user) {
          this.token = token;
          this.user = JSON.parse(user);
          this.isAuthenticated = true;
        }
      }
    },
  },
});
