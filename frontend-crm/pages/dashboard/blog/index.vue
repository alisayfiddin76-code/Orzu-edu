<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">📰 Blog va Yangiliklar Boshqaruvi</h1>
        <p class="text-sm text-slate-400 mt-1">Veb-saytdagi yangiliklar, foydali maqolalarni boshqarish (CRUD)</p>
      </div>
      <button
        class="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors"
        @click="openCreateModal"
      >
        + Yangi Maqola Qo'shish
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
      <p class="text-slate-400">Maqolalar yuklanmoqda...</p>
    </div>

    <div v-else-if="posts.length === 0" class="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80 text-slate-400">
      Maqolalar topilmadi. Yangi maqola yarating.
    </div>

    <div v-else class="rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm text-slate-300">
          <thead class="bg-slate-950/80 text-slate-400 font-semibold uppercase text-xs border-b border-slate-800">
            <tr>
              <th class="px-6 py-4">Rasm</th>
              <th class="px-6 py-4">Sarlavha</th>
              <th class="px-6 py-4">Muallif</th>
              <th class="px-6 py-4">Ko'rishlar</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4">Sana</th>
              <th class="px-6 py-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800 bg-slate-900/10">
            <tr v-for="post in posts" :key="post._id" class="hover:bg-slate-800/30 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <img 
                  v-if="post.image" 
                  :src="`${post.image}`" 
                  class="w-12 h-10 object-cover rounded-lg bg-slate-950 border border-slate-800"
                />
                <div v-else class="w-12 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-xs text-slate-600">
                  Rasm yo'q
                </div>
              </td>
              <td class="px-6 py-4 font-bold text-white max-w-xs truncate">
                {{ post.title }}
              </td>
              <td class="px-6 py-4">{{ post.author }}</td>
              <td class="px-6 py-4">👁 {{ post.views }}</td>
              <td class="px-6 py-4">
                <span 
                  class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider"
                  :class="post.published ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'"
                >
                  {{ post.published ? 'E\'LON QILINGAN' : 'QORALAMA' }}
                </span>
              </td>
              <td class="px-6 py-4 text-xs text-slate-400">
                {{ new Date(post.createdAt).toLocaleDateString('uz-UZ') }}
              </td>
              <td class="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                <button
                  class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                  @click="openEditModal(post)"
                >
                  Tahrirlash
                </button>
                <button
                  class="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg border border-rose-500/20 transition-colors"
                  @click="deletePost(post._id)"
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
      <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <h3 class="text-xl font-bold text-white mb-6">
          {{ isEditMode ? 'Maqolani Tahrirlash' : 'Yangi Maqola Yozish' }}
        </h3>

        <form @submit.prevent="submitForm" class="space-y-5">
          <!-- Title -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sarlavha *</label>
            <input 
              v-model="form.title" 
              type="text" 
              required
              placeholder="Maqola sarlavhasi"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <!-- Excerpt -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Qisqa tavsif (Excerpt) *</label>
            <input 
              v-model="form.excerpt" 
              type="text" 
              required
              placeholder="Kartochkada chiqadigan qisqa matn (2-3 gap)"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <!-- Image upload -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Muqova rasmi (Image)</label>
            <input 
              type="file" 
              accept="image/*"
              @change="handleFileUpload"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 transition-colors"
            />
            <p v-if="isEditMode && form.image" class="text-xs text-slate-500 mt-2">
              Joriy rasm: <a :href="`${form.image}`" target="_blank" class="text-indigo-400 underline">{{ form.image.split('/').pop() }}</a>
            </p>
          </div>

          <!-- Author and Tags -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Muallif</label>
              <input 
                v-model="form.author" 
                type="text" 
                placeholder="Masalan: ORZU EDU"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Teglar (Vergul bilan ajrating)</label>
              <input 
                v-model="form.tagsInput" 
                type="text" 
                placeholder="masalan: IT, dasturlash, vue"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <!-- Content Body -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Maqola matni (Content) *</label>
            <textarea 
              v-model="form.content" 
              rows="8" 
              required
              placeholder="Maqola matnini bu yerga to'liq yozing..."
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            ></textarea>
          </div>

          <!-- Published Checkbox -->
          <div class="flex items-center gap-3">
            <input 
              v-model="form.published" 
              type="checkbox" 
              id="published" 
              class="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500"
            />
            <label for="published" class="text-sm text-slate-300 font-semibold select-none cursor-pointer">
              Saytda chop etilsin (Publish immediately)
            </label>
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

const posts = ref<any[]>([]);
const loading = ref(false);
const submitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// Modal Form State
const isModalOpen = ref(false);
const isEditMode = ref(false);
const currentPostId = ref('');
const selectedFile = ref<File | null>(null);

const form = reactive({
  title: '',
  excerpt: '',
  content: '',
  author: 'ORZU EDU',
  tagsInput: '',
  published: false,
  image: ''
});

const fetchPosts = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const token = useCookie("auth_token");
    const response: any = await $fetch("/api/v1/blog/admin/all", {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });
    posts.value = response.data.posts || [];
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Maqolalarni yuklashda xatolik yuz berdi';
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
  currentPostId.value = '';
  selectedFile.value = null;
  form.title = '';
  form.excerpt = '';
  form.content = '';
  form.author = 'ORZU EDU';
  form.tagsInput = '';
  form.published = false;
  form.image = '';
  isModalOpen.value = true;
};

const openEditModal = (post: any) => {
  isEditMode.value = true;
  currentPostId.value = post._id;
  selectedFile.value = null;
  form.title = post.title;
  form.excerpt = post.excerpt || '';
  form.content = post.content;
  form.author = post.author || 'ORZU EDU';
  form.tagsInput = post.tags ? post.tags.join(', ') : '';
  form.published = post.published;
  form.image = post.image || '';
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
    formData.append('title', form.title);
    formData.append('excerpt', form.excerpt);
    formData.append('content', form.content);
    formData.append('author', form.author);
    formData.append('published', String(form.published));
    
    // Taglarni massivga keltirish
    const tagsArr = form.tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    tagsArr.forEach(tag => {
      formData.append('tags', tag);
    });

    if (selectedFile.value) {
      formData.append('image', selectedFile.value);
    }

    const url = isEditMode.value 
      ? `/api/v1/blog/${currentPostId.value}`
      : '/api/v1/blog';
      
    const method = isEditMode.value ? 'PATCH' : 'POST';

    await $fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: formData
    });

    successMessage.value = isEditMode.value 
      ? 'Maqola muvaffaqiyatli tahrirlandi!'
      : 'Yangi maqola muvaffaqiyatli yaratildi!';
      
    closeModal();
    await fetchPosts();
    setTimeout(() => { successMessage.value = ''; }, 3000);
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Maqolani saqlashda xatolik yuz berdi';
  } finally {
    submitting.value = false;
  }
};

const deletePost = async (id: string) => {
  if (!confirm("Haqiqatdan ham bu maqolani o'chirmoqchisiz?")) return;
  errorMessage.value = '';
  try {
    const token = useCookie("auth_token");
    await $fetch(`/api/v1/blog/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    });
    successMessage.value = 'Maqola muvaffaqiyatli o\'chirildi!';
    await fetchPosts();
    setTimeout(() => { successMessage.value = ''; }, 3000);
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'O\'chirishda xatolik yuz berdi';
  }
};

onMounted(() => {
  fetchPosts();
});
</script>
