<template>
  <div class="w-full relative py-12 flex flex-col items-center">
    <!-- Carousel Track -->
    <div class="relative w-full max-w-5xl mx-auto h-[240px] sm:h-[320px] flex items-center justify-center perspective-[1000px]">
      
      <!-- Slide Items -->
      <div 
        v-for="(partner, index) in partners" 
        :key="partner._id || index"
        class="absolute transition-all duration-[600ms] ease-[cubic-bezier(0.25,0.8,0.25,1)] flex items-center justify-center rounded-[2rem] cursor-pointer"
        :class="getCardClass(index)"
        @click="goTo(index)"
      >
        <div 
          class="w-full h-full flex items-center justify-center p-6 sm:p-10 rounded-[2rem] transition-colors duration-500"
          :class="index === currentIndex 
            ? 'bg-[#06263B]/60 backdrop-blur-md border-[1.5px] border-[#F2C230] shadow-[0_0_40px_rgba(242,194,48,0.25)] ring-1 ring-[#F2C230]/50' 
            : 'bg-[#06263B]/30 backdrop-blur-sm border border-white/10 hover:border-white/30'"
        >
          <img 
            v-if="partner.logo" 
            :src="partner.logo" 
            :alt="partner.name" 
            class="max-w-full max-h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" 
            :class="index === currentIndex ? 'opacity-100 scale-100' : 'opacity-80 scale-95 grayscale-[30%]'"
          />
          <span 
            v-else 
            class="text-white font-black text-center text-lg md:text-xl drop-shadow-md"
            :class="index === currentIndex ? 'opacity-100' : 'opacity-60'"
          >
            {{ partner.name }}
          </span>
        </div>
      </div>
      
      <!-- Controls -->
      <button @click="prev" class="absolute left-0 sm:left-4 z-40 w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-brand-accent hover:text-[#06263B] transition-all backdrop-blur-md">
        <svg class="w-5 h-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <button @click="next" class="absolute right-0 sm:right-4 z-40 w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-brand-accent hover:text-[#06263B] transition-all backdrop-blur-md">
        <svg class="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
    
    <!-- Pagination indicators -->
    <div class="flex items-center gap-2 mt-8 z-20">
      <button 
        v-for="(_, i) in partners" 
        :key="i"
        @click="goTo(i)"
        class="h-1.5 rounded-full transition-all duration-300"
        :class="i === currentIndex ? 'w-8 bg-brand-accent shadow-[0_0_10px_rgba(242,194,48,0.8)]' : 'w-2 bg-white/20 hover:bg-white/40'"
      ></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  partners: any[]
}>();

const currentIndex = ref(0);
let autoPlayInterval: any = null;

const startAutoPlay = () => {
  stopAutoPlay();
  autoPlayInterval = setInterval(() => {
    next();
  }, 4000);
};

const stopAutoPlay = () => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
  }
};

const next = () => {
  if (!props.partners || props.partners.length === 0) return;
  currentIndex.value = (currentIndex.value + 1) % props.partners.length;
  startAutoPlay(); // Reset timer on manual action
};

const prev = () => {
  if (!props.partners || props.partners.length === 0) return;
  currentIndex.value = (currentIndex.value - 1 + props.partners.length) % props.partners.length;
  startAutoPlay();
};

const goTo = (index: number) => {
  currentIndex.value = index;
  startAutoPlay();
};

const getOffset = (index: number) => {
  const total = props.partners.length;
  if (total === 0) return 0;
  
  let diff = index - currentIndex.value;
  
  // Wrap around for infinite 3D loop
  if (total >= 5) {
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
  }
  return diff;
};

const getCardClass = (index: number) => {
  const offset = getOffset(index);
  
  const baseSize = 'w-[160px] h-[160px] sm:w-[220px] sm:h-[220px] md:w-[260px] md:h-[260px]';
  
  if (offset === 0) {
    // Center card
    return `z-30 opacity-100 scale-100 translate-x-0 ${baseSize}`;
  } 
  if (offset === -1) {
    // Left 1
    return `z-20 opacity-70 scale-[0.85] -translate-x-[60%] md:-translate-x-[75%] blur-[1px] ${baseSize}`;
  }
  if (offset === 1) {
    // Right 1
    return `z-20 opacity-70 scale-[0.85] translate-x-[60%] md:translate-x-[75%] blur-[1px] ${baseSize}`;
  }
  if (offset === -2) {
    // Left 2
    return `z-10 opacity-30 scale-75 -translate-x-[110%] md:-translate-x-[140%] blur-[2px] hidden sm:flex ${baseSize}`;
  }
  if (offset === 2) {
    // Right 2
    return `z-10 opacity-30 scale-75 translate-x-[110%] md:translate-x-[140%] blur-[2px] hidden sm:flex ${baseSize}`;
  }
  
  // Others hidden
  return `z-0 opacity-0 scale-50 translate-x-0 pointer-events-none hidden ${baseSize}`;
};

onMounted(() => {
  startAutoPlay();
});

onUnmounted(() => {
  stopAutoPlay();
});
</script>
