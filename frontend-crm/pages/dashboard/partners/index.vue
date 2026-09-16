<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">🤝 Hamkorlarimiz Boshqaruvi</h1>
        <p class="text-sm text-slate-400 mt-1">Hamkor universitetlar va tashkilotlar ro'yxati</p>
      </div>
      <button
        class="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
        @click="openCreateModal"
      >
        + Yangi Hamkor Qo'shish
      </button>
    </div>

    <!-- Alerts -->
    <div v-if="successMessage" class="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
      ✅ {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      ❌ {{ errorMessage }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
      <div class="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-slate-400">Hamkorlar yuklanmoqda...</p>
    </div>

    <div v-else-if="partners.length === 0" class="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80 text-slate-400">
      Hamkorlar topilmadi. Yangi hamkor tashkilot qo'shing.
    </div>

    <div v-else class="rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm text-slate-300">
          <thead class="bg-slate-950/80 text-slate-400 font-semibold uppercase text-xs border-b border-slate-800">
            <tr>
              <th class="px-6 py-4">Logo</th>
              <th class="px-6 py-4">Hamkor Nomi</th>
              <th class="px-6 py-4">Davlat</th>
              <th class="px-6 py-4">Viza Bali</th>
              <th class="px-6 py-4">Viza Mamlakati</th>
              <th class="px-6 py-4">Veb-sayt</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800 bg-slate-900/10">
            <tr v-for="partner in partners" :key="partner._id" class="hover:bg-slate-800/30 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <img 
                  v-if="partner.logo" 
                  :src="`${partner.logo}`" 
                  class="w-16 h-12 object-contain rounded bg-slate-950 border border-slate-800 p-1"
                />
                <div v-else class="w-16 h-12 rounded bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] text-slate-600">
                  Logo yo'q
                </div>
              </td>
              <td class="px-6 py-4 font-bold text-white">{{ partner.name }}</td>
              <td class="px-6 py-4 text-slate-400">{{ partner.country || '—' }}</td>
              <td class="px-6 py-4">
                <span v-if="partner.visaScore" class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {{ partner.visaScore }} ball
                </span>
                <span v-else class="text-slate-600">—</span>
              </td>
              <td class="px-6 py-4 text-slate-400">{{ partner.visaCountry || '—' }}</td>
              <td class="px-6 py-4">
                <a 
                  v-if="partner.website" 
                  :href="partner.website" 
                  target="_blank" 
                  class="text-indigo-400 hover:underline truncate max-w-[150px] block"
                >
                  {{ partner.website }}
                </a>
                <span v-else class="text-slate-500">—</span>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider"
                  :class="partner.active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-rose-400 border border-rose-500/20'"
                >
                  {{ partner.active ? 'FAOL' : 'NOFAOL' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                <button
                  class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                  @click="openEditModal(partner)"
                >
                  Tahrirlash
                </button>
                <button
                  class="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg border border-rose-500/20 transition-colors"
                  @click="deletePartner(partner._id)"
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
      class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
    >
      <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative my-8">
        <h3 class="text-xl font-bold text-white mb-6">
          {{ isEditMode ? 'Hamkorni Tahrirlash' : 'Yangi Hamkor Qo\'shish' }}
        </h3>

        <form @submit.prevent="submitForm" class="space-y-5">
          <!-- Row 1: Name + Country -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Universitet Nomi *</label>
              <input 
                v-model="form.name" 
                type="text" 
                required
                placeholder="Masalan: Harvard University"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Davlat / Mamlakat</label>
              <input 
                v-model="form.country" 
                type="text"
                placeholder="Masalan: AQSh, Germaniya"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <!-- Row 2: Visa Score + Visa Country -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Viza Bali (IELTS/SAT va h.k.)</label>
              <input 
                v-model="form.visaScore" 
                type="text"
                placeholder="Masalan: IELTS 6.5 yoki 80+ ball"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Viza Beriladigan Mamlakat</label>
              <input 
                v-model="form.visaCountry" 
                type="text"
                placeholder="Masalan: Germaniya elchixonasi"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <!-- Website -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Rasmiy veb-sayti</label>
            <input 
              v-model="form.website" 
              type="url" 
              placeholder="Masalan: https://harvard.edu"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <!-- About -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Universitet Haqida (About)</label>
            <textarea 
              v-model="form.about"
              rows="4"
              placeholder="Universitet tarixi, afzalliklari, qabul talablari, grantlar haqida qisqacha ma'lumot..."
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            ></textarea>
          </div>

          <!-- Logo upload -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Logotip (Logo Image)</label>
            <input 
              type="file" 
              accept="image/*"
              @change="handleFileUpload"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 transition-colors"
            />
            <p v-if="isEditMode && form.logo" class="text-xs text-slate-500 mt-2">
              Joriy logo: <a :href="`${form.logo}`" target="_blank" class="text-indigo-400 underline">Ko'rish</a>
            </p>
          </div>

          <!-- Row: Order + Active -->
          <div class="grid grid-cols-2 gap-4 items-center">
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ko'rsatish Tartibi</label>
              <input 
                v-model.number="form.order" 
                type="number" 
                placeholder="0, 1, 2..."
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div class="flex items-center gap-3 mt-6">
              <input 
                v-model="form.active" 
                type="checkbox" 
                id="active" 
                class="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500"
              />
              <label for="active" class="text-sm text-slate-300 font-semibold select-none cursor-pointer">
                Saytda ko'rsatilsin (Active)
              </label>
            </div>
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

const partners = ref<any[]>([]);
const loading = ref(false);
const submitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const isModalOpen = ref(false);
const isEditMode = ref(false);
const currentId = ref('');
const selectedFile = ref<File | null>(null);

const form = reactive({
  name: '',
  country: '',
  website: '',
  visaScore: '',
  visaCountry: '',
  about: '',
  order: 0,
  active: true,
  logo: ''
});

const fetchPartners = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const token = useCookie("auth_token");
    const response: any = await $fetch("/api/v1/partners/admin/all", {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });
    partners.value = response.data.partners || [];
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Hamkorlarni yuklashda xatolik yuz berdi';
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
  form.name = '';
  form.country = '';
  form.website = '';
  form.visaScore = '';
  form.visaCountry = '';
  form.about = '';
  form.order = 0;
  form.active = true;
  form.logo = '';
  isModalOpen.value = true;
};

const openEditModal = (partner: any) => {
  isEditMode.value = true;
  currentId.value = partner._id;
  selectedFile.value = null;
  form.name = partner.name;
  form.country = partner.country || '';
  form.website = partner.website || '';
  form.visaScore = partner.visaScore || '';
  form.visaCountry = partner.visaCountry || '';
  form.about = partner.about || '';
  form.order = partner.order || 0;
  form.active = partner.active;
  form.logo = partner.logo || '';
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
    formData.append('name', form.name);
    formData.append('country', form.country);
    formData.append('website', form.website);
    formData.append('visaScore', form.visaScore);
    formData.append('visaCountry', form.visaCountry);
    formData.append('about', form.about);
    formData.append('order', String(form.order));
    formData.append('active', String(form.active));

    if (selectedFile.value) {
      formData.append('logo', selectedFile.value);
    }

    const url = isEditMode.value 
      ? `/api/v1/partners/${currentId.value}`
      : '/api/v1/partners';
      
    const method = isEditMode.value ? 'PATCH' : 'POST';

    await $fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: formData
    });

    successMessage.value = isEditMode.value 
      ? 'Hamkor muvaffaqiyatli tahrirlandi!'
      : 'Hamkor muvaffaqiyatli qo\'shildi!';
      
    closeModal();
    await fetchPartners();
    setTimeout(() => { successMessage.value = ''; }, 3000);
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Hamkorni saqlashda xatolik yuz berdi';
  } finally {
    submitting.value = false;
  }
};

const deletePartner = async (id: string) => {
  if (!confirm("Haqiqatdan ham bu hamkorni o'chirmoqchisiz?")) return;
  errorMessage.value = '';
  try {
    const token = useCookie("auth_token");
    await $fetch(`/api/v1/partners/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });
    successMessage.value = 'Hamkor muvaffaqiyatli o\'chirildi!';
    await fetchPartners();
    setTimeout(() => { successMessage.value = ''; }, 3000);
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'O\'chirishda xatolik yuz berdi';
  }
};

onMounted(() => {
  fetchPartners();
});
</script>
