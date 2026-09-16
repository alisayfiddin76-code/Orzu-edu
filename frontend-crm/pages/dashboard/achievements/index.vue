<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">🏆 Natijalar va Sertifikatlar</h1>
        <p class="text-sm text-slate-400 mt-1">Bitiruvchi o'quvchilar yutuqlari hamda sertifikatlarini boshqarish</p>
      </div>
      <button
        class="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
        @click="openCreateModal"
      >
        + Yangi Natija Qo'shish
      </button>
    </div>

    <!-- Alerts -->
    <div v-if="successMessage" class="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
      ✅ {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      ❌ {{ errorMessage }}
    </div>

    <!-- Table list -->
    <div v-if="loading" class="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
      <div class="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-slate-400">Natijalar yuklanmoqda...</p>
    </div>

    <div v-else-if="achievements.length === 0" class="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80 text-slate-400">
      Hech qanday o'quvchi natijasi topilmadi. Yangi natija qo'shing.
    </div>

    <div v-else class="rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm text-slate-300">
          <thead class="bg-slate-950/80 text-slate-400 font-semibold uppercase text-xs border-b border-slate-800">
            <tr>
              <th class="px-6 py-4">Sertifikat</th>
              <th class="px-6 py-4">O'quvchi Ismi</th>
              <th class="px-6 py-4">Kurs / Yo'nalish</th>
              <th class="px-6 py-4">Yil</th>
              <th class="px-6 py-4">Tartib raqami</th>
              <th class="px-6 py-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800 bg-slate-900/10">
            <tr v-for="ach in achievements" :key="ach._id" class="hover:bg-slate-800/30 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <img 
                  v-if="ach.certificateImage" 
                  :src="`${ach.certificateImage}`" 
                  class="w-12 h-16 object-cover rounded bg-slate-950 border border-slate-800"
                />
                <div v-else class="w-12 h-16 rounded bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] text-slate-600">
                  Rasm yo'q
                </div>
              </td>
              <td class="px-6 py-4 font-bold text-white">{{ ach.studentName }}</td>
              <td class="px-6 py-4">{{ ach.course }}</td>
              <td class="px-6 py-4">{{ ach.year }}</td>
              <td class="px-6 py-4">{{ ach.order || 0 }}</td>
              <td class="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                <button
                  class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                  @click="openEditModal(ach)"
                >
                  Tahrirlash
                </button>
                <button
                  class="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg border border-rose-500/20 transition-colors"
                  @click="deleteAchievement(ach._id)"
                >
                  O'chirish
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div 
      v-if="isModalOpen" 
      class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative">
        <h3 class="text-xl font-bold text-white mb-6">
          {{ isEditMode ? 'Natijani Tahrirlash' : 'Yangi Natija Qo\'shish' }}
        </h3>

        <form @submit.prevent="submitForm" class="space-y-5">
          <!-- Student Name -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">O'quvchi Ism-Familiyasi *</label>
            <input 
              v-model="form.studentName" 
              type="text" 
              required
              placeholder="Masalan: Asadbek Ma'rufov"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <!-- Course -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Kurs / Yo'nalish Nomi *</label>
            <input 
              v-model="form.course" 
              type="text" 
              required
              placeholder="Masalan: IELTS 8.0 yoki Node.js"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <!-- Image upload -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sertifikat / Natija Rasmi *</label>
            <input 
              type="file" 
              accept="image/*"
              :required="!isEditMode"
              @change="handleFileUpload"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 transition-colors"
            />
            <p v-if="isEditMode && form.certificateImage" class="text-xs text-slate-500 mt-2">
              Joriy rasm: <a :href="`${form.certificateImage}`" target="_blank" class="text-indigo-400 underline">Ko'rish</a>
            </p>
          </div>

          <!-- Year & Order -->
          <div class="grid grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Yil</label>
              <input 
                v-model.number="form.year" 
                type="number" 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ko'rsatish Tartibi</label>
              <input 
                v-model.number="form.order" 
                type="number" 
                placeholder="masalan: 0, 1, 2"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Natija haqida qisqa izoh</label>
            <textarea 
              v-model="form.description" 
              rows="3" 
              placeholder="Masalan: IELTS imtihonidan 8.0 ball to'pladi..."
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            ></textarea>
          </div>

          <!-- Footer Actions -->
          <div class="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2.5 rounded-xl border border-slate-700 transition-colors text-sm font-semibold"
              @click="closeModal"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-6 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold flex items-center gap-2"
            >
              <span v-if="submitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ submitting ? "Saqlanmoqda..." : "Saqlash" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

definePageMeta({
  layout: 'admin'
});

const achievements = ref<any[]>([]);
const loading = ref(false);
const submitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const isModalOpen = ref(false);
const isEditMode = ref(false);
const currentId = ref('');
const selectedFile = ref<File | null>(null);

const form = reactive({
  studentName: '',
  course: '',
  description: '',
  year: new Date().getFullYear(),
  order: 0,
  certificateImage: ''
});

const fetchAchievements = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response: any = await $fetch("/api/v1/achievements");
    achievements.value = response.data.achievements || [];
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Natijalarni yuklashda xatolik yuz berdi';
  } finally {
    loading.value = false;
  }
};

const handleFileUpload = (e: any) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
  }
};

const openCreateModal = () => {
  isEditMode.value = false;
  currentId.value = '';
  selectedFile.value = null;
  form.studentName = '';
  form.course = '';
  form.description = '';
  form.year = new Date().getFullYear();
  form.order = 0;
  form.certificateImage = '';
  isModalOpen.value = true;
};

const openEditModal = (ach: any) => {
  isEditMode.value = true;
  currentId.value = ach._id;
  selectedFile.value = null;
  form.studentName = ach.studentName;
  form.course = ach.course;
  form.description = ach.description || '';
  form.year = ach.year;
  form.order = ach.order || 0;
  form.certificateImage = ach.certificateImage || '';
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const submitForm = async () => {
  submitting.value = true;
  errorMessage.value = '';
  
  try {
    const token = useCookie("auth_token");
    const formData = new FormData();
    formData.append('studentName', form.studentName);
    formData.append('course', form.course);
    formData.append('description', form.description);
    formData.append('year', String(form.year));
    formData.append('order', String(form.order));

    if (selectedFile.value) {
      formData.append('certificateImage', selectedFile.value);
    }

    const url = isEditMode.value 
      ? `/api/v1/achievements/${currentId.value}`
      : '/api/v1/achievements';
      
    const method = isEditMode.value ? 'PATCH' : 'POST';

    await $fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: formData
    });

    successMessage.value = isEditMode.value 
      ? 'Natija muvaffaqiyatli tahrirlandi!'
      : 'Natija muvaffaqiyatli qo\'shildi!';
      
    closeModal();
    await fetchAchievements();
    setTimeout(() => { successMessage.value = ''; }, 3000);
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Natijani saqlashda xatolik yuz berdi';
  } finally {
    submitting.value = false;
  }
};

const deleteAchievement = async (id: string) => {
  if (!confirm("Haqiqatdan ham bu natijani o'chirmoqchisiz?")) return;
  errorMessage.value = '';
  try {
    const token = useCookie("auth_token");
    await $fetch(`/api/v1/achievements/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });
    successMessage.value = 'Natija muvaffaqiyatli o\'chirildi!';
    await fetchAchievements();
    setTimeout(() => { successMessage.value = ''; }, 3000);
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'O\'chirishda xatolik yuz berdi';
  }
};

onMounted(() => {
  fetchAchievements();
});
</script>
