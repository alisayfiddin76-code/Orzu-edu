<template>
  <div class="min-h-screen bg-brand-background text-brand-text font-sans flex flex-col py-8 px-4 sm:px-6 selection:bg-brand-primary selection:text-white relative overflow-hidden">
    <!-- Background decor -->
    <div class="absolute inset-0 z-0 pointer-events-none">
      <div class="absolute top-[10%] left-[10%] w-[32rem] h-[32rem] bg-brand-accent/10 rounded-full blur-[120px] animate-fade-in"></div>
      <div class="absolute bottom-[10%] right-[10%] w-[24rem] h-[24rem] bg-brand-primary/5 rounded-full blur-[120px] animate-fade-in" style="animation-delay: 0.2s"></div>
    </div>

    <!-- Back to home: mobilda flow-da, sm+ da absolute -->
    <div class="relative z-10 mb-4 sm:mb-0 sm:absolute sm:top-8 sm:left-8 animate-slide-up">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-primary transition-colors duration-300 bg-white px-4 py-2 rounded-full border border-brand-border shadow-sm hover:shadow-md"
      >
        <span>←</span>
        <span>Bosh sahifaga qaytish</span>
      </NuxtLink>
    </div>

    <!-- Content: markazlashtirilgan -->
    <div class="flex-1 flex flex-col justify-center items-center w-full relative z-10">
      <div class="w-full max-w-md animate-slide-up" style="animation-delay: 0.1s">
        <!-- Logo -->
        <div class="text-center mb-8">
          <NuxtLink to="/" class="inline-flex items-center gap-3 group focus:outline-none">
            <div class="w-14 h-14 sm:w-16 sm:h-16 bg-brand-primary rounded-2xl flex items-center justify-center p-2 shadow-md shadow-brand-primary/30">
              <img src="~/assets/logo.png" alt="Orzu Edu Logo" class="w-full h-full object-contain" />
            </div>
            <div class="text-left">
              <span class="text-2xl sm:text-3xl font-black tracking-tight text-brand-primary">ORZU EDU</span>
              <p class="text-[11px] text-slate-500 tracking-widest uppercase font-bold">O''quv Markazi</p>
            </div>
          </NuxtLink>
        </div>

        <!-- Main Slot -->
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Minimal auth layout
</script>
