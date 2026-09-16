<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">🎓 O'quvchilar Boshqaruvi</h1>
        <p class="text-sm text-slate-400 mt-1">O'quvchilarni guruhlar bo'yicha ko'rish, boshqa guruhga o'tkazish va tahrirlash</p>
      </div>
      <NuxtLink
        to="/dashboard/leads"
        class="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors border border-slate-700/60"
      >
        🎯 Yangi Arizalar (Leads)
      </NuxtLink>
    </div>

    <!-- Student Statistics Cards -->
    <div v-if="!loading" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 flex flex-col justify-center">
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Jami O'quvchilar</p>
        <h3 class="text-3xl font-black text-white">{{ studentStats.total }}<span class="text-sm text-slate-500 font-normal ml-1">ta</span></h3>
      </div>
      <div class="bg-indigo-900/20 border border-indigo-700/30 rounded-2xl p-4 flex flex-col justify-center">
        <p class="text-xs font-semibold text-indigo-400/80 uppercase tracking-wider mb-1">1 ta fandan qatnashuvchilar</p>
        <h3 class="text-2xl font-bold text-indigo-400">{{ studentStats.count1 }}<span class="text-sm text-indigo-500/50 font-normal ml-1">ta</span></h3>
      </div>
      <div class="bg-emerald-900/20 border border-emerald-700/30 rounded-2xl p-4 flex flex-col justify-center">
        <p class="text-xs font-semibold text-emerald-400/80 uppercase tracking-wider mb-1">2 ta fandan qatnashuvchilar</p>
        <h3 class="text-2xl font-bold text-emerald-400">{{ studentStats.count2 }}<span class="text-sm text-emerald-500/50 font-normal ml-1">ta</span></h3>
      </div>
      <div class="bg-amber-900/20 border border-amber-700/30 rounded-2xl p-4 flex flex-col justify-center">
        <p class="text-xs font-semibold text-amber-400/80 uppercase tracking-wider mb-1">3+ ta fandan qatnashuvchilar</p>
        <h3 class="text-2xl font-bold text-amber-400">{{ studentStats.count3plus }}<span class="text-sm text-amber-500/50 font-normal ml-1">ta</span></h3>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
      <div class="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-slate-400">Guruhlar va o'quvchilar yuklanmoqda...</p>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      ⚠️ {{ error }}
    </div>

    <!-- Success Alert -->
    <div v-if="successMessage" class="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
      ✅ {{ successMessage }}
    </div>

    <!-- Search Bar -->
    <div class="relative">
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="O'quvchi ismi yoki telefon raqami bo'yicha qidirish..."
        class="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
      />
      <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs transition-colors">
        ✕
      </button>
    </div>

    <!-- Groups Accordion List -->
    <div v-if="!loading" class="space-y-4">
      
      <!-- Group Item Accordion -->
      <div
        v-for="group in filteredGroups"
        :key="group._id"
        class="rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md overflow-hidden transition-all duration-300"
      >
        <!-- Accordion Header -->
        <button
          @click="toggleGroup(group._id)"
          class="w-full flex flex-col md:flex-row md:items-center justify-between p-5 text-left hover:bg-slate-900/20 transition-colors focus:outline-none gap-4"
        >
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-lg">
              👥
            </div>
            <div>
              <h3 class="text-md font-bold text-white flex items-center gap-2">
                {{ group.title }}
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-normal">
                  {{ group.students ? group.students.length : 0 }} o'quvchi
                </span>
              </h3>
              <p class="text-xs text-slate-500 mt-1">
                Kurs: <span class="text-slate-300">{{ group.course?.title || 'Kiritilmagan' }}</span> | 
                O'qituvchi: <span class="text-slate-300">{{ group.teacher ? `${group.teacher.firstname} ${group.teacher.lastname}` : 'Belgilanmagan' }}</span>
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <button @click.stop="openAddStudentModal(group._id)" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-xs font-semibold hidden md:block transition-colors border border-indigo-500/50">
              ➕ O'quvchi Qo'shish
            </button>
            <div class="text-right hidden md:block">
              <span class="text-xs font-semibold text-slate-400 block">Dars Vaqti:</span>
              <span class="text-[11px] text-slate-500 font-mono">{{ group.start_time }} - {{ group.end_time }} ({{ group.days === 'ODD' ? 'Duy, Chor, Jum' : group.days === 'EVEN' ? 'Se, Pay, Shan' : 'Har kuni' }})</span>
            </div>
            <span class="text-lg text-slate-400 transition-transform duration-300" :class="{ 'rotate-180': isGroupExpanded(group._id) }">
              ▼
            </span>
          </div>
        </button>

        <!-- Accordion Body (Students List) -->
        <Transition name="expand">
          <div v-show="isGroupExpanded(group._id)" class="border-t border-slate-800/60 bg-slate-950/20">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm border-collapse">
                <thead>
                  <tr class="border-b border-slate-800/60 bg-slate-900/30 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th class="px-6 py-3.5">O'quvchi Ism Familiyasi</th>
                    <th class="px-6 py-3.5">Telefon (Login)</th>
                    <th class="px-6 py-3.5">Ota-onasi raqami</th>
                    <th class="px-6 py-3.5">Qo'shilgan Sana</th>
                    <th class="px-6 py-3.5 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/40 text-slate-300">
                  <tr
                    v-for="student in group.students"
                    :key="student._id"
                    class="hover:bg-slate-900/10 transition-colors"
                  >
                    <td class="px-6 py-3.5 font-medium text-white">
                      <button @click="openProfileModal(student._id)" class="hover:text-indigo-400 hover:underline transition-colors text-left">
                        {{ student.user?.firstname }} {{ student.user?.lastname }}
                      </button>
                    </td>
                    <td class="px-6 py-3.5 font-mono text-xs">{{ formatPhoneNumber(student.user?.phone) }}</td>
                    <td class="px-6 py-3.5 font-mono text-xs text-slate-400">{{ formatPhoneNumber(student.parentPhone) || '—' }}</td>
                    <td class="px-6 py-3.5 text-xs text-slate-500">
                      <ClientOnly>
                        {{ formatDate(student.joined_date) }}
                      </ClientOnly>
                    </td>
                    <td class="px-6 py-3.5 text-right flex justify-end gap-2">
                      <button
                        @click="openEditModal(student)"
                        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 text-xs font-semibold transition-colors"
                      >
                        ✏️ Tahrirlash
                      </button>
                      <button
                        @click="removeStudentFromGroup(student._id, group._id)"
                        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors"
                      >
                        ❌ Chiqarish
                      </button>
                      <button
                        @click="openBillingSync(student, group)"
                        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition-colors"
                        title="To'lovni oyning 1-sanasiga sinxronlash"
                      >
                        🔄 Sinxronlash
                      </button>
                    </td>
                  </tr>
                  <tr v-if="!group.students || group.students.length === 0">
                    <td colspan="5" class="px-6 py-8 text-center text-slate-500 text-xs">
                      Ushbu guruhda hozircha o'quvchilar mavjud emas.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Unassigned Students Accordion -->
      <div class="rounded-2xl bg-slate-950/40 border border-dashed border-slate-700/80 shadow-md overflow-hidden">
        <!-- Accordion Header -->
        <button
          @click="toggleGroup('unassigned')"
          class="w-full flex items-center justify-between p-5 text-left hover:bg-slate-900/20 transition-colors focus:outline-none gap-4"
        >
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-lg">
              🎓
            </div>
            <div>
              <h3 class="text-md font-bold text-white flex items-center gap-2">
                Guruhsiz O'quvchilar
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-normal">
                  {{ unassignedStudents.length }} o'quvchi
                </span>
              </h3>
              <p class="text-xs text-slate-500 mt-1">Leadlardan aylantirilgan, lekin hali biror guruhga biriktirilmagan o'quvchilar</p>
            </div>
          </div>
          <span class="text-lg text-slate-400 transition-transform duration-300" :class="{ 'rotate-180': isGroupExpanded('unassigned') }">
            ▼
          </span>
        </button>

        <!-- Accordion Body -->
        <Transition name="expand">
          <div v-show="isGroupExpanded('unassigned')" class="border-t border-slate-800/60 bg-slate-950/20">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm border-collapse">
                <thead>
                  <tr class="border-b border-slate-800/60 bg-slate-900/30 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th class="px-6 py-3.5">O'quvchi Ism Familiyasi</th>
                    <th class="px-6 py-3.5">Telefon (Login)</th>
                    <th class="px-6 py-3.5">Qiziqqan Kursi (Lead)</th>
                    <th class="px-6 py-3.5">Qo'shilgan Sana</th>
                    <th class="px-6 py-3.5 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/40 text-slate-300">
                  <tr
                    v-for="student in unassignedStudents"
                    :key="student._id"
                    class="hover:bg-slate-900/10 transition-colors"
                  >
                    <td class="px-6 py-3.5 font-medium text-white">
                      {{ student.user?.firstname }} {{ student.user?.lastname }}
                    </td>
                    <td class="px-6 py-3.5 font-mono text-xs">{{ formatPhoneNumber(student.user?.phone) }}</td>
                    <td class="px-6 py-3.5 text-xs text-indigo-400">
                      <span class="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                        {{ student.lead?.course || '—' }}
                      </span>
                    </td>
                    <td class="px-6 py-3.5 text-xs text-slate-500">
                      <ClientOnly>
                        {{ formatDate(student.joined_date) }}
                      </ClientOnly>
                    </td>
                    <td class="px-6 py-3.5 text-right">
                      <button
                        @click="openEditModal(student)"
                        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 text-xs font-semibold transition-colors"
                      >
                        ✏️ Tahrirlash
                      </button>
                    </td>
                  </tr>
                  <tr v-if="unassignedStudents.length === 0">
                    <td colspan="5" class="px-6 py-8 text-center text-slate-500 text-xs">
                      Hozirda guruhsiz o'quvchilar mavjud emas.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Transition>
      </div>

    </div>

    <!-- Empty State -->
    <div v-if="!loading && groups.length === 0 && unassignedStudents.length === 0" class="p-12 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80">
      <p class="text-slate-400 text-lg">Tizimda hozircha o'quvchilar mavjud emas</p>
      <NuxtLink to="/dashboard/leads" class="text-sm text-indigo-400 hover:text-indigo-300 font-semibold mt-3 inline-block">
        Leadlar bo'limidan talaba qo'shing →
      </NuxtLink>
    </div>

    <!-- Edit / Move / Delete Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEditModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showEditModal = false">
          <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-6">
            <!-- Modal Header -->
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-white">Talaba Ma'lumotlarini Tahrirlash</h2>
              <button @click="showEditModal = false" class="text-slate-400 hover:text-white text-2xl">✕</button>
            </div>

            <!-- Form -->
            <form @submit.prevent="updateStudent" class="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- First Name -->
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ismi *</label>
                  <input v-model="editForm.firstname" type="text" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
                </div>

                <!-- Last Name -->
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Familiyasi *</label>
                  <input v-model="editForm.lastname" type="text" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all" />
                </div>

                <!-- Phone -->
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Telefon raqami (Login) *</label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-sm text-slate-400 font-mono">+998</span>
                    <input 
                      v-model="editForm.phone" 
                      @input="formatPhoneInput('phone')"
                      type="text" 
                      maxlength="12"
                      placeholder="90 123 45 67"
                      required 
                      class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-14 pr-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all" 
                    />
                  </div>
                </div>

                <!-- Parent Phone -->
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ota-onasi raqami *</label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-sm text-slate-400 font-mono">+998</span>
                    <input 
                      v-model="editForm.parentPhone" 
                      @input="formatPhoneInput('parentPhone')"
                      type="text" 
                      maxlength="12"
                      placeholder="90 123 45 67"
                      required 
                      class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-14 pr-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all" 
                    />
                  </div>
                </div>

                <!-- Birth Date -->
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tug'ilgan sanasi (Parol)</label>
                  <input v-model="editForm.birthDate" type="date" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" />
                </div>

                <!-- Status -->
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Holati</label>
                  <select v-model="editForm.status" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all">
                    <option value="ACTIVE">Faol o'qimoqda</option>
                    <option value="LEFT">Tark etgan</option>
                    <option value="GRADUATED">Bitirgan</option>
                  </select>
                </div>

                <!-- Group -->
                <div class="md:col-span-2">
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Guruh (O'zgartirish)</label>
                  <select v-model="editForm.groupId" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all">
                    <option value="">-- Guruhsiz (Guruhdan chiqarish) --</option>
                    <option v-for="g in groups" :key="g._id" :value="g._id">
                      {{ g.title }} | {{ g.course?.title || 'Kurs' }} | {{ g.start_time }}-{{ g.end_time }}
                    </option>
                  </select>
                </div>

              </div>

              <!-- Modal Errors -->
              <div v-if="modalError" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs mt-2">
                {{ modalError }}
              </div>

              <!-- Modal Actions -->
              <div class="flex items-center justify-between pt-4 border-t border-slate-800 mt-4">
                <button type="button" @click="deleteStudent(selectedStudentId)" :disabled="deleting" class="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-semibold disabled:opacity-50 transition-colors">
                  {{ deleting ? "O'chirilmoqda..." : "🗑️ O'chirish" }}
                </button>
                <div class="flex gap-3">
                  <button type="button" @click="showEditModal = false" class="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-900 text-xs font-semibold">
                    Bekor qilish
                  </button>
                  <button type="submit" :disabled="submitting" class="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 transition-all">
                    {{ submitting ? "Saqlanmoqda..." : "Saqlash" }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showAddStudentModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showAddStudentModal = false">
          <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-6">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-white">Guruhga O'quvchi Qo'shish</h2>
              <button @click="showAddStudentModal = false" class="text-slate-400 hover:text-white text-2xl">✕</button>
            </div>
            <form @submit.prevent="addStudentToGroupSubmit" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">O'quvchini qidiring va tanlang *</label>
                
                <!-- Qidiruv maydoni -->
                <input
                  v-model="studentSearchModal"
                  type="text"
                  placeholder="Ism yoki telefon raqami orqali qidiring..."
                  class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 mb-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />

                <select
                  v-model="addStudentForm.studentId"
                  required
                  size="6"
                  class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all custom-scrollbar overflow-y-auto"
                >
                  <option
                    v-for="s in filteredModalStudents"
                    :key="s._id"
                    :value="s._id"
                    class="px-2 py-2.5 mb-1 rounded-lg border-b border-slate-800/50 hover:bg-slate-800 cursor-pointer"
                  >
                    {{ s.user?.firstname }} {{ s.user?.lastname }} ({{ s.user?.phone }})
                  </option>
                  <option v-if="filteredModalStudents.length === 0" value="" disabled class="py-3 text-center text-slate-500">
                    Mos o'quvchi topilmadi
                  </option>
                </select>
              </div>
              <div v-if="modalError" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {{ modalError }}
              </div>
              <div class="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" @click="showAddStudentModal = false" class="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-900 text-xs font-semibold">
                  Bekor qilish
                </button>
                <button type="submit" :disabled="submitting" class="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 transition-all">
                  {{ submitting ? "Qo'shilmoqda..." : "Qo'shish" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
    
    <StudentProfileModal v-model="showProfileModal" :studentId="selectedProfileStudentId" />

    <!-- BILLING SYNC MODAL -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showBillingSyncModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showBillingSyncModal = false">
          <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-bold text-white">🔄 To'lovni 1-Sanaga Sinxronlash</h2>
                <p class="text-xs text-slate-400 mt-1">{{ billingSyncStudent?.user?.firstname }} {{ billingSyncStudent?.user?.lastname }} — {{ billingSyncGroup?.title }}</p>
              </div>
              <button @click="showBillingSyncModal = false" class="text-slate-400 hover:text-white text-2xl">✕</button>
            </div>

            <div v-if="billingSyncLoading" class="py-8 text-center">
              <div class="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-3"></div>
              <p class="text-slate-400 text-sm">Hisob-kitob yuklanmoqda...</p>
            </div>

            <template v-else-if="billingSyncPreview">
              <div class="p-4 rounded-xl bg-slate-900/60 border border-amber-500/20 space-y-2">
                <p class="text-xs text-amber-300 font-semibold">📅 Joriy holat:</p>
                <div class="grid grid-cols-3 gap-3 mt-2">
                  <div class="text-center">
                    <p class="text-[10px] text-slate-500 uppercase tracking-wider">Oy</p>
                    <p class="text-sm font-bold text-white">{{ billingSyncPreview.current_month }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-[10px] text-slate-500 uppercase tracking-wider">Qolgan kunlar</p>
                    <p class="text-sm font-bold text-amber-400">{{ billingSyncPreview.days_remaining }} kun</p>
                  </div>
                  <div class="text-center">
                    <p class="text-[10px] text-slate-500 uppercase tracking-wider">Kurs narxi</p>
                    <p class="text-sm font-bold text-white">{{ formatBillingMoney(billingSyncPreview.full_price) }}</p>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <button @click="billingSyncVariant = 'A'" :class="['p-4 rounded-xl border-2 text-left transition-all w-full', billingSyncVariant === 'A' ? 'border-indigo-500 bg-indigo-600/15' : 'border-slate-700 bg-slate-900/50 hover:border-slate-600']">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold text-indigo-400 uppercase tracking-wider">A-Variant</span>
                    <div :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center', billingSyncVariant === 'A' ? 'border-indigo-400' : 'border-slate-600']">
                      <div v-if="billingSyncVariant === 'A'" class="w-2 h-2 rounded-full bg-indigo-400"></div>
                    </div>
                  </div>
                  <p class="text-lg font-black text-white mb-1">{{ formatBillingMoney(billingSyncPreview.variant_a?.amount) }}</p>
                  <p class="text-xs text-slate-400">{{ billingSyncPreview.variant_a?.description }}</p>
                  <p class="text-[10px] text-slate-500 mt-2">⏭ Keyingi: <span class="text-slate-300 font-semibold">{{ billingSyncPreview.variant_a?.next_billing_month }}</span></p>
                </button>

                <button @click="billingSyncVariant = 'B'" :class="['p-4 rounded-xl border-2 text-left transition-all w-full', billingSyncVariant === 'B' ? 'border-emerald-500 bg-emerald-600/15' : 'border-slate-700 bg-slate-900/50 hover:border-slate-600']">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">B-Variant</span>
                    <div :class="['w-4 h-4 rounded-full border-2 flex items-center justify-center', billingSyncVariant === 'B' ? 'border-emerald-400' : 'border-slate-600']">
                      <div v-if="billingSyncVariant === 'B'" class="w-2 h-2 rounded-full bg-emerald-400"></div>
                    </div>
                  </div>
                  <p class="text-lg font-black text-white mb-1">{{ formatBillingMoney(billingSyncPreview.variant_b?.amount) }}</p>
                  <p class="text-xs text-slate-400">{{ billingSyncPreview.variant_b?.description }}</p>
                  <div class="mt-2 space-y-0.5">
                    <p class="text-[10px] text-slate-500">🟡 Prorated: <span class="text-amber-400 font-semibold">{{ formatBillingMoney(billingSyncPreview.variant_b?.prorated_part) }}</span></p>
                    <p class="text-[10px] text-slate-500">🟢 To'liq oy: <span class="text-emerald-400 font-semibold">{{ formatBillingMoney(billingSyncPreview.variant_b?.full_month_part) }}</span></p>
                    <p class="text-[10px] text-slate-500">⏭ Keyingi: <span class="text-slate-300 font-semibold">{{ billingSyncPreview.variant_b?.next_billing_month }}</span></p>
                  </div>
                </button>
              </div>

              <div v-if="billingSyncVariant">
                <label class="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-2">To'lov usuli *</label>
                <div class="grid grid-cols-4 gap-2">
                  <button v-for="method in billingSyncMethods" :key="method.value" @click="billingSyncMethod = method.value" :class="['py-2.5 rounded-xl text-xs font-bold border transition-all', billingSyncMethod === method.value ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-indigo-500/50']">{{ method.label }}</button>
                </div>
              </div>

              <div v-if="billingSyncVariant">
                <label class="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-2">Izoh (ixtiyoriy)</label>
                <input v-model="billingSyncNote" type="text" placeholder="Masalan: 15-avgustdan 1-sentyabrga o'tkazish" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>

              <div v-if="billingSyncError" class="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">⚠️ {{ billingSyncError }}</div>
              <div v-if="billingSyncSuccess" class="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">✅ {{ billingSyncSuccess }}</div>

              <div class="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button @click="showBillingSyncModal = false" class="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-900 text-xs font-semibold">Bekor qilish</button>
                <button
                  @click="submitBillingSync"
                  :disabled="!billingSyncVariant || !billingSyncMethod || billingSyncSubmitting"
                  :class="billingSyncVariant === 'B' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'"
                  class="px-5 py-2.5 rounded-lg text-white text-xs font-bold disabled:opacity-50 transition-colors"
                >
                  {{ billingSyncSubmitting ? 'Saqlanmoqda...' : (billingSyncVariant ? `✅ ${billingSyncVariant}-Variant Tasdiqlash` : 'Variant tanlang') }}
                </button>
              </div>
            </template>

            <div v-else class="py-6 text-center text-slate-500 text-sm">Ma'lumot yuklanmadi.</div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import StudentProfileModal from '~/components/StudentProfileModal.vue'

definePageMeta({ layout: 'admin' })
useHead({ title: 'O\'quvchilar Boshqaruvi — ORZU EDU' })

const showProfileModal = ref(false)
const selectedProfileStudentId = ref('')
const searchQuery = ref('')

const openProfileModal = (id: string) => {
  selectedProfileStudentId.value = id
  showProfileModal.value = true
}

// Filter groups + students by search query
const filteredGroups = computed(() => {
  if (!searchQuery.value.trim()) return groups.value
  const q = searchQuery.value.toLowerCase().trim()
  return groups.value.map((group: any) => ({
    ...group,
    students: group.students.filter((s: any) => {
      const name = `${s.user?.firstname} ${s.user?.lastname}`.toLowerCase()
      const phone = (s.user?.phone || '').toLowerCase()
      return name.includes(q) || phone.includes(q)
    })
  })).filter((group: any) => group.students.length > 0)
})

interface User {
  firstname: string
  lastname: string
  phone: string
  email?: string
  status: string
  birthDate?: string
}

interface Student {
  _id: string
  user: User
  joined_date: string
  parentPhone?: string
  status?: string
  school?: string
  address?: string
  source?: string
  enrollments?: any[]
  lead?: {
    course: string
  }
}

interface Group {
  _id: string
  title: string
  start_time: string
  end_time: string
  days: string
  course?: {
    title: string
  }
  teacher?: {
    firstname: string
    lastname: string
  }
  students: Student[]
}

const loading = ref(true)
const submitting = ref(false)
const deleting = ref(false)
const error = ref("")
const successMessage = ref("")
const modalError = ref("")

const groups = ref<Group[]>([])
const unassignedStudents = ref<Student[]>([])
const expandedGroups = ref<Record<string, boolean>>({ unassigned: true })

const allStudents = ref<Student[]>([])
const studentSearchModal = ref("")

const filteredModalStudents = computed(() => {
  if (!studentSearchModal.value.trim()) return unassignedStudents.value
  const q = studentSearchModal.value.toLowerCase().trim()
  return unassignedStudents.value.filter(s => {
    const name = `${s.user?.firstname} ${s.user?.lastname}`.toLowerCase()
    const phone = (s.user?.phone || '').toLowerCase()
    return name.includes(q) || phone.includes(q)
  })
})

const studentStats = computed(() => {
  const total = allStudents.value.length;
  
  // Har bir o'quvchi nechta faol guruhda qatnashayotganini sanaymiz
  const studentGroupCounts = new Map<string, number>();
  
  groups.value.forEach((group: any) => {
    if (group.students) {
      group.students.forEach((student: any) => {
        const sId = student._id || student;
        studentGroupCounts.set(sId, (studentGroupCounts.get(sId) || 0) + 1);
      });
    }
  });

  let count1 = 0;
  let count2 = 0;
  let count3plus = 0;

  allStudents.value.forEach(s => {
    const enrollmentsCount = studentGroupCounts.get(s._id) || 0;
    
    if (enrollmentsCount === 1) count1++;
    else if (enrollmentsCount === 2) count2++;
    else if (enrollmentsCount >= 3) count3plus++;
  });

  return { total, count1, count2, count3plus };
})

const showEditModal = ref(false)
const selectedStudentId = ref("")

// Phone Formatter
const formatPhoneNumber = (phone: string | undefined | null) => {
  if (!phone) return '—';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 9) return phone;
  const body = cleaned.slice(-9);
  const prefix = cleaned.slice(0, -9) || '998';
  return `+${prefix} ${body.slice(0, 2)} ${body.slice(2, 5)} ${body.slice(5, 7)} ${body.slice(7, 9)}`;
}

const editForm = reactive({
  firstname: "",
  lastname: "",
  parentPhone: "",
  phone: "",
  birthDate: "",
  groupId: "",
  status: "",
  school: "",
  address: "",
  source: ""
})

const formatPhoneInput = (field: 'phone' | 'parentPhone') => {
  let val = editForm[field].replace(/\D/g, '')
  if (val.startsWith('998') && val.length > 2) {
    val = val.substring(3)
  }
  let formatted = ''
  if (val.length > 0) formatted += val.substring(0, 2)
  if (val.length > 2) formatted += ' ' + val.substring(2, 5)
  if (val.length > 5) formatted += ' ' + val.substring(5, 7)
  if (val.length > 7) formatted += ' ' + val.substring(7, 9)
  editForm[field] = formatted
}

const showAddStudentModal = ref(false)
const addStudentForm = reactive({
  groupId: "",
  studentId: ""
})

// Toggle Accordions
const toggleGroup = (id: string) => {
  expandedGroups.value[id] = !expandedGroups.value[id]
}

const isGroupExpanded = (id: string) => {
  return !!expandedGroups.value[id]
}

// Fetch all data
const fetchData = async () => {
  loading.value = true
  error.value = ""
  try {
    const token = useCookie("auth_token")
    if (!token.value) {
      error.value = "Autentifikatsiya tokeni topilmadi. Qayta login qiling."
      loading.value = false
      return
    }

    // 1. Fetch grouped students
    const resGroups = await $fetch<any>("/api/v1/groups/students", {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    groups.value = resGroups?.data?.groups || []

    // 2. Fetch unassigned (available) students
    const resUnassigned = await $fetch<any>("/api/v1/students/available", {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    unassignedStudents.value = resUnassigned?.data?.students || []

    // 3. Fetch all active students for the Add Student dropdown
    const resAll = await $fetch<any>("/api/v1/students", {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    allStudents.value = (resAll?.data?.students || []).filter((s: any) => s.status === 'ACTIVE')

  } catch (err: any) {
    error.value = err?.data?.message || "O'quvchilar ma'lumotlarini yuklashda xatolik yuz berdi"
  } finally {
    loading.value = false
  }
}

// Open Edit Modal
const openEditModal = (student: Student) => {
  selectedStudentId.value = student._id
  editForm.firstname = student.user?.firstname || ""
  editForm.lastname = student.user?.lastname || ""
  
  const extractBody = (ph: string) => {
    let cleaned = ph.replace(/\D/g, '')
    if (cleaned.startsWith('998')) cleaned = cleaned.substring(3)
    let formatted = ''
    if (cleaned.length > 0) formatted += cleaned.substring(0, 2)
    if (cleaned.length > 2) formatted += ' ' + cleaned.substring(2, 5)
    if (cleaned.length > 5) formatted += ' ' + cleaned.substring(5, 7)
    if (cleaned.length > 7) formatted += ' ' + cleaned.substring(7, 9)
    return formatted
  }
  
  editForm.parentPhone = extractBody(student.parentPhone || "")
  editForm.phone = extractBody(student.user?.phone || "")
  
  let bDate = ""
  if (student.user?.birthDate && student.user.birthDate.length === 8) {
    const bd = student.user.birthDate
    bDate = `${bd.substring(0,4)}-${bd.substring(4,6)}-${bd.substring(6,8)}`
  }
  editForm.birthDate = bDate
  
  editForm.status = student.status || "ACTIVE"
  editForm.school = student.school || ""
  editForm.address = student.address || ""
  editForm.source = student.source || "WEBSITE"
  
  // Find current group
  const currentGroup = groups.value.find(g => g.students.some(s => s._id === student._id))
  editForm.groupId = currentGroup ? currentGroup._id : ""

  modalError.value = ""
  showEditModal.value = true
}

// Open Add Student Modal
const openAddStudentModal = (groupId: string) => {
  addStudentForm.groupId = groupId
  addStudentForm.studentId = ""
  studentSearchModal.value = ""
  modalError.value = ""
  showAddStudentModal.value = true
}

// Submit Add Student
const addStudentToGroupSubmit = async () => {
  if (!addStudentForm.studentId) return modalError.value = "O'quvchini tanlang"
  submitting.value = true
  modalError.value = ""
  try {
    const token = useCookie("auth_token")
    await $fetch(`/api/v1/groups/${addStudentForm.groupId}/students/${addStudentForm.studentId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token.value}` }
    })
    successMessage.value = "O'quvchi guruhga muvaffaqiyatli qo'shildi!"
    showAddStudentModal.value = false
    await fetchData()
    setTimeout(() => { successMessage.value = "" }, 3000)
  } catch (err: any) {
    modalError.value = err?.data?.message || "Qo'shishda xatolik yuz berdi"
  } finally {
    submitting.value = false
  }
}

// Remove Student From Group
const removeStudentFromGroup = async (studentId: string, groupId: string) => {
  if (!confirm("Rostan ham ushbu o'quvchini guruhdan chiqarmoqchimisiz? (Boshqa guruhlardan o'chmaydi)")) return
  error.value = ""
  try {
    const token = useCookie("auth_token")
    await $fetch(`/api/v1/groups/${groupId}/students/${studentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token.value}` }
    })
    successMessage.value = "O'quvchi guruhdan muvaffaqiyatli chiqarildi!"
    await fetchData()
    setTimeout(() => { successMessage.value = "" }, 3000)
  } catch (err: any) {
    error.value = err?.data?.message || "Chiqarishda xatolik yuz berdi"
  }
}

// Update student (Name and/or Group transfer)
const updateStudent = async () => {
  submitting.value = true
  modalError.value = ""
  try {
    const token = useCookie("auth_token")
    await $fetch(`/api/v1/students/${selectedStudentId.value}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`
      },
      body: editForm
    })

    successMessage.value = "O'quvchi ma'lumotlari muvaffaqiyatli saqlandi!"
    showEditModal.value = false
    await fetchData()
    setTimeout(() => { successMessage.value = "" }, 3000)
  } catch (err: any) {
    modalError.value = err?.data?.message || "Saqlashda xatolik yuz berdi"
  } finally {
    submitting.value = false
  }
}

// Delete student completely
const deleteStudent = async (studentId: string) => {
  if (!confirm("Haqiqatan ham ushbu talabani tizimdan butunlay o'chirmoqchisiz? Ushbu amal uning login hisobini ham o'chirib yuboradi va qaytarib bo'lmaydi!")) return

  deleting.value = true
  modalError.value = ""
  try {
    const token = useCookie("auth_token")
    await $fetch(`/api/v1/students/${studentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token.value}` }
    })

    successMessage.value = "Talaba muvaffaqiyatli o'chirildi!"
    showEditModal.value = false
    await fetchData()
    setTimeout(() => { successMessage.value = "" }, 3000)
  } catch (err: any) {
    modalError.value = err?.data?.message || "O'chirishda xatolik yuz berdi"
  } finally {
    deleting.value = false
  }
}

// Helpers
const formatDate = (dateStr: string) => {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("uz-UZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
}

onMounted(() => {
  fetchData()
})

// ============================================================
// BILLING SYNC — 1-sanaga to'g'rilash
// ============================================================
const showBillingSyncModal = ref(false)
const billingSyncStudent = ref<any>(null)
const billingSyncGroup = ref<any>(null)
const billingSyncPreview = ref<any>(null)
const billingSyncLoading = ref(false)
const billingSyncVariant = ref<'A' | 'B' | null>(null)
const billingSyncMethod = ref('')
const billingSyncNote = ref('')
const billingSyncSubmitting = ref(false)
const billingSyncError = ref('')
const billingSyncSuccess = ref('')

const billingSyncMethods = [
  { value: 'CASH', label: 'Naqd' },
  { value: 'CARD', label: 'Karta' },
  { value: 'CLICK', label: 'Click' },
  { value: 'BANK', label: 'Bank' },
]

const formatBillingMoney = (val: number) =>
  new Intl.NumberFormat('uz-UZ').format(val || 0) + " so'm"

const openBillingSync = async (student: any, group: any) => {
  billingSyncStudent.value = student
  billingSyncGroup.value = group
  billingSyncPreview.value = null
  billingSyncVariant.value = null
  billingSyncMethod.value = ''
  billingSyncNote.value = ''
  billingSyncError.value = ''
  billingSyncSuccess.value = ''
  showBillingSyncModal.value = true
  billingSyncLoading.value = true

  try {
    const token = useCookie('auth_token')
    const res = await $fetch<any>(
      `/api/v1/finance/prorated-preview?student_id=${student._id}&group_id=${group._id}`,
      { headers: { Authorization: `Bearer ${token.value}` } }
    )
    billingSyncPreview.value = res.data
    // Default A-variant
    billingSyncVariant.value = 'A'
  } catch (e: any) {
    billingSyncError.value = e?.data?.message || 'Hisob-kitobni yuklashda xatolik'
  } finally {
    billingSyncLoading.value = false
  }
}

const submitBillingSync = async () => {
  if (!billingSyncVariant.value || !billingSyncMethod.value) return
  billingSyncSubmitting.value = true
  billingSyncError.value = ''
  billingSyncSuccess.value = ''

  try {
    const token = useCookie('auth_token')
    const preview = billingSyncPreview.value
    const amount = billingSyncVariant.value === 'A'
      ? preview?.variant_a?.amount
      : preview?.variant_b?.amount

    await $fetch('/api/v1/finance/invoices/sync-billing', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: {
        student_id: billingSyncStudent.value._id,
        group_id: billingSyncGroup.value._id,
        variant: billingSyncVariant.value,
        payment_method: billingSyncMethod.value,
        amount,
        note: billingSyncNote.value || null,
      }
    })

    const msg = billingSyncVariant.value === 'A'
      ? "A-Variant: Joriy oy qoldig'i to'landi. Keyingi oyda invoice yaratiladi."
      : "B-Variant: Joriy oy + keyingi oy to'landi. Keyingi oyda invoice yaratilmaydi."
    billingSyncSuccess.value = `✅ ${msg}`
    setTimeout(() => {
      showBillingSyncModal.value = false
      billingSyncSuccess.value = ''
    }, 3000)
  } catch (e: any) {
    billingSyncError.value = e?.data?.message || "To'lovni saqlashda xatolik"
  } finally {
    billingSyncSubmitting.value = false
  }
}
</script>

<style scoped>
/* Accordion transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 1000px;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

/* Modal transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
