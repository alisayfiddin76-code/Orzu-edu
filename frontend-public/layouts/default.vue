<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
    <!-- Premium Glassmorphism Navbar -->
    <header class="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 transition-all duration-300">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3 group focus:outline-none">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <span class="text-white font-bold text-xl tracking-wider">O</span>
          </div>
          <div>
            <span class="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-400 group-hover:text-indigo-400 transition-colors duration-300">ORZU EDU</span>
            <p class="text-[10px] text-slate-500 tracking-widest uppercase font-semibold">O'quv Markazi</p>
          </div>
        </NuxtLink>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center gap-8">
          <NuxtLink 
            v-for="link in navLinks" 
            :key="link.path" 
            :to="link.path"
            class="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-300 relative py-2 group"
          >
            {{ link.name }}
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 group-hover:w-full transition-all duration-300"></span>
          </NuxtLink>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-4">
          <NuxtLink 
            to="/auth/login" 
            class="hidden sm:inline-flex text-sm font-medium text-slate-300 hover:text-white transition-colors duration-300 py-2 px-4"
          >
            Kirish
          </NuxtLink>
          <NuxtLink 
            to="/auth/register" 
            class="inline-flex items-center justify-center text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 py-2.5 px-5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Ro'yxatdan o'tish
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content Slot -->
    <main class="flex-grow">
      <slot />
    </main>

    <!-- Premium Footer -->
    <footer class="bg-slate-950 border-t border-slate-900/80">
      <div class="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <!-- Desktop Footer (hidden on mobile) -->
        <div class="hidden md:grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          <!-- Brand Info -->
          <div class="md:col-span-1 flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-md">O</div>
              <span class="text-lg font-bold tracking-tight text-white">ORZU EDU</span>
            </div>
            <p class="text-sm text-slate-400 leading-relaxed">
              Kelajak orzularingizni biz bilan birga haqiqatga aylantiring. Zamonaviy IT, tillar va maktab fanlari kurslari.
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">Kurslarimiz</h4>
            <ul class="space-y-3 text-sm text-slate-400">
              <li><NuxtLink to="/courses/it" class="hover:text-indigo-400 transition-colors">Dasturlash (IT)</NuxtLink></li>
              <li><NuxtLink to="/courses/languages" class="hover:text-indigo-400 transition-colors">Chet Tili Kurslari</NuxtLink></li>
              <li><NuxtLink to="/courses/school" class="hover:text-indigo-400 transition-colors">Maktab Fanlari</NuxtLink></li>
              <li><NuxtLink to="/courses/kids" class="hover:text-indigo-400 transition-colors">Bolalar Uchun IT</NuxtLink></li>
            </ul>
          </div>

          <!-- Company Links -->
          <div>
            <h4 class="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">O'quv Markazi</h4>
            <ul class="space-y-3 text-sm text-slate-400">
              <li><NuxtLink to="/about" class="hover:text-indigo-400 transition-colors">Biz Haqimizda</NuxtLink></li>
              <li><NuxtLink to="/teachers" class="hover:text-indigo-400 transition-colors">O'qituvchilar</NuxtLink></li>
              <li><NuxtLink to="/news" class="hover:text-indigo-400 transition-colors">Yangiliklar</NuxtLink></li>
              <li><NuxtLink to="/contacts" class="hover:text-indigo-400 transition-colors">Aloqa</NuxtLink></li>
            </ul>
          </div>

          <!-- Contact/Newsletter Info -->
          <div>
            <h4 class="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">Bog'lanish</h4>
            <p class="text-sm text-slate-400 mb-2">Telefon: <a :href="`tel:${contactSettings.phone_1}`" class="hover:text-indigo-400">{{ contactSettings.phone_1 || '+998 71 123 45 67' }}</a></p>
            <p class="text-sm text-slate-400 mb-4">Manzil: {{ contactSettings.main_address || 'Toshkent sh., Chilonzor tumani' }}</p>
            
            <div class="flex items-center gap-2">
              <input 
                type="email" 
                placeholder="Emailingiz" 
                class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button class="bg-indigo-600 hover:bg-indigo-500 transition-colors px-3 py-2 rounded-lg text-xs font-bold text-white">Yuborish</button>
            </div>
          </div>
        </div>

        <div class="hidden md:flex mt-12 pt-8 border-t border-slate-900/60 flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {{ new Date().getFullYear() }} ORZU EDU. Barcha huquqlar himoyalangan.</p>
          <div class="flex gap-6">
            <a :href="contactSettings.telegram || '#'" target="_blank" class="hover:text-slate-400 transition-colors">Telegram</a>
            <a :href="contactSettings.instagram || '#'" target="_blank" class="hover:text-slate-400 transition-colors">Instagram</a>
            <a :href="contactSettings.youtube || '#'" target="_blank" class="hover:text-slate-400 transition-colors">YouTube</a>
          </div>
        </div>

        <!-- Mobile Footer (Cosmonaut Design) -->
        <div class="md:hidden flex flex-col items-center justify-center pt-10 relative overflow-hidden">
          
          <!-- Animated Astronaut & Space Decor -->
          <div class="mb-8 relative w-64 h-64 flex items-center justify-center">
             <!-- Static Space Decor (No animation) -->
             <Icon name="ph:moon-stars-fill" class="absolute top-0 left-0 text-yellow-300 text-4xl opacity-90" />
             <Icon name="ph:star-four-fill" class="absolute top-10 right-2 text-white text-2xl opacity-80" />
             <Icon name="ph:star-four-fill" class="absolute bottom-6 left-2 text-cyan-200 text-3xl opacity-80" />
             <Icon name="ph:star-four-fill" class="absolute bottom-2 right-12 text-yellow-200 text-xl opacity-70" />
             <!-- Saturn / Jupiter -->
             <Icon name="ph:planet-duotone" class="absolute top-4 right-16 text-[#D9A404] text-5xl opacity-90 -rotate-12" />
             <Icon name="ph:planet-fill" class="absolute bottom-20 left-6 text-indigo-400 text-3xl opacity-80 rotate-45" />

             <!-- Floating Astronaut (Animated) -->
             <div class="astronaut-float z-10 relative">
               <img :src="'/images/image.png'" alt="Astronaut" class="w-56 h-56 object-contain drop-shadow-[0_0_25px_rgba(34,211,238,0.4)]" />
             </div>
          </div>

          <!-- Modern Contact Card -->
          <div class="w-full bg-slate-900/50 border border-slate-700/50 rounded-3xl p-6 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] backdrop-blur-sm relative z-10 mb-8 w-full max-w-sm mx-auto">
            <h3 class="text-indigo-400 font-black text-[11px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> Aloqa Ma'lumotlari
            </h3>
            
            <div class="space-y-5">
              <div class="flex items-start gap-4">
                 <div class="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center shrink-0 border border-slate-800 shadow-inner">
                   <Icon name="ph:phone-duotone" class="text-cyan-400 text-2xl drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
                 </div>
                 <div class="flex flex-col justify-center min-h-[48px]">
                   <p class="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Telefon</p>
                   <a :href="`tel:${contactSettings.phone_1}`" class="text-white font-bold text-[15px] hover:text-cyan-400 transition-colors tracking-wide">{{ contactSettings.phone_1 || '+998 94 460 96 96' }}</a>
                 </div>
              </div>
              
              <div class="flex items-start gap-4">
                 <div class="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center shrink-0 border border-slate-800 shadow-inner">
                   <Icon name="ph:map-pin-duotone" class="text-[#D9A404] text-2xl drop-shadow-[0_0_5px_rgba(217,164,4,0.5)]" />
                 </div>
                 <div class="flex flex-col justify-center min-h-[48px]">
                   <p class="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Manzil</p>
                   <p class="text-white font-bold text-[13px] leading-snug">{{ contactSettings.main_address || "Toshkent sh., Chilonzor tumani" }}</p>
                 </div>
              </div>
            </div>

            <div class="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent my-6"></div>

            <h3 class="text-indigo-400 font-black text-[11px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> Ijtimoiy Tarmoqlar
            </h3>
            
            <div class="flex items-center gap-3">
              <a :href="contactSettings.telegram || 'https://t.me/orzuedu'" target="_blank" class="flex-1 flex items-center justify-center h-14 rounded-2xl bg-slate-950 border border-slate-800 text-cyan-400 hover:bg-cyan-900/20 hover:border-cyan-500/50 transition-all group shadow-sm">
                <Icon name="ph:telegram-logo" class="text-3xl group-hover:scale-110 transition-transform drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
              </a>
              <a :href="contactSettings.instagram || '#'" target="_blank" class="flex-1 flex items-center justify-center h-14 rounded-2xl bg-slate-950 border border-slate-800 text-pink-400 hover:bg-pink-900/20 hover:border-pink-500/50 transition-all group shadow-sm">
                <Icon name="ph:instagram-logo" class="text-3xl group-hover:scale-110 transition-transform drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]" />
              </a>
              <a :href="contactSettings.youtube || '#'" target="_blank" class="flex-1 flex items-center justify-center h-14 rounded-2xl bg-slate-950 border border-slate-800 text-red-500 hover:bg-red-900/20 hover:border-red-500/50 transition-all group shadow-sm">
                <Icon name="ph:youtube-logo" class="text-3xl group-hover:scale-110 transition-transform drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
              </a>
            </div>
          </div>

          <!-- Divider -->
          <div class="w-full h-px bg-slate-600/50 mb-6"></div>

          <!-- Mobile Copyright -->
          <p class="text-xs font-medium text-slate-400 tracking-wide text-center">
            © 2026 ORZU EDU. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const navLinks = [
  { name: 'Bosh sahifa', path: '/' },
  { name: 'Kurslar', path: '/courses' },
  { name: 'O\'qituvchilar', path: '/teachers' },
  { name: 'Blog', path: '/blog' },
  { name: 'Natijalar', path: '/results' },
  { name: 'Hamkorlar', path: '/partners' },
  { name: 'Aloqa', path: '/contact' }
]

const contactSettings = ref({
  phone_1: '+998 71 123 45 67', phone_2: '', email: '',
  main_address: "Toshkent sh., Chilonzor tumani", branch_address: '',
  instagram: '', telegram: '', youtube: ''
});

const fetchContactSettings = async () => {
  try {
    const config = useRuntimeConfig();
    const baseURL = config.public.apiUrl || 'https://orzu-edu.onrender.com';
    const res: any = await $fetch('/api/v1/settings/contact', { baseURL })
    if (res?.data?.settings) {
      contactSettings.value = res.data.settings
    }
  } catch (e) {
    // defaults will remain
  }
};

onMounted(() => {
  fetchContactSettings();
});
</script>

<style>
/* Smooth transition effects */
.router-link-active {
  color: #818cf8 !important;
}

/* Astronaut Floating Animation */
@keyframes float {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}
.astronaut-float {
  animation: float 4s ease-in-out infinite;
}
</style>
