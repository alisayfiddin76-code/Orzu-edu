<template>
  <div class="py-20 max-w-7xl mx-auto px-6 bg-brand-background min-h-screen">
    <!-- Header -->
    <div class="text-center mb-16 animate-slide-up">
      <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-brand-accent/20 border border-brand-accent text-brand-primary mb-6 shadow-sm">
        📰 Yangiliklar va Maqolalar
      </span>
      <h1 class="text-4xl sm:text-5xl font-black text-brand-primary tracking-tight">
        Foydali <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">Maqolalarimiz</span>
      </h1>
      <p class="text-slate-600 mt-6 max-w-2xl mx-auto text-base font-medium leading-relaxed">
        IT sohasi, tillarni o'rganish metodikasi va o'quv markazimiz hayotiga oid so'nggi yangiliklarni mutolaa qiling.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center items-center py-20">
      <div class="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-20 text-brand-danger font-bold">
      <p>Maqolalarni yuklashda xatolik yuz berdi. Iltimos keyinroq qayta urinib ko'ring.</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="posts.length === 0" class="text-center py-20 text-slate-500 font-medium">
      <p>Hozircha maqolalar chop etilmagan.</p>
    </div>

    <!-- Blog Posts Grid -->
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <NuxtLink 
          v-for="(post, index) in paginatedPosts" 
          :key="post._id"
          :to="`/blog/${post.slug}`"
        class="bg-white border border-brand-border hover:border-brand-accent/50 transition-all duration-300 rounded-3xl flex flex-col justify-between group shadow-xl shadow-brand-primary/5 hover:shadow-2xl relative overflow-hidden focus:outline-none animate-slide-up"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div>
          <!-- Image -->
          <div class="relative h-56 w-full bg-slate-100 overflow-hidden">
            <img 
              v-if="post.image" 
              :src="`${post.image}`" 
              :alt="post.title" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div v-else class="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400 font-medium">
              🖼 Rasm mavjud emas
            </div>
            
            <!-- Views badge -->
            <span class="absolute bottom-4 right-4 text-xs font-bold bg-white/90 text-brand-primary py-1.5 px-3 rounded-lg backdrop-blur-md shadow-sm border border-brand-border/50">
              👁 {{ post.views }}
            </span>
          </div>

          <!-- Content Padding -->
          <div class="p-6 sm:p-8">
            <!-- Tags -->
            <div class="flex flex-wrap gap-2 mb-4">
              <span 
                v-for="tag in post.tags" 
                :key="tag"
                class="px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider bg-brand-accent/10 text-brand-primary"
              >
                {{ tag }}
              </span>
            </div>

            <!-- Title -->
            <h3 class="text-xl font-black text-brand-primary mb-4 group-hover:text-[#1A4B65] transition-colors duration-300 leading-snug">
              {{ post.title }}
            </h3>

            <!-- Excerpt -->
            <p class="text-sm text-slate-600 line-clamp-3 leading-relaxed font-medium mb-2">
              {{ post.excerpt || 'Qisqa tavsif berilmagan.' }}
            </p>
          </div>
        </div>

        <!-- Footer Info -->
        <div class="px-6 sm:px-8 pb-6 pt-5 border-t border-brand-border/60 mt-auto flex items-center justify-between text-xs font-bold text-slate-500">
          <span class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">✍️</span>
            {{ post.author }}
          </span>
          <span>{{ new Date(post.createdAt).toLocaleDateString('uz-UZ') }}</span>
        </div>
      </NuxtLink>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-12">
        <button 
          @click="currentPage > 1 && currentPage--" 
          :disabled="currentPage === 1"
          class="px-4 py-2 rounded-xl border border-brand-border bg-white text-brand-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 font-bold transition-colors"
        >
          Oldingi
        </button>
        
        <div class="flex items-center gap-1">
          <button 
            v-for="page in totalPages" 
            :key="page"
            @click="currentPage = page"
            :class="[
              'w-10 h-10 rounded-xl font-bold transition-all flex items-center justify-center',
              currentPage === page 
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                : 'border border-brand-border bg-white text-slate-600 hover:bg-slate-50'
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button 
          @click="currentPage < totalPages && currentPage++" 
          :disabled="currentPage === totalPages"
          class="px-4 py-2 rounded-xl border border-brand-border bg-white text-brand-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 font-bold transition-colors"
        >
          Keyingi
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

useHead({
  title: "Blog — ORZU EDU",
  meta: [
    { name: "description", content: "ORZU EDU o'quv markazining foydali maqolalari, IT sohasidagi yangiliklar va maslahatlari." }
  ]
});

const { data: blogData, pending, error } = await useFetch<any>("/api/v1/blog", {
  key: "public-blog-posts"
});

const posts = computed(() => blogData.value?.data?.posts ?? []);

// Pagination Logic
const currentPage = ref(1);
const itemsPerPage = 6;

const totalPages = computed(() => Math.ceil(posts.value.length / itemsPerPage));

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return posts.value.slice(start, start + itemsPerPage);
});
</script>
