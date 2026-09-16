<template>
  <div class="min-h-screen bg-brand-background text-brand-text font-sans flex flex-col selection:bg-brand-accent selection:text-brand-dark">
    <!-- Premium Navbar -->
    <header 
      class="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      :class="($route.path === '/' && !isScrolled) 
        ? 'bg-transparent py-4' 
        : 'bg-[#082F49] backdrop-blur-md border-b border-white/10 shadow-[0_2px_20px_rgba(0,0,0,0.4)] py-3'"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 group focus:outline-none">
          <div class="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center">
            <img src="~/assets/logo.png" alt="Orzu Edu Logo" class="w-full h-full object-contain" />
          </div>
          <span class="text-lg sm:text-xl font-black tracking-tight" :class="($route.path !== '/' || isScrolled) ? 'text-brand-accent' : 'text-white'">ORZU EDU</span>
        </NuxtLink>

        <!-- Desktop Navigation Links -->
        <nav class="hidden lg:flex items-center gap-8">
          <NuxtLink 
            v-for="link in navLinks" 
            :key="link.path" 
            :to="link.path"
            class="text-sm font-semibold transition-colors duration-300 relative py-2 group nav-link"
            :class="[
              ($route.path === '/' && !isScrolled) ? 'text-white/90 hover:text-white' : 'text-white hover:text-brand-accent',
              { 'active-link': $route.path === link.path }
            ]"
          >
            {{ link.name }}
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-accent group-hover:w-full transition-all duration-300"></span>
          </NuxtLink>
        </nav>

        <!-- Desktop Actions -->
        <div class="hidden lg:flex items-center gap-3">
          <client-only>
            <div v-if="authStore.isAuthenticated" class="flex items-center gap-3">
              <NuxtLink 
                :to="authStore.user?.role === 'PARENT' ? '/parent/dashboard' : '/dashboard'" 
                class="text-sm font-semibold transition-colors py-2 px-4 rounded-full border text-brand-accent border-brand-accent/30 hover:bg-brand-accent/10"
              >
                Kabinet: {{ authStore.user?.firstname }}
              </NuxtLink>
              <button @click="logout" class="text-sm font-medium text-red-400 hover:text-red-300 transition-colors">Chiqish</button>
            </div>
            <div v-else class="flex items-center gap-3">
              <NuxtLink to="/login" class="text-sm font-bold text-white hover:text-brand-accent transition-colors">Kirish</NuxtLink>
              <NuxtLink to="/register" class="text-sm font-bold text-[#06263B] bg-brand-accent hover:bg-[#FFD34D] py-2.5 px-6 rounded-full transition-all shadow-lg">
                Ro'yxatdan o'tish
              </NuxtLink>
            </div>
          </client-only>
        </div>

        <!-- Mobile Right: Kirish + Hamburger -->
        <div class="flex lg:hidden items-center gap-2">
          <client-only>
            <NuxtLink v-if="!authStore.isAuthenticated" to="/login"
              class="text-xs font-bold text-white py-2 px-3 rounded-lg border border-white/20 bg-white/8 hover:bg-white/15 transition-colors">
              Kirish
            </NuxtLink>
            <NuxtLink v-else :to="authStore.user?.role === 'PARENT' ? '/parent/dashboard' : '/dashboard'"
              class="text-xs font-bold text-brand-accent py-2 px-3 rounded-lg border border-brand-accent/30 bg-brand-accent/8">
              Kabinet
            </NuxtLink>
          </client-only>

          <!-- Animated Hamburger -->
          <button 
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-xl bg-white/12 border border-white/15 hover:bg-white/20 transition-all shrink-0"
            aria-label="Menyu"
          >
            <span class="block h-[2px] w-5 bg-white rounded-full transition-all duration-300 origin-center"
              :style="isMobileMenuOpen ? 'transform: rotate(45deg) translateY(7px)' : ''"></span>
            <span class="block h-[2px] w-5 bg-white rounded-full transition-all duration-300"
              :style="isMobileMenuOpen ? 'opacity: 0' : ''"></span>
            <span class="block h-[2px] w-5 bg-white rounded-full transition-all duration-300 origin-center"
              :style="isMobileMenuOpen ? 'transform: rotate(-45deg) translateY(-7px)' : ''"></span>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Menu -->
      <Transition name="slide-down">
        <div
          v-if="isMobileMenuOpen"
          class="lg:hidden bg-[#082F49]/98 backdrop-blur-xl border-t border-white/10 shadow-2xl w-full"
        >
          <div class="px-4 py-3 space-y-0.5">
            <NuxtLink 
              v-for="link in navLinks" 
              :key="link.path" 
              :to="link.path"
              @click="isMobileMenuOpen = false"
              class="flex items-center text-sm font-bold text-white hover:text-brand-accent py-3 px-4 rounded-xl hover:bg-white/5 transition-all"
              :class="{ 'text-brand-accent bg-brand-accent/10': $route.path === link.path }"
            >
              {{ link.name }}
            </NuxtLink>

            <!-- Mobile auth -->
            <div class="pt-3 mt-1 border-t border-white/10">
              <client-only>
                <div v-if="authStore.isAuthenticated" class="flex flex-col gap-2">
                  <NuxtLink 
                    :to="authStore.user?.role === 'PARENT' ? '/parent/dashboard' : '/dashboard'"
                    @click="isMobileMenuOpen = false"
                    class="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-accent/10 border border-brand-accent/30 text-brand-accent font-bold text-sm"
                  >
                    👤 {{ authStore.user?.firstname }} — Kabinet
                  </NuxtLink>
                  <button 
                    @click="logout(); isMobileMenuOpen = false"
                    class="py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm"
                  >
                    Chiqish
                  </button>
                </div>
                <NuxtLink
                  v-else
                  to="/register"
                  @click="isMobileMenuOpen = false"
                  class="flex items-center justify-center py-3.5 px-4 rounded-xl bg-brand-accent text-[#06263B] font-black text-sm shadow-lg"
                >
                  🎓 Ro'yxatdan o'tish
                </NuxtLink>
              </client-only>
            </div>
          </div>
        </div>
      </Transition>
    </header>


    <!-- Main Content Slot -->
    <main class="flex-grow" :class="{ 'pt-24': $route.path !== '/' }">
      <slot />
    </main>

    <!-- Ultra-Premium Anti-Gravity Footer (Exact Match) -->
    <footer class="bg-[#06263B] text-white pt-28 pb-10 overflow-hidden relative">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <!-- Desktop Footer (hidden on mobile) -->
        <div class="hidden md:grid border border-slate-500/30 rounded-3xl p-8 md:p-10 lg:p-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 bg-[#082F49] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          
          <!-- Column 1: Identity -->
          <div class="border border-slate-500/30 rounded-2xl p-8 lg:p-10 flex flex-col items-center justify-center bg-[#0C3E63]/40 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
            <h3 class="text-white font-bold text-xl mb-10 self-start w-full drop-shadow-md">Identity</h3>
            <div class="flex-grow flex items-center justify-center w-full">
              <h2 class="text-5xl md:text-6xl font-black text-transparent text-center leading-tight tracking-wider" style="-webkit-text-stroke: 2px #22d3ee; filter: drop-shadow(0 0 15px rgba(34, 211, 238, 0.7));">
                ORZU<br/>EDU
              </h2>
            </div>
          </div>

          <!-- Column 2: Navigation -->
          <div class="border border-slate-500/30 rounded-2xl p-8 lg:p-10 flex flex-col bg-[#0C3E63]/40 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
            <h3 class="text-white font-bold text-xl mb-8 drop-shadow-md">Navigation</h3>
            <ul class="space-y-4 text-base font-medium text-slate-200">
              <li><NuxtLink to="/" class="block px-5 py-3 rounded-xl bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all shadow-[inset_0_0_15px_rgba(34,211,238,0.1)]">Bosh sahifa</NuxtLink></li>
              <li><NuxtLink to="/courses" class="block px-5 py-3 hover:text-white transition-all">Kurslar</NuxtLink></li>
              <li><NuxtLink to="/teachers" class="block px-5 py-3 hover:text-white transition-all">O'qituvchilar</NuxtLink></li>
              <li><NuxtLink to="/blog" class="block px-5 py-3 hover:text-white transition-all">Blog</NuxtLink></li>
              <li><NuxtLink to="/contact" class="block px-5 py-3 hover:text-white transition-all">Aloqa</NuxtLink></li>
            </ul>
          </div>

          <!-- Column 3: Socials -->
          <div class="border border-slate-500/30 rounded-2xl p-8 lg:p-10 flex flex-col items-center bg-[#0C3E63]/40 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
            <h3 class="text-white font-bold text-xl mb-10 text-center uppercase tracking-wide drop-shadow-md">BIZNI IJTIMOIY<br/>TARMOQLARIMIZ</h3>
            <div class="relative w-full flex-grow min-h-[180px]">
               <!-- Youtube (Top Left) -->
               <a v-if="contactSettings.youtube" :href="contactSettings.youtube" target="_blank" class="absolute top-0 left-6 md:left-4 lg:left-8 group flex items-center justify-center w-16 h-16 rounded-full border border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.6),inset_0_0_15px_rgba(239,68,68,0.4)] transition-transform hover:scale-110 z-10 bg-[#082F49]">
                  <div class="absolute inset-[-8px] rounded-full border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.3)]"></div>
                  <Icon name="fa6-brands:youtube" class="text-red-500 text-3xl drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
               </a>
               <a v-else href="#" target="_blank" class="absolute top-0 left-6 md:left-4 lg:left-8 group flex items-center justify-center w-16 h-16 rounded-full border border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.6),inset_0_0_15px_rgba(239,68,68,0.4)] transition-transform hover:scale-110 z-10 bg-[#082F49]">
                  <div class="absolute inset-[-8px] rounded-full border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.3)]"></div>
                  <Icon name="fa6-brands:youtube" class="text-red-500 text-3xl drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
               </a>

               <!-- Telegram (Bottom Left) -->
               <a v-if="contactSettings.telegram" :href="contactSettings.telegram" target="_blank" class="absolute bottom-0 left-6 md:left-4 lg:left-8 group flex items-center justify-center w-16 h-16 rounded-full border border-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.6),inset_0_0_15px_rgba(34,211,238,0.4)] transition-transform hover:scale-110 z-10 bg-[#082F49]">
                  <div class="absolute inset-[-8px] rounded-full border border-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.3)]"></div>
                  <Icon name="fa6-brands:telegram" class="text-cyan-400 text-3xl drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
               </a>
               <a v-else href="https://t.me/orzuedu" target="_blank" class="absolute bottom-0 left-6 md:left-4 lg:left-8 group flex items-center justify-center w-16 h-16 rounded-full border border-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.6),inset_0_0_15px_rgba(34,211,238,0.4)] transition-transform hover:scale-110 z-10 bg-[#082F49]">
                  <div class="absolute inset-[-8px] rounded-full border border-cyan-400/40 shadow-[0_0_10px_rgba(34,211,238,0.3)]"></div>
                  <Icon name="fa6-brands:telegram" class="text-cyan-400 text-3xl drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
               </a>

               <!-- Instagram (Middle Right) -->
               <a v-if="contactSettings.instagram" :href="contactSettings.instagram" target="_blank" class="absolute top-1/2 right-6 md:right-4 lg:right-8 -translate-y-1/2 group flex items-center justify-center w-16 h-16 rounded-full border border-pink-500/80 shadow-[0_0_15px_rgba(236,72,153,0.6),inset_0_0_15px_rgba(236,72,153,0.4)] transition-transform hover:scale-110 z-10 bg-[#082F49]">
                  <div class="absolute inset-[-8px] rounded-full border border-pink-500/40 shadow-[0_0_10px_rgba(236,72,153,0.3)]"></div>
                  <Icon name="fa6-brands:instagram" class="text-pink-500 text-3xl drop-shadow-[0_0_8px_rgba(236,72,153,0.9)]" />
               </a>
               <a v-else href="#" target="_blank" class="absolute top-1/2 right-6 md:right-4 lg:right-8 -translate-y-1/2 group flex items-center justify-center w-16 h-16 rounded-full border border-pink-500/80 shadow-[0_0_15px_rgba(236,72,153,0.6),inset_0_0_15px_rgba(236,72,153,0.4)] transition-transform hover:scale-110 z-10 bg-[#082F49]">
                  <div class="absolute inset-[-8px] rounded-full border border-pink-500/40 shadow-[0_0_10px_rgba(236,72,153,0.3)]"></div>
                  <Icon name="fa6-brands:instagram" class="text-pink-500 text-3xl drop-shadow-[0_0_8px_rgba(236,72,153,0.9)]" />
               </a>
            </div>
          </div>

          <!-- Column 4: Contact info -->
          <div class="border border-slate-500/30 rounded-2xl p-8 lg:p-10 flex flex-col bg-[#0C3E63]/40 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
            <h3 class="text-white font-bold text-xl mb-10 drop-shadow-md">Contact info</h3>
            <div class="flex flex-col gap-10">
              <div class="flex items-start gap-5">
                 <div class="mt-1"><Icon name="ph:phone-duotone" class="text-cyan-400 text-4xl drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" /></div>
                 <div>
                   <p class="text-base text-slate-300 font-bold mb-1">Telefon</p>
                   <p class="text-base text-white tracking-wide">
                     <a :href="`tel:${contactSettings.phone_1}`" class="hover:text-brand-accent transition-colors">{{ contactSettings.phone_1 || '+998 94 460 96 96' }}</a>
                   </p>
                 </div>
              </div>
              <div class="flex items-start gap-5">
                 <div class="mt-1"><Icon name="ph:map-pin-duotone" class="text-cyan-400 text-4xl drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" /></div>
                 <div>
                   <p class="text-base text-slate-300 font-bold mb-1">Manzil</p>
                   <p class="text-base text-white leading-relaxed">{{ contactSettings.main_address || "Namangan, Yangiqo'rg'on" }}</p>
                 </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Glowing Divider Desktop -->
        <div class="hidden md:block mt-16 h-[2px] w-full bg-cyan-400 rounded-full shadow-[0_0_20px_#22d3ee]"></div>

        <!-- Desktop Copyright -->
        <div class="hidden md:block pt-8 text-center">
          <p class="text-base font-medium text-slate-300 tracking-wide">© 2026 ORZU EDU. Barcha huquqlar himoyalangan.</p>
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
          <div class="w-full bg-[#0C3E63]/30 border border-slate-500/20 rounded-3xl p-6 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] backdrop-blur-sm relative z-10 mb-8 w-full max-w-sm mx-auto">
            <h3 class="text-brand-accent font-black text-[11px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span> Aloqa Ma'lumotlari
            </h3>
            
            <div class="space-y-5">
              <div class="flex items-start gap-4">
                 <div class="w-12 h-12 rounded-2xl bg-[#082F49] flex items-center justify-center shrink-0 border border-slate-500/30 shadow-inner">
                   <Icon name="ph:phone-duotone" class="text-cyan-400 text-2xl drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
                 </div>
                 <div class="flex flex-col justify-center min-h-[48px]">
                   <p class="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Telefon</p>
                   <a :href="`tel:${contactSettings.phone_1}`" class="text-white font-bold text-[15px] hover:text-cyan-400 transition-colors tracking-wide">{{ contactSettings.phone_1 || '+998 94 460 96 96' }}</a>
                 </div>
              </div>
              
              <div class="flex items-start gap-4">
                 <div class="w-12 h-12 rounded-2xl bg-[#082F49] flex items-center justify-center shrink-0 border border-slate-500/30 shadow-inner">
                   <Icon name="ph:map-pin-duotone" class="text-[#D9A404] text-2xl drop-shadow-[0_0_5px_rgba(217,164,4,0.5)]" />
                 </div>
                 <div class="flex flex-col justify-center min-h-[48px]">
                   <p class="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Manzil</p>
                   <p class="text-white font-bold text-[13px] leading-snug">{{ contactSettings.main_address || "Namangan, Yangiqo'rg'on" }}</p>
                 </div>
              </div>
            </div>

            <div class="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-500/30 to-transparent my-6"></div>

            <h3 class="text-brand-accent font-black text-[11px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span> Ijtimoiy Tarmoqlar
            </h3>
            
            <div class="flex items-center gap-3">
              <a :href="contactSettings.telegram || 'https://t.me/orzuedu'" target="_blank" class="flex-1 flex items-center justify-center h-14 rounded-2xl bg-[#082F49] border border-slate-500/30 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all group shadow-sm">
                <Icon name="ph:telegram-logo" class="text-3xl group-hover:scale-110 transition-transform drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
              </a>
              <a :href="contactSettings.instagram || '#'" target="_blank" class="flex-1 flex items-center justify-center h-14 rounded-2xl bg-[#082F49] border border-slate-500/30 text-pink-400 hover:bg-pink-500/10 hover:border-pink-500/50 transition-all group shadow-sm">
                <Icon name="ph:instagram-logo" class="text-3xl group-hover:scale-110 transition-transform drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]" />
              </a>
              <a :href="contactSettings.youtube || '#'" target="_blank" class="flex-1 flex items-center justify-center h-14 rounded-2xl bg-[#082F49] border border-slate-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-all group shadow-sm">
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
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const isMobileMenuOpen = ref(false);
const isScrolled = ref(false);

const navLinks = [
  { name: 'Bosh sahifa', path: '/' },
  { name: 'Kurslar', path: '/courses' },
  { name: 'O\'qituvchilar', path: '/teachers' },
  { name: 'Blog', path: '/blog' },
  { name: 'Natijalar', path: '/results' },
  { name: 'Hamkorlar', path: '/partners' },
  { name: 'Aloqa', path: '/contact' }
];

// Contact settings fetching logic
const contactSettings = ref<any>({
  phone_1: '+998 94 460 96 96', phone_2: '', email: '',
  main_address: "Namangan, Yangiqo'rg'on", branch_address: '',
  instagram: '', telegram: '', youtube: ''
});

const fetchContactSettings = async () => {
  try {
    const res: any = await $fetch('/api/v1/settings/contact')
    if (res?.data?.settings) {
      contactSettings.value = res.data.settings
    }
  } catch (e) {
    // defaults will remain
  }
};

const logout = () => {
  authStore.logout();
  navigateTo('/');
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

if (process.client) {
  authStore.initializeStore();
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  fetchContactSettings();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style>
.active-link {
  color: #F2C230 !important;
}
.active-link span {
  width: 100% !important;
}

/* Mobile menu slide-down animation */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 600px;
  transform: translateY(0);
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
