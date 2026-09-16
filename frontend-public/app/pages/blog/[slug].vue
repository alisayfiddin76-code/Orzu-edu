<template>
  <div class="py-20 max-w-4xl mx-auto px-6 bg-brand-background min-h-screen">
    <!-- Back to blog list -->
    <div class="mb-8 animate-slide-up">
      <NuxtLink to="/blog" class="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-primary transition-colors bg-white px-4 py-2 rounded-full border border-brand-border shadow-sm hover:shadow-md">
        <span>←</span>
        <span>Barcha maqolalarga qaytish</span>
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center items-center py-20">
      <div class="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !post" class="text-center py-20 text-brand-danger font-bold">
      <p>Maqola topilmadi yoki yuklashda xato yuz berdi.</p>
    </div>

    <!-- Post Content -->
    <article v-else class="bg-white border border-brand-border rounded-3xl p-8 sm:p-12 shadow-2xl shadow-brand-primary/5 relative overflow-hidden animate-slide-up" style="animation-delay: 0.1s">
      <!-- Decorative Gradient -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

      <!-- Image header -->
      <div v-if="post.image" class="w-full h-80 sm:h-96 rounded-3xl overflow-hidden mb-10 shadow-lg border border-brand-border/50 relative">
        <img 
          :src="`${post.image}`" 
          :alt="post.title" 
          class="w-full h-full object-cover"
        />
      </div>

      <!-- Metadata -->
      <div class="flex flex-wrap gap-4 items-center justify-between text-xs font-bold text-slate-500 mb-8 border-b border-brand-border pb-6 relative z-10">
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-accent/10 text-brand-primary uppercase tracking-wider">
            <span class="w-4 h-4 rounded-full bg-brand-primary/10 flex items-center justify-center">✍️</span>
            {{ post.author }}
          </span>
          <span class="text-slate-300">•</span>
          <span>{{ new Date(post.createdAt).toLocaleDateString('uz-UZ') }}</span>
        </div>
        <div class="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-brand-border text-brand-primary">
          <span>👁</span>
          <span>{{ post.views }} ko'rishlar</span>
        </div>
      </div>

      <!-- Title -->
      <h1 class="text-3xl sm:text-5xl font-black text-brand-primary mb-8 leading-tight tracking-tight relative z-10">
        {{ post.title }}
      </h1>

      <!-- Tags -->
      <div class="flex flex-wrap gap-2 mb-10 relative z-10">
        <span 
          v-for="tag in post.tags" 
          :key="tag"
          class="px-3 py-1.5 rounded-full text-[10px] uppercase font-black tracking-wider bg-slate-100 text-brand-primary hover:bg-brand-accent/20 transition-colors cursor-default"
        >
          #{{ tag }}
        </span>
      </div>

      <!-- Main Body -->
      <div 
        class="prose prose-lg max-w-none text-brand-text leading-relaxed font-medium whitespace-pre-line relative z-10"
      >
        {{ post.content }}
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const slug = route.params.slug;

const { data: postData, pending, error } = await useFetch<any>(`/api/v1/blog/${slug}`, {
  key: `blog-post-${slug}`
});

const post = computed(() => postData.value?.data?.post);

useHead({
  title: computed(() => post.value ? `${post.value.title} — ORZU EDU` : "Blog — ORZU EDU"),
  meta: [
    { name: "description", content: computed(() => post.value?.excerpt || "Blog maqolasi batafsil o'qish sahifasi.") }
  ]
});
</script>

<style>
/* Style whitespace-pre-line content to look neat */
.prose p {
  margin-bottom: 1.5rem;
  color: #334155; /* slate-700 */
}
</style>
