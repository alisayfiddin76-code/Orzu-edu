<template>
  <div class="min-h-screen bg-brand-background relative overflow-hidden">
    
    <!-- Ambient Glow -->
    <div class="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none"></div>
    <div class="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[150px] pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-6 py-24 relative z-10">

      <!-- Header -->
      <div class="text-center mb-20 animate-slide-up">
        <span class="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold bg-brand-accent/10 border border-brand-accent/30 text-brand-darkGold mb-6 tracking-widest uppercase">
          🤝 Ishonchli Hamkorlar
        </span>
        <h1 class="text-4xl md:text-6xl font-black mb-6 tracking-tight text-brand-primary leading-tight">
          Bizning <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-darkGold">Hamkor</span> Universitetlar
        </h1>
        <p class="text-brand-textSecondary max-w-2xl mx-auto text-lg leading-relaxed">
          ORZU EDU o'quvchilariga sifatli ta'lim va grantlar taqdim etuvchi nufuzli hamkor muassasalar.
        </p>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="flex justify-center items-center py-32">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-slate-800 rounded-full"></div>
          <div class="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-32">
        <div class="text-6xl mb-4">⚠️</div>
        <p class="text-red-400 font-semibold text-lg">Ma'lumotlarni yuklashda xatolik yuz berdi.</p>
      </div>

      <!-- Partners Grid -->
      <div v-else>
        <div v-if="!partners.length" class="text-center py-32">
          <div class="text-6xl mb-4">🏛️</div>
          <p class="text-brand-textSecondary font-semibold">Hamkorlar hali qo'shilmagan</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <a
            v-for="(partner, index) in partners"
            :key="partner._id || index"
            :href="partner.website || '#'"
            target="_blank"
            rel="noopener noreferrer"
            class="partner-card group relative rounded-2xl border border-brand-border bg-brand-card overflow-hidden hover:border-brand-accent/50 transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-[0_20px_60px_-10px_rgba(242,194,48,0.2)] flex flex-col"
            :style="{ animationDelay: `${index * 80}ms` }"
          >
            <!-- Top glow line on hover -->
            <div class="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-brand-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <!-- Hover overlay -->
            <div class="absolute inset-0 bg-brand-background/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>

            <!-- Card Top: Logo + Name -->
            <div class="relative p-6 flex items-center gap-4 border-b border-brand-border">
              <!-- Logo -->
              <div class="w-16 h-16 shrink-0 rounded-xl bg-brand-background border border-brand-border flex items-center justify-center overflow-hidden group-hover:border-brand-accent/30 transition-all duration-300">
                <img 
                  v-if="partner.logo" 
                  :src="partner.logo" 
                  :alt="partner.name"
                  class="max-w-[80%] max-h-[80%] object-contain"
                />
                <span v-else class="text-xl font-black text-brand-primary">
                  {{ partner.name?.substring(0, 2)?.toUpperCase() }}
                </span>
              </div>
              <!-- Title -->
              <div class="flex-1 min-w-0">
                <h3 class="text-brand-text font-bold text-base leading-snug group-hover:text-brand-primary transition-colors duration-300 truncate">
                  {{ partner.name }}
                </h3>
                <p v-if="partner.country" class="text-brand-textSecondary text-xs mt-1 flex items-center gap-1">
                  🌍 {{ partner.country }}
                </p>
              </div>
            </div>

            <!-- Card Body: About -->
            <div class="relative p-6 flex flex-col gap-4 flex-1">
              <!-- About -->
              <p v-if="partner.about" class="text-brand-textSecondary text-sm leading-relaxed line-clamp-3">
                {{ partner.about }}
              </p>
              <p v-else class="text-brand-textSecondary/70 text-sm italic">Qo'shimcha ma'lumot mavjud emas</p>

              <!-- Info badges -->
              <div class="flex flex-wrap gap-2 mt-auto">
                <span v-if="partner.visaScore" class="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold bg-brand-primary/5 text-brand-primary border border-brand-primary/10">
                  📊 {{ partner.visaScore }}
                </span>
                <span v-if="partner.visaCountry" class="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold bg-brand-secondary/5 text-brand-secondary border border-brand-secondary/10">
                  🛂 {{ partner.visaCountry }}
                </span>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="relative px-6 py-3 bg-brand-background/80 border-t border-brand-border flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse"></div>
                <span class="text-[10px] text-brand-textSecondary uppercase tracking-widest font-semibold">Hamkor</span>
              </div>
              <span class="text-xs text-brand-primary font-bold group-hover:translate-x-0.5 transition-transform duration-300 flex items-center gap-1">
                Veb-sayt
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </span>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

useHead({
  title: "Hamkorlarimiz — ORZU EDU",
  meta: [
    { name: "description", content: "ORZU EDU o'quv markazining nufuzli hamkor universitetlari va tashkilotlari." }
  ]
});

const { data: partnersData, pending, error } = await useFetch<any>("/api/v1/partners", {
  key: "public-partners"
});

const partners = computed(() => partnersData.value?.data?.partners ?? []);
</script>

<style scoped>
.animate-slide-up {
  animation: fadeSlideUp 0.8s ease-out forwards;
}

@keyframes fadeSlideUp {
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
}

.partner-card {
  animation: cardAppear 0.6s ease-out both;
}

@keyframes cardAppear {
  0% { opacity: 0; transform: translateY(24px) scale(0.97); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
