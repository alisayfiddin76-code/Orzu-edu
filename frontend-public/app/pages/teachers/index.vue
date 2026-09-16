<template>
  <div class="py-20 max-w-7xl mx-auto px-6 bg-brand-background min-h-screen">
    <!-- Header -->
    <div class="text-center mb-16 animate-slide-up">
      <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-brand-accent/20 border border-brand-accent text-brand-primary mb-6 shadow-sm">
        👨‍🏫 Bizning Ekspertlar
      </span>
      <h1 class="text-4xl sm:text-5xl font-black text-brand-primary tracking-tight">
        Tajribali <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">O'qituvchilarimiz</span>
      </h1>
      <p class="text-slate-600 mt-6 max-w-2xl mx-auto text-base font-medium leading-relaxed">
        O'z sohasining ustalari va xalqaro sertifikat egalari bo'lgan jamoamiz bilan tanishing.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center items-center py-20">
      <div class="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-20 text-brand-danger font-bold">
      <p>O'qituvchilar ma'lumotlarini yuklashda xatolik yuz berdi. Iltimos keyinroq qayta urinib ko'ring.</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="teachers.length === 0" class="text-center py-20 text-slate-500 font-medium">
      <p>Hozircha o'qituvchilar ro'yxati bo'sh.</p>
    </div>

    <div v-else>
      <!-- Filters -->
      <div class="flex flex-wrap justify-center gap-3 mb-12">
        <button 
          v-for="cat in dynamicCategories" 
          :key="cat" 
          @click="activeCategory = cat"
          :class="[
            'px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300',
            activeCategory === cat 
              ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
              : 'bg-white text-slate-600 border border-brand-border hover:bg-slate-50 hover:text-brand-primary'
          ]"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Teachers Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div 
          v-for="teacher in paginatedTeachers" 
          :key="teacher._id"
          class="bg-white rounded-3xl border border-brand-border overflow-hidden hover:border-brand-accent/50 hover:shadow-2xl transition-all duration-300 group flex flex-col shadow-xl shadow-brand-primary/5"
        >
          <!-- Card Head -->
          <div class="relative h-64 bg-brand-primary overflow-hidden">
            <img 
              :src="teacher.avatar ? `${teacher.avatar}` : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300&h=400'" 
              :alt="teacher.firstname" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
            />
            <!-- Score Badge -->
            <div v-if="teacher.score" class="absolute top-4 right-4 bg-brand-primary/80 backdrop-blur-md border border-brand-accent/50 rounded-xl px-3 py-1.5 text-center shadow-lg">
              <span class="block text-[9px] font-black text-brand-accent uppercase tracking-wider">{{ teacher.scoreType || 'Natija' }}</span>
              <span class="block text-lg font-black text-white">{{ teacher.score }}</span>
            </div>
            <!-- Subject Overlay -->
            <div v-if="teacher.subject" class="absolute bottom-4 left-4 bg-brand-accent text-brand-primary px-3 py-1.5 rounded-lg text-xs font-black shadow-lg">
              {{ teacher.subject }}
            </div>
          </div>

          <!-- Card Body -->
          <div class="p-6 flex flex-col flex-grow">
            <h3 class="text-xl font-black text-brand-primary mb-2">{{ teacher.firstname }} {{ teacher.lastname }}</h3>
            <div v-if="teacher.education" class="flex items-center gap-2 text-xs font-bold text-slate-500 mb-4">
              <span class="text-brand-accent">🎓</span>
              {{ teacher.education }}
            </div>
            <p class="text-sm text-slate-600 font-medium leading-relaxed line-clamp-3 mb-6 flex-grow">
              {{ teacher.bio }}
            </p>

            <div class="flex justify-between items-center pt-4 border-t border-brand-border/60 mb-6">
              <div v-if="teacher.experience" class="flex flex-col">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tajriba</span>
                <span class="text-sm font-black text-brand-primary">{{ teacher.experience }} yil</span>
              </div>
              <div v-if="teacher.studentsCount" class="flex flex-col text-right">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">O'quvchilar</span>
                <span class="text-sm font-black text-brand-primary">{{ teacher.studentsCount }}</span>
              </div>
            </div>

            <NuxtLink to="/register" class="w-full block text-center bg-brand-primary hover:bg-brand-secondary text-white font-bold text-sm py-3 rounded-xl transition-colors mt-auto">
              Ro'yxatdan o'tish
            </NuxtLink>
          </div>
        </div>
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
import { ref, computed, watch } from 'vue'

useHead({
  title: "O'qituvchilarimiz — ORZU EDU",
  meta: [
    { name: "description", content: "ORZU EDU o'quv markazining tajribali va malakali o'qituvchilar jamoasi bilan tanishing." }
  ]
})

const activeCategory = ref('Barchasi')

// Backenddan ma'lumotlarni olish
const { data: teachersData, pending, error } = await useFetch<any>("/api/v1/teachers/public", {
  key: "public-teachers"
});

const teachers = computed(() => teachersData.value?.data?.teachers ?? []);

// Fetch courses for dynamic subjects
const { data: coursesData } = await useFetch<any>("/api/v1/courses", {
  key: "public-courses-teachers"
});

const dynamicCategories = computed(() => {
  // 1. Get courses from API
  const courseTitles = (coursesData.value?.data?.courses || []).map((c: any) => c.title);
  // 2. Get subjects currently assigned to teachers
  const teacherSubjects = teachers.value.map((t: any) => t.subject).filter(Boolean);
  // 3. Merge unique values
  const allSubjects = [...new Set([...courseTitles, ...teacherSubjects])];
  return ['Barchasi', ...allSubjects];
});

const filteredTeachers = computed(() => {
  if (activeCategory.value === 'Barchasi') return teachers.value;
  const targetCategory = activeCategory.value.toLowerCase().trim();
  return teachers.value.filter((t: any) => 
    t.subject && t.subject.toLowerCase().trim() === targetCategory
  );
});

// Pagination Logic
const currentPage = ref(1);
const itemsPerPage = 6;

const totalPages = computed(() => Math.ceil(filteredTeachers.value.length / itemsPerPage));

const paginatedTeachers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredTeachers.value.slice(start, start + itemsPerPage);
});

// Reset page when category changes
// Reset page when category changes
watch(activeCategory, () => {
  currentPage.value = 1;
});
</script>

<style scoped>
/* Clear Vite CSS cache */
</style>
