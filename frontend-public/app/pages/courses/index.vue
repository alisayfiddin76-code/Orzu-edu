<template>
  <div class="py-20 max-w-7xl mx-auto px-6 bg-brand-background min-h-screen">
    <!-- Header -->
    <div class="text-center mb-16 animate-slide-up">
      <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-brand-accent/20 border border-brand-accent text-brand-primary mb-6 shadow-sm">
        📚 Bilim va Ko'nikma
      </span>
      <h1 class="text-4xl sm:text-5xl font-black text-brand-primary tracking-tight">
        Bizning Professional <br />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">Kurslarimiz</span>
      </h1>
      <p class="text-slate-600 mt-6 max-w-2xl mx-auto text-base font-medium leading-relaxed">
        O'zingizga mos keladigan zamonaviy yo'nalishni tanlang va soha mutaxassislaridan ta'lim olishni boshlang.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center items-center py-20">
      <div class="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-20 text-brand-danger font-bold">
      <p>Kurslarni yuklashda xatolik yuz berdi. Iltimos keyinroq qayta urinib ko'ring.</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="courses.length === 0" class="text-center py-20 text-slate-500 font-medium">
      <p>Hozircha kurslar mavjud emas.</p>
    </div>

    <!-- Courses Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div 
        v-for="(course, index) in courses" 
        :key="course._id"
        class="bg-white border border-brand-border hover:border-brand-accent/50 transition-all duration-300 rounded-3xl p-8 flex flex-col justify-between group shadow-xl shadow-brand-primary/5 hover:shadow-2xl relative overflow-hidden animate-slide-up"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <!-- Card Background Gradient -->
        <div class="absolute -right-12 -top-12 w-32 h-32 bg-brand-accent/10 rounded-full blur-3xl group-hover:bg-brand-accent/20 transition-colors duration-500 pointer-events-none"></div>

        <div>
          <span class="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-brand-primary mb-6 uppercase tracking-wider">
            Kurs
          </span>
          <h3 class="text-2xl font-black text-brand-primary mb-4 group-hover:text-[#1A4B65] transition-colors duration-300">
            {{ course.title }}
          </h3>
          <p class="text-sm text-slate-600 mb-8 line-clamp-3 leading-relaxed font-medium">
            {{ course.description }}
          </p>
        </div>

        <div class="mt-auto">
          <!-- Stats/Meta -->
          <div class="flex items-center justify-between py-5 border-t border-brand-border/60 mb-6 text-sm font-medium text-slate-500">
            <div class="flex items-center gap-2">
              <span class="text-lg">⏱</span>
              <span>{{ course.duration }}</span>
            </div>
            <div class="font-bold text-brand-primary text-base">
              {{ Number(course.price).toLocaleString() }} UZS
            </div>
          </div>

          <!-- Register button -->
          <NuxtLink 
            :to="`/register?course=${encodeURIComponent(course.title)}`"
            class="w-full inline-flex items-center justify-center text-sm font-bold text-brand-primary bg-slate-50 border border-brand-border group-hover:bg-brand-primary group-hover:text-white group-hover:border-transparent py-4 rounded-xl transition-all duration-300 shadow-sm"
          >
            Ro'yxatdan o'tish
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

useHead({
  title: "Kurslarimiz — ORZU EDU",
  meta: [
    { name: "description", content: "ORZU EDU o'quv markazida mavjud barcha zamonaviy IT, xorijiy tillar va maktab fanlari kurslari ro'yxati." }
  ]
});

const { data: coursesData, pending, error } = await useFetch<any>("/api/v1/courses", {
  key: "public-courses"
});

const courses = computed(() => coursesData.value?.data?.courses ?? []);
</script>
