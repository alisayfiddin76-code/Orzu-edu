<template>
  <div class="bg-brand-background text-brand-textPrimary min-h-screen">

    <!-- ═══════════════════════════════════ HERO ═══════════════════════════════════ -->
    <section class="relative overflow-hidden bg-gradient-to-br from-[#06263B] via-[#082F49] to-[#0C3E63] rounded-b-[2%] sm:rounded-b-none"
      style="padding-top: calc(64px + 24px); padding-bottom: 48px;">
      <!-- Glow blobs -->
      <div class="absolute -top-32 -right-32 w-72 h-72 md:w-[500px] md:h-[500px] bg-brand-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute -bottom-32 -left-32 w-72 h-72 md:w-[500px] md:h-[500px] bg-[#0C3E63]/60 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-5 relative z-10">

        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-accent/10 border border-brand-accent/25 text-xs font-bold text-brand-accent mb-5">
          <span class="w-2 h-2 rounded-full bg-brand-accent animate-pulse shadow-[0_0_8px_rgba(242,194,48,0.8)]"></span>
          Premium Ta'lim Platformasi
        </div>

        <!-- Title -->
        <h1 class="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-5">
          Kelajak kasblarini <br>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#D9A404] via-[#F2C230] to-[#FFD34D]">ORZU EDU</span> da<br>
          o'rganing
        </h1>

        <!-- Subtitle -->
        <p class="text-base sm:text-lg text-[#94B0C7] font-medium max-w-lg leading-relaxed mb-7">
          Dasturlash, xorijiy tillar va maktab fanlari bo'yicha eng kuchli ustozlardan premium sifatdagi ta'lim oling.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 mb-8">
          <NuxtLink to="/courses"
            class="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-brand-accent text-[#06263B] font-black text-sm shadow-[0_4px_20px_rgba(242,194,48,0.4)] hover:bg-[#FFD34D] hover:-translate-y-0.5 transition-all duration-300">
            🎓 Kurslarni ko'rish
          </NuxtLink>
          <NuxtLink to="/register"
            class="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/20 hover:-translate-y-0.5 transition-all duration-300">
            👤 Ro'yxatdan o'tish
          </NuxtLink>
        </div>

        <!-- Stats Grid 2x2 Mobile — Real Data -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div class="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
            <div class="text-2xl font-black text-brand-accent mb-1">
              <span v-if="statsData">{{ statsData.studentCount }}+</span>
              <span v-else class="animate-pulse">—</span>
            </div>
            <div class="text-xs font-bold text-[#94B0C7] uppercase tracking-wider">Faol o'quvchi</div>
          </div>
          <div class="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
            <div class="text-2xl font-black text-brand-accent mb-1">
              <span v-if="statsData">{{ statsData.teacherCount }}+</span>
              <span v-else class="animate-pulse">—</span>
            </div>
            <div class="text-xs font-bold text-[#94B0C7] uppercase tracking-wider">Malakali ustoz</div>
          </div>
          <div class="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
            <div class="text-2xl font-black text-brand-accent mb-1">
              <span v-if="statsData">{{ statsData.courseCount }}</span>
              <span v-else class="animate-pulse">—</span>
            </div>
            <div class="text-xs font-bold text-[#94B0C7] uppercase tracking-wider">Kurslar</div>
          </div>
          <div class="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
            <div class="text-2xl font-black text-brand-accent mb-1">
              <span v-if="statsData">{{ statsData.achievementCount }}</span>
              <span v-else class="animate-pulse">—</span>
            </div>
            <div class="text-xs font-bold text-[#94B0C7] uppercase tracking-wider">Yutuqlar</div>
          </div>
        </div>

        <!-- Oyning eng yaxshi o'quvchisi — Mobile Hero Card -->
        <ClientOnly>
          <div v-if="studentOfMonth"
            class="relative bg-white/8 backdrop-blur-xl border border-brand-accent/30 rounded-3xl p-5 flex items-center gap-4 shadow-[0_0_30px_rgba(242,194,48,0.1)]">
            <!-- Gold badge top -->
            <div class="absolute -top-3 left-5 bg-brand-accent text-[#06263B] font-black text-[10px] px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">
              ⭐ Oyning eng yaxshi o'quvchisi
            </div>
            <!-- Avatar -->
            <div class="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-brand-accent/50 overflow-hidden bg-brand-accent/20 flex items-center justify-center text-2xl font-black text-brand-accent mt-2">
              <img v-if="studentOfMonth.image" :src="studentOfMonth.image" :alt="studentOfMonth.name"
                class="w-full h-full object-cover" />
              <span v-else>{{ studentOfMonth.name[0] }}</span>
            </div>
            <!-- Info -->
            <div class="flex-1 min-w-0 mt-2">
              <h3 class="text-white font-black text-base sm:text-lg leading-tight truncate">{{ studentOfMonth.name }}</h3>
              <p class="text-brand-accent text-xs font-bold uppercase tracking-wider mt-0.5">{{ studentOfMonth.subject }}</p>
              <p class="text-[#94B0C7] text-xs mt-1.5 line-clamp-2 italic">"{{ studentOfMonth.reason }}"</p>
            </div>
          </div>
        </ClientOnly>

      </div>
    </section>

    <!-- ═══════════════════════════════ MASHHUR KURSLAR ══════════════════════════════ -->
    <section id="courses" class="py-10 sm:py-16 bg-brand-background">
      <div class="max-w-7xl mx-auto">
        <!-- Section Header -->
        <div class="flex items-center justify-between px-5 mb-5" data-ao="fade-up" data-ao-duration="600">
          <div>
            <h2 class="text-xl sm:text-3xl font-black text-brand-primary">Mashhur kurslar</h2>
            <p class="text-brand-textSecondary text-sm mt-1">Eng ko'p talab qilinadigan yo'nalishlar</p>
          </div>
          <NuxtLink to="/courses" class="text-sm font-bold text-brand-accent hover:underline flex items-center gap-1 shrink-0">
            Barchasini ko'rish →
          </NuxtLink>
        </div>

        <!-- Loading -->
        <div v-if="!popularCourses.length" class="px-5 text-brand-textSecondary text-sm">Yuklanmoqda...</div>

        <!-- Horizontal Scroll on Mobile, Grid on Desktop -->
        <div class="flex gap-4 overflow-x-auto px-5 pb-4 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0">
          <NuxtLink
            v-for="(course, i) in popularCourses"
            :key="course._id"
            :to="`/register?course=${encodeURIComponent(course.title)}`"
            class="flex-none w-[200px] sm:w-auto snap-start bg-white rounded-2xl border border-brand-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col"
            data-ao="fade-up"
            :data-ao-delay="String(i * 100)"
            data-ao-duration="600"
          >
            <!-- Colored Top Bar -->
            <div class="h-1.5 w-full rounded-t-2xl" :style="`background: ${course.color || '#F2C230'}`"></div>
            <div class="p-5 flex flex-col h-full">
              <!-- Icon -->
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 shadow-sm"
                :style="`background: ${(course.color || '#F2C230') + '18'}`">
                {{ course.icon || '📚' }}
              </div>
              <!-- Title -->
              <h3 class="text-sm sm:text-base font-black text-brand-primary mb-1 leading-snug">{{ course.title }}</h3>
              <!-- Subtitle -->
              <p class="text-xs text-brand-textSecondary line-clamp-2 mb-3 flex-grow">{{ course.description }}</p>
              <!-- Footer -->
              <div class="flex items-center justify-between border-t border-brand-border/60 pt-3 mt-auto">
                <span class="text-[10px] font-bold text-brand-textSecondary bg-brand-background px-2 py-1 rounded-lg border border-brand-border">
                  {{ course.duration }}
                </span>
                <span class="text-xs font-black text-brand-accent group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════ USTOZLAR ══════════════════════════════ -->
    <section class="py-10 sm:py-16 bg-gradient-to-br from-[#06263B] via-[#082F49] to-[#0C3E63] rounded-b-[2%] sm:rounded-b-none">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="px-5 mb-6 flex items-center justify-between" data-ao="fade-up" data-ao-duration="600">
          <div>
            <h2 class="text-xl sm:text-3xl font-black text-white">Tajribali Ustozlar</h2>
            <p class="text-[#94B0C7] text-sm mt-1">Sizning muvaffaqiyatingiz kafolati</p>
          </div>
          <NuxtLink to="/teachers" class="text-sm font-bold text-brand-accent hover:underline shrink-0">
            Barchasi →
          </NuxtLink>
        </div>

        <div v-if="!topTeachers.length" class="px-5 text-white/50 text-sm">Yuklanmoqda...</div>

        <!-- Horizontal scroll mobile -->
        <div class="flex gap-4 overflow-x-auto px-5 pb-4 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0">
          <div
            v-for="(teacher, i) in topTeachers"
            :key="teacher._id"
            class="flex-none w-[200px] sm:w-auto snap-start bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-brand-accent/40 hover:-translate-y-1 transition-all duration-300 group flex flex-col"
            data-ao="fade-up"
            :data-ao-delay="String(i * 100)"
            data-ao-duration="700"
          >
            <!-- Photo -->
            <div class="relative h-48 sm:h-56 overflow-hidden bg-[#06263B]">
              <img
                :src="teacher.avatar ? teacher.avatar : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300&h=400'"
                :alt="teacher.firstname"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div v-if="teacher.subject" class="absolute bottom-3 left-3 bg-brand-accent text-[#06263B] px-2.5 py-1 rounded-lg text-[11px] font-black shadow">
                {{ teacher.subject }}
              </div>
              <div v-if="teacher.score" class="absolute top-3 right-3 bg-[#06263B]/80 border border-brand-accent/50 rounded-xl px-2 py-1 text-center">
                <span class="block text-[9px] font-black text-brand-accent uppercase">{{ teacher.scoreType || 'Natija' }}</span>
                <span class="block text-sm font-black text-white">{{ teacher.score }}</span>
              </div>
            </div>
            <!-- Body -->
            <div class="p-4 flex flex-col flex-grow">
              <h3 class="text-sm font-black text-white mb-1">{{ teacher.firstname }} {{ teacher.lastname }}</h3>
              <p class="text-xs text-[#94B0C7] line-clamp-2 flex-grow">{{ teacher.bio }}</p>
              <NuxtLink to="/register" class="mt-3 block text-center bg-brand-accent hover:bg-[#FFD34D] text-[#06263B] font-black text-xs py-2.5 rounded-xl transition-all">
                Ro'yxatdan o'tish
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════ NATIJALAR ══════════════════════════════ -->
    <section class="py-10 sm:py-16 bg-brand-background">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="px-5 mb-6 flex items-center justify-between" data-ao="fade-up" data-ao-duration="600">
          <div>
            <h2 class="text-xl sm:text-3xl font-black text-brand-primary">O'quvchilar Natijalari</h2>
            <p class="text-brand-textSecondary text-sm mt-1">Bizning faxrimiz bo'lgan yoshlar</p>
          </div>
          <NuxtLink to="/results" class="text-sm font-bold text-brand-accent hover:underline shrink-0">
            Barchasi →
          </NuxtLink>
        </div>

        <div v-if="!topAchievements.length" class="px-5 text-brand-textSecondary text-sm">Yuklanmoqda...</div>

        <!-- Scroll on Mobile -->
        <div class="flex gap-4 overflow-x-auto px-5 pb-4 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0">
          <NuxtLink
            v-for="(ach, i) in topAchievements"
            :key="ach._id"
            :to="`/results/${ach._id}`"
            class="flex-none w-[240px] sm:w-auto snap-start bg-white border border-brand-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
            data-ao="zoom-in"
            :data-ao-delay="String(i * 100)"
            data-ao-duration="600"
          >
            <div class="relative h-40 sm:h-48 overflow-hidden bg-brand-background">
              <img v-if="ach.certificateImage" :src="ach.certificateImage" :alt="ach.studentName"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div v-else class="w-full h-full flex items-center justify-center text-slate-300 text-4xl">🖼</div>
              <span class="absolute bottom-3 right-3 text-[10px] font-bold bg-white/90 text-brand-primary py-1 px-2.5 rounded-lg shadow">
                📅 {{ ach.year }} yil
              </span>
            </div>
            <div class="p-4 flex flex-col flex-grow">
              <span class="text-[10px] font-black uppercase tracking-wider bg-brand-accent/10 text-brand-primary px-2 py-1 rounded-full inline-block mb-2 w-fit">
                {{ ach.course }}
              </span>
              <h3 class="text-sm font-black text-brand-primary mb-2 leading-snug">{{ ach.studentName }}</h3>
              <p class="text-xs text-slate-500 line-clamp-2 flex-grow">{{ ach.description || "O'quvchimizning ajoyib natijalaridan biri." }}</p>
              <div class="mt-3 text-xs font-bold text-brand-accent group-hover:translate-x-1 transition-transform">
                Batafsil →
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════ HAMKOR UNIVERSITETLAR ══════════════════════════════ -->
    <section class="py-10 sm:py-16 bg-gradient-to-br from-[#06263B] via-[#082F49] to-[#0C3E63] overflow-hidden rounded-b-[2%] sm:rounded-b-none">
      <div class="max-w-7xl mx-auto px-5 relative z-10">
        <div class="text-center mb-8" data-ao="fade-up" data-ao-duration="600">
          <h2 class="text-xl sm:text-4xl font-black text-brand-accent mb-2">Hamkor Universitetlar</h2>
          <p class="text-[#94B0C7] text-sm sm:text-base">Bizga ishonch bildirgan nufuzli muassasalar</p>
        </div>

        <div v-if="!partners.length" class="text-center text-white/50 text-sm">Yuklanmoqda...</div>

        <div v-else class="flex gap-4 overflow-x-auto px-5 pb-8 pt-4 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0 sm:pt-4">
          <a
            v-for="(partner, i) in partners"
            :key="partner._id"
            :href="partner.website || '#'"
            target="_blank"
            rel="noopener noreferrer"
            class="flex-none w-[280px] sm:w-auto snap-start group relative rounded-2xl border border-white/10 bg-[#0a2b42]/80 backdrop-blur-sm overflow-hidden hover:border-brand-accent/50 transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-[0_10px_30px_-5px_rgba(242,194,48,0.2)] flex flex-col"
            data-ao="fade-up"
            :data-ao-delay="String(i * 100)"
            data-ao-duration="600"
          >
            <!-- Top glow line on hover -->
            <div class="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-brand-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <!-- Hover overlay -->
            <div class="absolute inset-0 bg-[#06263B]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>

            <!-- Card Top: Logo + Name -->
            <div class="relative p-6 flex items-center gap-4 border-b border-white/5">
              <!-- Logo -->
              <div class="w-16 h-16 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-brand-accent/30 transition-all duration-300">
                <img 
                  v-if="partner.logo" 
                  :src="partner.logo" 
                  :alt="partner.name"
                  class="max-w-[80%] max-h-[80%] object-contain filter brightness-110"
                />
                <span v-else class="text-xl font-black text-brand-accent">
                  {{ partner.name?.substring(0, 2)?.toUpperCase() }}
                </span>
              </div>
              <!-- Title -->
              <div class="flex-1 min-w-0">
                <h3 class="text-white font-bold text-base leading-snug group-hover:text-brand-accent transition-colors duration-300 truncate">
                  {{ partner.name }}
                </h3>
                <p v-if="partner.country" class="text-[#94B0C7] text-xs mt-1 flex items-center gap-1">
                  🌍 {{ partner.country }}
                </p>
              </div>
            </div>

            <!-- Card Body: About -->
            <div class="relative p-6 flex flex-col gap-4 flex-1">
              <p v-if="partner.about" class="text-[#94B0C7] text-sm leading-relaxed line-clamp-3">
                {{ partner.about }}
              </p>
              <p v-else class="text-[#94B0C7]/50 text-sm italic">Qo'shimcha ma'lumot mavjud emas</p>

              <!-- Info badges -->
              <div class="flex flex-wrap gap-2 mt-auto">
                <span v-if="partner.visaScore" class="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                  📊 {{ partner.visaScore }}
                </span>
                <span v-if="partner.visaCountry" class="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  🛂 {{ partner.visaCountry }}
                </span>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="relative px-6 py-3 bg-[#06263B]/80 border-t border-white/5 flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span class="text-[10px] text-emerald-400/80 uppercase tracking-widest font-bold">Hamkor</span>
              </div>
              <span class="text-xs text-brand-accent font-bold group-hover:translate-x-0.5 transition-transform duration-300 flex items-center gap-1">
                Veb-sayt
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════ BLOG ══════════════════════════════ -->
    <section class="py-10 sm:py-16 bg-brand-background">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="px-5 mb-6 flex items-center justify-between" data-ao="fade-up" data-ao-duration="600">
          <div>
            <h2 class="text-xl sm:text-3xl font-black text-brand-primary">So'nggi Maqolalar</h2>
            <p class="text-brand-textSecondary text-sm mt-1">Ta'lim haqida qiziqarli blog</p>
          </div>
          <NuxtLink to="/blog" class="text-sm font-bold text-brand-accent hover:underline shrink-0">
            Barchasi →
          </NuxtLink>
        </div>

        <div v-if="!latestPosts.length" class="px-5 text-brand-textSecondary text-sm">Yuklanmoqda...</div>

        <div class="flex gap-4 overflow-x-auto px-5 pb-4 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0">
          <NuxtLink
            v-for="(post, i) in latestPosts"
            :key="post._id"
            :to="`/blog/${post.slug}`"
            class="flex-none w-[240px] sm:w-auto snap-start bg-white border border-brand-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
            data-ao="fade-up"
            :data-ao-delay="String(i * 100)"
            data-ao-duration="600"
          >
            <div class="relative h-40 overflow-hidden bg-brand-background">
              <img v-if="post.image" :src="post.image" :alt="post.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div v-else class="w-full h-full flex items-center justify-center text-slate-300 text-4xl">🖼</div>
              <span class="absolute bottom-3 right-3 text-[10px] font-bold bg-white/90 text-brand-primary py-1 px-2.5 rounded-lg shadow">
                👁 {{ post.views }}
              </span>
            </div>
            <div class="p-4 flex flex-col flex-grow">
              <div class="flex flex-wrap gap-1.5 mb-2">
                <span v-for="tag in (post.tags || []).slice(0,2)" :key="tag"
                  class="text-[10px] font-black uppercase tracking-wider bg-brand-accent/10 text-brand-primary px-2 py-0.5 rounded-full">
                  {{ tag }}
                </span>
              </div>
              <h3 class="text-sm font-black text-brand-primary mb-2 line-clamp-2 leading-snug">{{ post.title }}</h3>
              <p class="text-xs text-slate-500 line-clamp-2 flex-grow">{{ post.excerpt || '' }}</p>
              <div class="flex items-center justify-between mt-3 pt-3 border-t border-brand-border/60 text-[10px] text-slate-500 font-bold">
                <span>✍️ {{ post.author }}</span>
                <span>
                  {{ String(new Date(post.createdAt).getDate()).padStart(2, '0') }}.{{ String(new Date(post.createdAt).getMonth() + 1).padStart(2, '0') }}.{{ new Date(post.createdAt).getFullYear() }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

useHead({
  title: "ORZU EDU — Zamonaviy Ta'lim Platformasi",
  meta: [
    { name: "description", content: "ORZU EDU - IT va xorijiy tillarni o'qitish bo'yicha zamonaviy platforma." }
  ]
});

// ---- Stats (Real Data) ----
const { data: statsRaw } = await useFetch<any>("/api/v1/stats", { key: "home-stats" });
const statsData = computed(() => statsRaw.value?.data || null);
// ---- Fetch Data ----
const { data: coursesData } = await useFetch<any>("/api/v1/courses", { key: "home-courses" });
const popularCourses = computed(() => coursesData.value?.data?.courses?.slice(0, 6) ?? []);

const { data: teachersData } = await useFetch<any>("/api/v1/teachers/public", { key: "home-teachers" });
const topTeachers = computed(() => teachersData.value?.data?.teachers?.slice(0, 4) ?? []);

const { data: achievementsData } = await useFetch<any>("/api/v1/achievements", { key: "home-achievements" });
const topAchievements = computed(() => achievementsData.value?.data?.achievements?.slice(0, 4) ?? []);

const { data: blogData } = await useFetch<any>("/api/v1/blog", { key: "home-blog" });
const latestPosts = computed(() => blogData.value?.data?.posts?.slice(0, 4) ?? []);

const { data: partnersData } = await useFetch<any>("/api/v1/partners", { key: "home-partners" });
const partners = computed(() => partnersData.value?.data?.partners?.slice(0, 6) ?? []);

const { data: somData } = await useFetch<any>("/api/v1/student-of-month/active", { key: "home-som" });
const studentOfMonth = computed(() => somData.value?.data?.student || null);
</script>

<style>
html { scroll-behavior: smooth; }

/* Hide scrollbar but keep functionality */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>