<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-white">Xush kelibsiz, Ustoz! 👨‍🏫</h2>
        <p class="text-sm text-slate-400 mt-1">{{ todayFormatted }} | O'qituvchi boshqaruv paneli</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="openPendingHomeworksModal"
          class="relative bg-slate-900 border border-slate-800 text-xs font-semibold px-4 py-2.5 rounded-lg text-slate-300 hover:text-white hover:border-slate-700 transition-all"
        >
          📝 Uyga vazifalarni tekshirish
          <span
            v-if="summaryStats.pendingHomeworksCount > 0"
            class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white border border-slate-950 animate-pulse"
          >
            {{ summaryStats.pendingHomeworksCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- Alert for 12-Hour Deadline Delay -->
    <div
      v-if="summaryStats.showHomeworkAlert"
      class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between gap-4 shadow-md"
    >
      <div class="flex items-center gap-2">
        <span>⚠️</span>
        <span><strong>Diqqat!</strong> Topshirish muddati o'tganiga 12 soatdan oshgan, tekshirilishi kutilayotgan uyga vazifalar bor!</span>
      </div>
      <button
        @click="openPendingHomeworksModal"
        class="text-xs bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
      >
        Tekshirish
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md hover:border-slate-700 transition-colors flex justify-between items-center">
        <div>
          <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Bugungi Darslar</p>
          <p class="text-2xl font-extrabold text-white mt-1.5">{{ summaryStats.todaysClassesCount }} ta guruh</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">📅</div>
      </div>

      <div class="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md hover:border-slate-700 transition-colors flex justify-between items-center">
        <div>
          <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Tekshirilmagan Vazifalar</p>
          <p class="text-2xl font-extrabold text-white mt-1.5">{{ summaryStats.pendingHomeworksCount }} ta javob</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">📝</div>
      </div>

      <div class="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md hover:border-slate-700 transition-colors flex justify-between items-center">
        <div>
          <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Yaqinlashayotgan Imtihonlar</p>
          <p class="text-2xl font-extrabold text-white mt-1.5">{{ summaryStats.upcomingExamsCount }} ta imtihon</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">🏆</div>
      </div>
    </div>

    <!-- MAIN GRID -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      <!-- Today's Schedule -->
      <div class="xl:col-span-1 p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md space-y-4">
        <div>
          <h3 class="text-md font-bold tracking-tight text-white">📅 Bugungi darslar jadvali</h3>
          <p class="text-xs text-slate-500">Bugun o'tilishi lozim bo'lgan darslaringiz</p>
        </div>

        <div v-if="todaysClasses.length === 0" class="p-8 text-center text-slate-500 text-xs bg-slate-900/40 rounded-xl">
          Bugun rejalashtirilgan darslar yo'q yoki dam olish kuni.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="group in todaysClasses"
            :key="group._id"
            class="p-4 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-indigo-500/40 transition-colors flex flex-col justify-between gap-3"
          >
            <div>
              <div class="flex items-center justify-between">
                <h4 class="font-bold text-sm text-white">{{ group.title }}</h4>
                <span class="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold">{{ formatDays(group.days) }}</span>
              </div>
              <p class="text-xs text-slate-500 mt-1">Kurs: {{ group.course?.title || 'Yuklanmoqda...' }}</p>
            </div>
            
            <div class="flex items-center justify-between gap-3">
              <span class="flex items-center gap-1.5 text-xs text-slate-400 font-semibold bg-slate-800/80 px-3 py-1.5 rounded-lg">
                ⏰ {{ group.start_time || '—' }} - {{ group.end_time || '—' }}
              </span>
              <NuxtLink
                :to="`/dashboard/teacher/groups/${group._id}`"
                class="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-550 text-white font-semibold text-xs transition-colors"
              >
                📂 Guruh sahifasi
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- All Assigned Groups -->
      <div class="xl:col-span-2 p-6 rounded-2xl bg-slate-950/40 border border-slate-800/80 shadow-md space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-md font-bold tracking-tight text-white">👥 Mening barcha guruhlarim</h3>
            <p class="text-xs text-slate-500">Sizga biriktirilgan faol dars guruhlari</p>
          </div>
        </div>

        <div v-if="loadingGroups" class="p-8 text-center text-slate-500 text-xs">
          Guruhlar yuklanmoqda...
        </div>

        <div v-else-if="myGroups.length === 0" class="p-8 text-center text-slate-500 text-xs">
          Hozircha sizga biriktirilgan guruhlar mavjud emas.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="group in myGroups"
            :key="group._id"
            class="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-4"
          >
            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-indigo-400 font-semibold tracking-wide uppercase">{{ formatDays(group.days) }}</span>
                <span class="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold">{{ group.time }}</span>
              </div>
              <h4 class="font-bold text-white text-base mt-1.5">{{ group.title }}</h4>
              <p class="text-xs text-slate-500 mt-1">Kurs: {{ group.course?.title }}</p>
              <p class="text-xs text-slate-500 mt-0.5">O'quvchilar: {{ group.students?.length || 0 }} ta faol o'quvchi</p>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <NuxtLink
                :to="`/dashboard/teacher/groups/${group._id}`"
                class="py-2 text-center text-xs font-bold rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Guruh sahifasi
              </NuxtLink>
              <button
                @click="openLessonPlanModal(group)"
                class="py-2 text-center text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-550 text-white transition-colors"
              >
                + Dars qo'shish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- MODAL: Group Details View -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showGroupDetailsModal && selectedGroup" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showGroupDetailsModal = false">
          <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl p-6 space-y-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-bold text-white">{{ selectedGroup.title }}</h2>
                <p class="text-xs text-slate-500">Dars vaqti: {{ formatDays(selectedGroup.days) }}, {{ selectedGroup.time }}</p>
              </div>
              <button @click="showGroupDetailsModal = false" class="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
            </div>

            <!-- Tabs -->
            <div class="flex border-b border-slate-800">
              <button
                v-for="tab in ['students', 'lessonPlans', 'exams', 'finalResults']"
                :key="tab"
                @click="currentGroupTab = tab"
                :class="currentGroupTab === tab ? 'border-b-2 border-indigo-500 text-white font-bold' : 'text-slate-500 hover:text-slate-300'"
                class="px-4 py-2.5 text-xs uppercase tracking-wider transition-colors"
              >
                {{ tab === 'students' ? 'O\'quvchilar' : tab === 'lessonPlans' ? 'Dars rejasi & Vazifalar' : tab === 'exams' ? 'Imtihonlar' : 'Yakuniy Natijalar' }}
              </button>
            </div>

            <!-- Tab Content: Students -->
            <div v-if="currentGroupTab === 'students'" class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-white uppercase tracking-wider">O'quvchilar ro'yxati ({{ selectedGroup.students?.length || 0 }} ta)</h3>
                <div class="flex gap-2">
                  <button @click="openAttendanceModal(selectedGroup)" class="text-xs bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg transition-colors">📝 Davomat belgilash</button>
                  <button @click="openGradesModal(selectedGroup)" class="text-xs bg-indigo-600 hover:bg-indigo-550 text-white px-3 py-1.5 rounded-lg transition-colors">⭐ Baho qo'yish</button>
                </div>
              </div>

              <div class="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/40">
                <table class="w-full text-left text-xs">
                  <thead>
                    <tr class="bg-slate-900 border-b border-slate-850 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                      <th class="px-5 py-3">Ism Familiya</th>
                      <th class="px-5 py-3">Telefon</th>
                      <th class="px-5 py-3">Tug'ilgan sana (birthDate)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-850 text-slate-300">
                    <tr v-for="student in selectedGroup.students" :key="student._id" class="hover:bg-slate-900/20">
                      <td class="px-5 py-3.5 font-medium text-white">{{ student.user?.firstname }} {{ student.user?.lastname }}</td>
                      <td class="px-5 py-3.5 font-mono">{{ student.user?.phone }}</td>
                      <td class="px-5 py-3.5">{{ student.birthDate || 'Kiritilmagan' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Tab Content: Lesson Plans -->
            <div v-if="currentGroupTab === 'lessonPlans'" class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-white uppercase tracking-wider">O'tilgan darslar va uyga vazifalar tarixi</h3>
                <button @click="openLessonPlanModal(selectedGroup)" class="text-xs bg-indigo-600 hover:bg-indigo-550 text-white px-3 py-1.5 rounded-lg transition-colors">+ Yangi dars qo'shish</button>
              </div>

              <div v-if="loadingGroupLessonPlans" class="p-8 text-center text-slate-500">Dars rejalari yuklanmoqda...</div>
              <div v-else-if="groupLessonPlans.length === 0" class="p-8 text-center text-slate-500 text-xs">Hozircha o'tilgan darslar mavjud emas.</div>
              <div v-else class="space-y-3">
                <div v-for="lp in groupLessonPlans" :key="lp._id" class="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-bold text-sm text-white">{{ lp.topic }}</h4>
                      <p class="text-[10px] text-slate-500 mt-0.5">Sana: {{ new Date(lp.date).toLocaleDateString() }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <button @click="openEditLessonPlanModal(lp)" class="text-[10px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-2 py-1 rounded transition-colors">✏️ Tahrirlash</button>
                      <span class="px-2 py-0.5 rounded text-[10px] bg-red-500/10 border border-red-500/20 text-red-400">Muddat: {{ new Date(lp.homeworkDeadline).toLocaleString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</span>
                    </div>
                  </div>

                  <div class="text-xs text-slate-300">
                    <strong class="text-white">Uyga vazifa:</strong> {{ lp.homeworkDetails }}
                  </div>

                  <div v-if="lp.materials && lp.materials.length > 0" class="space-y-1">
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Yuklangan materiallar:</p>
                    <div class="flex flex-wrap gap-2">
                      <a
                        v-for="(mat, idx) in lp.materials"
                        :key="idx"
                        :href="`${mat}`"
                        target="_blank"
                        class="text-xs bg-slate-900 border border-slate-800 text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors"
                      >
                        📂 Material {{ Number(idx) + 1 }}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab Content: Exams -->
            <div v-if="currentGroupTab === 'exams'" class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-white uppercase tracking-wider">Guruh imtihonlari</h3>
                <button @click="openExamModal(selectedGroup)" class="text-xs bg-indigo-600 hover:bg-indigo-550 text-white px-3 py-1.5 rounded-lg transition-colors">+ Imtihon e'lon qilish</button>
              </div>

              <!-- Exam listings -->
              <div v-if="loadingExams" class="p-8 text-center text-slate-500">Imtihonlar yuklanmoqda...</div>
              <div v-else-if="groupExams.length === 0" class="p-8 text-center text-slate-500 text-xs">Ushbu guruhda imtihonlar rejalashtirilmagan.</div>
              <div v-else class="space-y-3">
                <div v-for="exam in groupExams" :key="exam._id" class="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h4 class="font-bold text-sm text-white">{{ exam.name }}</h4>
                    <p class="text-xs text-slate-500 mt-1">Sana: {{ new Date(exam.date).toLocaleDateString() }}</p>
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="openEditExamModal(exam)"
                      class="text-xs bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      ✏️ Tahrirlash
                    </button>
                    <button
                      @click="openExamResultsModal(exam)"
                      class="text-xs bg-slate-900 hover:bg-slate-850 border border-slate-800 text-indigo-400 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Natijalarni kiritish
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab Content: Final Results -->
            <div v-if="currentGroupTab === 'finalResults'" class="space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-white uppercase tracking-wider">Yakuniy Natijalar va Guruhni Yopish</h3>
                <div class="flex gap-2">
                  <button v-if="selectedGroup.status !== 'CLOSED'" @click="saveAndCloseGroup" :disabled="closingGroup" class="text-xs bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors font-bold disabled:opacity-50">
                    {{ closingGroup ? 'Saqlanmoqda...' : 'Guruhni Yopish & Natijalarni Saqlash' }}
                  </button>
                </div>
              </div>

              <div v-if="selectedGroup.status === 'CLOSED'">
                <div class="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-4">
                  Guruh muvaffaqiyatli yopilgan va yakuniy natijalar saqlangan.
                </div>
              </div>
              <div v-else>
                <div class="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs mb-4">
                  Quyidagi jadvalda o'quvchilarning joriy o'zlashtirishi (Kundalik 40%) ko'rsatilgan. Oraliq (30%) va Yakuniy (30%) baholarni kiritib <strong>Guruhni Yopish</strong> tugmasini bosing.
                </div>
              </div>
                
              <div class="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/40">
                <table class="w-full text-left text-xs">
                  <thead>
                    <tr class="bg-slate-900 border-b border-slate-850 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                      <th class="px-5 py-3" v-if="selectedGroup.status === 'CLOSED'">O'rin</th>
                      <th class="px-5 py-3">O'quvchi</th>
                      <th class="px-5 py-3">Kundalik (40%)</th>
                      <th class="px-5 py-3">Oraliq (30%)</th>
                      <th class="px-5 py-3">Yakuniy (30%)</th>
                      <th class="px-5 py-3 font-bold text-white">Umumiy Natija</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-850 text-slate-300">
                    <tr v-for="res in previewResults" :key="res.student" class="hover:bg-slate-900/20">
                      <td class="px-5 py-3.5 font-bold text-white" v-if="selectedGroup.status === 'CLOSED'">#{{ res.rank }}</td>
                      <td class="px-5 py-3.5 font-medium">{{ getStudentName(selectedGroup, res.student) }}</td>
                      <td class="px-5 py-3.5">
                        <span class="text-slate-400 text-[10px] mr-1" title="Dars">{{ res.classworkScore.toFixed(0) }}%</span> 
                        <span class="text-slate-400 text-[10px] mr-2" title="Vazifa">{{ res.homeworkScore.toFixed(0) }}%</span>
                        <strong class="text-indigo-400">{{ ((res.classworkScore + res.homeworkScore) / 2).toFixed(1) }}%</strong>
                      </td>
                      
                      <td class="px-5 py-3.5" v-if="selectedGroup.status !== 'CLOSED'">
                        <input type="number" min="0" max="100" placeholder="0-100" v-model.number="res.midtermScore" class="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 text-center" />
                      </td>
                      <td class="px-5 py-3.5" v-if="selectedGroup.status === 'CLOSED'">{{ res.midtermScore }}%</td>
                      
                      <td class="px-5 py-3.5" v-if="selectedGroup.status !== 'CLOSED'">
                        <input type="number" min="0" max="100" placeholder="0-100" v-model.number="res.finalScore" class="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 text-center" />
                      </td>
                      <td class="px-5 py-3.5" v-if="selectedGroup.status === 'CLOSED'">{{ res.finalScore }}%</td>
                      
                      <td class="px-5 py-3.5 font-bold" :class="calculateTotalPreview(res) >= 80 ? 'text-green-400' : calculateTotalPreview(res) >= 60 ? 'text-yellow-400' : 'text-red-400'">
                        {{ calculateTotalPreview(res).toFixed(1) }}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL: Record Bulk Attendance -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showAttendanceModal && activeAttendanceGroup" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showAttendanceModal = false">
          <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-white">📝 Davomat belgilash</h2>
                <p class="text-xs text-slate-500">Guruh: {{ activeAttendanceGroup.title }} | Sana: {{ new Date().toLocaleDateString() }}</p>
              </div>
              <button @click="showAttendanceModal = false" class="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
            </div>

            <form @submit.prevent="submitAttendance" class="space-y-5">
              <div class="divide-y divide-slate-850 max-h-[50vh] overflow-y-auto pr-2 space-y-3">
                <div
                  v-for="student in activeAttendanceGroup.students"
                  :key="student._id"
                  class="flex items-center justify-between py-3 gap-4"
                >
                  <span class="text-xs font-semibold text-white">{{ student.user?.firstname }} {{ student.user?.lastname }}</span>
                  
                  <div class="flex items-center gap-3">
                    <label class="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" :name="student._id" value="PRESENT" v-model="attendanceForm[student._id]" class="w-3.5 h-3.5 accent-green-500" />
                      <span class="text-[11px] text-green-400 font-bold">Faol</span>
                    </label>
                    <label class="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" :name="student._id" value="ABSENT" v-model="attendanceForm[student._id]" class="w-3.5 h-3.5 accent-red-500" />
                      <span class="text-[11px] text-red-400 font-bold">Kelmagan</span>
                    </label>
                    <label class="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" :name="student._id" value="LATE" v-model="attendanceForm[student._id]" class="w-3.5 h-3.5 accent-amber-500" />
                      <span class="text-[11px] text-amber-400 font-bold">Kechikdi</span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="flex gap-3 justify-end pt-2">
                <button type="button" @click="showAttendanceModal = false" class="px-5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-900 text-xs font-semibold">Bekor qilish</button>
                <button type="submit" :disabled="submittingAttendance" class="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-semibold disabled:opacity-50">
                  {{ submittingAttendance ? 'Saqlanmoqda...' : 'Davomatni saqlash' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL: Record Bulk Grades -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showGradesModal && activeGradesGroup" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showGradesModal = false">
          <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-white">⭐ Baho qo'yish</h2>
                <p class="text-xs text-slate-500">Guruh: {{ activeGradesGroup.title }}</p>
              </div>
              <button @click="showGradesModal = false" class="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
            </div>

            <form @submit.prevent="submitGrades" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Baholash mavzusi (Topic)*</label>
                <input v-model="gradesTopic" type="text" placeholder="Masalan: JavaScript Arrays or CSS Flexbox" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>

              <div class="divide-y divide-slate-850 max-h-[40vh] overflow-y-auto pr-2 space-y-3">
                <div
                  v-for="student in activeGradesGroup.students"
                  :key="student._id"
                  class="flex items-center justify-between py-2 gap-4"
                >
                  <span class="text-xs font-semibold text-white">{{ student.user?.firstname }} {{ student.user?.lastname }}</span>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    placeholder="Baho (0-5)"
                    v-model.number="gradesForm[student._id]"
                    class="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div class="flex gap-3 justify-end pt-2">
                <button type="button" @click="showGradesModal = false" class="px-5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-900 text-xs font-semibold">Bekor qilish</button>
                <button type="submit" :disabled="submittingGrades" class="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-semibold disabled:opacity-50">
                  {{ submittingGrades ? 'Saqlanmoqda...' : 'Baholarni saqlash' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL: Add Lesson Plan -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showLessonPlanModal && activeLpGroup" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showLessonPlanModal = false">
          <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-white">📚 Yangi dars va uyga vazifa qo'shish</h2>
                <p class="text-xs text-slate-500">Guruh: {{ activeLpGroup.title }}</p>
              </div>
              <button @click="showLessonPlanModal = false" class="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
            </div>

            <form @submit.prevent="submitLessonPlan" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Dars mavzusi (Topic)*</label>
                <input v-model="lpForm.topic" type="text" placeholder="Masalan: JavaScript Promises" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Darslik materiallari (PDF, Word, Rasm - Max 5 ta)</label>
                <input type="file" multiple @change="handleLpFileUpload" class="w-full text-xs text-slate-400 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Uyga vazifa tavsifi (Homework Details)*</label>
                <textarea v-model="lpForm.homeworkDetails" rows="4" placeholder="Vazifa tafsilotlarini yozing..." required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"></textarea>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Uyga vazifa muddati (Deadline)*</label>
                <input v-model="lpForm.homeworkDeadline" type="datetime-local" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>

              <div v-if="lpError" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {{ lpError }}
              </div>

              <div class="flex gap-3 justify-end pt-2">
                <button type="button" @click="showLessonPlanModal = false" class="px-5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-900 text-xs font-semibold">Bekor qilish</button>
                <button type="submit" :disabled="submittingLp" class="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-semibold disabled:opacity-50">
                  {{ submittingLp ? 'Muvaffaqiyatli saqlanmoqda...' : 'Saqlash' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL: Declare Group Exam -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showExamModal && activeExamGroup" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showExamModal = false">
          <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-6" @click.stop>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-white">🏆 Imtihon e'lon qilish</h2>
                <p class="text-xs text-slate-500">Guruh: {{ activeExamGroup.title }}</p>
              </div>
              <button @click="showExamModal = false" class="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
            </div>

            <form @submit.prevent="submitExam" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Imtihon nomi (Exam Name)*</label>
                <input v-model="examForm.name" type="text" placeholder="Masalan: JavaScript Modul 1 Exam" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Imtihon kuni (Date)*</label>
                <input v-model="examForm.date" type="date" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>

              <div class="flex gap-3 justify-end pt-2">
                <button type="button" @click="showExamModal = false" class="px-5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-900 text-xs font-semibold">Bekor qilish</button>
                <button type="submit" :disabled="submittingExam" class="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-semibold disabled:opacity-50">
                  {{ submittingExam ? 'Saqlanmoqda...' : 'E\'lon qilish' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL: Record Exam Results -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showExamResultsModal && activeExamResults" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showExamResultsModal = false">
          <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl p-6 space-y-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-white">🏆 Imtihon natijalarini kiritish</h2>
                <p class="text-xs text-slate-500">Imtihon: {{ activeExamResults.name }}</p>
              </div>
              <button @click="showExamResultsModal = false" class="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
            </div>

            <form @submit.prevent="submitExamResults" class="space-y-4">
              <div class="divide-y divide-slate-850 max-h-[50vh] overflow-y-auto pr-2 space-y-3">
                <!-- Group students lookup -->
                <div
                  v-for="student in examGroupStudents"
                  :key="student._id"
                  class="flex items-center justify-between py-2 gap-4"
                >
                  <span class="text-xs font-semibold text-white">{{ student.user?.firstname }} {{ student.user?.lastname }}</span>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    placeholder="Baho (0-5)"
                    v-model.number="examResultsForm[student._id]"
                    class="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div class="flex gap-3 justify-end pt-2">
                <button type="button" @click="showExamResultsModal = false" class="px-5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-900 text-xs font-semibold">Bekor qilish</button>
                <button type="submit" :disabled="submittingExamResults" class="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-semibold disabled:opacity-50">
                  {{ submittingExamResults ? 'Saqlanmoqda...' : 'Natijalarni saqlash' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL: Pending Homeworks Submissions Check -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showPendingHomeworksModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showPendingHomeworksModal = false">
          <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl p-6 space-y-6 max-h-[90vh] overflow-y-auto" @click.stop>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-bold text-white">📝 Uyga vazifalarni tekshirish oynasi</h2>
                <p class="text-xs text-slate-500">Talabalar yuborgan barcha tekshirilmagan uyga vazifalar ro'yxati</p>
              </div>
              <button @click="showPendingHomeworksModal = false" class="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
            </div>

            <div v-if="loadingPendingSubmissions" class="p-8 text-center text-slate-500">Vazifalar ro'yxati yuklanmoqda...</div>
            <div v-else-if="pendingSubmissions.length === 0" class="p-8 text-center text-slate-500 text-xs">
              Muvaffaqiyat! Hozirda tekshirilmagan uyga vazifalar yo'q.
            </div>
            
            <div v-else class="space-y-4">
              <div
                v-for="sub in pendingSubmissions"
                :key="sub._id"
                class="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4"
              >
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h4 class="font-bold text-sm text-white">O'quvchi: {{ sub.student?.user?.firstname }} {{ sub.student?.user?.lastname }}</h4>
                    <p class="text-xs text-slate-400 mt-0.5">Guruh: {{ sub.lessonPlan?.group?.title }} | Mavzu: {{ sub.lessonPlan?.topic }}</p>
                  </div>
                  <div class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Topshirilgan vaqt: {{ new Date(sub.submittedAt).toLocaleString() }}</div>
                </div>

                <div v-if="sub.studentNote" class="text-xs text-slate-300">
                  <strong class="text-white">Talaba izohi:</strong> "{{ sub.studentNote }}"
                </div>

                <div v-if="sub.submittedFiles && sub.submittedFiles.length > 0" class="space-y-1">
                  <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Yuborilgan fayllar:</p>
                  <div class="flex flex-wrap gap-2">
                    <a
                      v-for="(file, index) in sub.submittedFiles"
                      :key="index"
                      :href="`${file}`"
                      target="_blank"
                      class="text-xs bg-slate-950 border border-slate-800 text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-mono"
                    >
                      📁 Hujjat {{ Number(index) + 1 }}
                    </a>
                  </div>
                </div>

                <!-- Grading Form -->
                <form @submit.prevent="submitGradeForHomework(sub._id)" class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-2">
                  <div class="sm:col-span-1">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Baho kiritish (0-5)*</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      required
                      placeholder="Baho"
                      v-model.number="gradingInputMap[sub._id]"
                      class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div class="sm:col-span-1">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Izoh/Fikr (Feedback)</label>
                    <input
                      type="text"
                      placeholder="Yaxshi yoki kamchiliklar..."
                      v-model="feedbackInputMap[sub._id]"
                      class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div class="sm:col-span-1">
                    <button
                      type="submit"
                      class="w-full text-center py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs transition-colors"
                    >
                      Baholash va Saqlash
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL: Edit Lesson Plan -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEditLpModal && editLpData" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showEditLpModal = false">
          <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5" @click.stop>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-white">✏️ Dars rejasini tahrirlash</h2>
                <p class="text-xs text-slate-500">Mavzu, muddat yoki materiallarni o'zgartiring</p>
              </div>
              <button @click="showEditLpModal = false" class="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
            </div>

            <form @submit.prevent="submitEditLessonPlan" class="space-y-4">
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Mavzu*</label>
                <input v-model="editLpData.topic" type="text" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Uyga vazifa tavsifi*</label>
                <textarea v-model="editLpData.homeworkDetails" rows="3" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"></textarea>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Muddat (Deadline)*</label>
                <input v-model="editLpData.homeworkDeadline" type="datetime-local" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Yangi materiallar qo'shish (ixtiyoriy)</label>
                <input type="file" multiple @change="handleEditLpFiles" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white file:mr-4 file:rounded file:border-0 file:bg-indigo-600 file:text-white file:px-3 file:py-1 file:text-xs" />
              </div>
              <p v-if="editLpError" class="text-xs text-red-400 font-semibold">{{ editLpError }}</p>
              <button type="submit" :disabled="submittingEditLp" class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs transition-colors disabled:opacity-50">
                {{ submittingEditLp ? 'Saqlanmoqda...' : '✅ O\'zgarishlarni saqlash' }}
              </button>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL: Edit Exam -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEditExamModal && editExamData" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showEditExamModal = false">
          <div class="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5" @click.stop>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-white">✏️ Imtihonni tahrirlash</h2>
                <p class="text-xs text-slate-500">Nomi, sanasi yoki tavsifini o'zgartiring</p>
              </div>
              <button @click="showEditExamModal = false" class="text-slate-400 hover:text-white transition-colors text-xl">✕</button>
            </div>

            <form @submit.prevent="submitEditExam" class="space-y-4">
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Imtihon nomi*</label>
                <input v-model="editExamData.name" type="text" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Sana*</label>
                <input v-model="editExamData.date" type="datetime-local" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tavsif (ixtiyoriy)</label>
                <textarea v-model="editExamData.description" rows="2" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"></textarea>
              </div>
              <p v-if="editExamError" class="text-xs text-red-400 font-semibold">{{ editExamError }}</p>
              <button type="submit" :disabled="submittingEditExam" class="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs transition-colors disabled:opacity-50">
                {{ submittingEditExam ? 'Saqlanmoqda...' : '✅ O\'zgarishlarni saqlash' }}
              </button>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'

definePageMeta({ layout: "admin" })

// State vars
const todayFormatted = ref("")
const formatDays = (days: string): string => {
  if (!days) return ""
  const map: Record<string, string> = {
    'ODD': 'Duy, Chor, Jum',
    'EVEN': 'Se, Pay, Shan',
    'EVERYDAY': 'Har kuni',
    'CUSTOM': 'Maxsus jadval'
  }
  return map[days] || days
}

const loadingGroups = ref(false)
const myGroups = ref<any[]>([])
const todaysClasses = ref<any[]>([])
const summaryStats = reactive({
  todaysClassesCount: 0,
  pendingHomeworksCount: 0,
  showHomeworkAlert: false,
  upcomingExamsCount: 0
})

// Modals toggles
const showGroupDetailsModal = ref(false)
const selectedGroup = ref<any>(null)
const currentGroupTab = ref("students")

const showAttendanceModal = ref(false)
const activeAttendanceGroup = ref<any>(null)
const attendanceForm = reactive<Record<string, string>>({})
const submittingAttendance = ref(false)

const showGradesModal = ref(false)
const activeGradesGroup = ref<any>(null)
const gradesTopic = ref("")
const gradesForm = reactive<Record<string, number>>({})
const submittingGrades = ref(false)

const showLessonPlanModal = ref(false)
const activeLpGroup = ref<any>(null)
const lpForm = reactive({
  topic: "",
  homeworkDetails: "",
  homeworkDeadline: ""
})
const lpFiles = ref<File[]>([])
const lpError = ref("")
const submittingLp = ref(false)

const showExamModal = ref(false)
const activeExamGroup = ref<any>(null)
const examForm = reactive({
  name: "",
  date: ""
})
const submittingExam = ref(false)

const showExamResultsModal = ref(false)
const activeExamResults = ref<any>(null)
const examGroupStudents = ref<any[]>([])
const examResultsForm = reactive<Record<string, number>>({})
const submittingExamResults = ref(false)

const previewResults = ref<any[]>([])
const loadingPreview = ref(false)
const closingGroup = ref(false)

const showPendingHomeworksModal = ref(false)
const loadingPendingSubmissions = ref(false)
const pendingSubmissions = ref<any[]>([])
const gradingInputMap = reactive<Record<string, number>>({})
const feedbackInputMap = reactive<Record<string, string>>({})

// Inner Group history
const loadingGroupLessonPlans = ref(false)
const groupLessonPlans = ref<any[]>([])
const loadingExams = ref(false)
const groupExams = ref<any[]>([])

// Edit Lesson Plan state
const showEditLpModal = ref(false)
const editLpData = ref<any>(null)
const editLpFiles = ref<File[]>([])
const editLpError = ref('')
const submittingEditLp = ref(false)

// Edit Exam state
const showEditExamModal = ref(false)
const editExamData = ref<any>(null)
const editExamError = ref('')
const submittingEditExam = ref(false)

// Fetch Dashboard stats & schedule
const fetchSummary = async () => {
  try {
    const token = useCookie("auth_token").value
    const response: any = await $fetch("/api/teacher/dashboard/summary", {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (response?.status === 'success') {
      const { summary, todaysClasses: classes } = response.data
      summaryStats.todaysClassesCount = summary.todaysClassesCount
      summaryStats.pendingHomeworksCount = summary.pendingHomeworksCount
      summaryStats.showHomeworkAlert = summary.showHomeworkAlert
      summaryStats.upcomingExamsCount = summary.upcomingExamsCount
      todaysClasses.value = classes || []
    }
  } catch (err) {
    console.error("Dashboard summary yuklashda xatolik:", err)
  }
}

// Fetch all groups assigned to teacher
const fetchMyGroups = async () => {
  loadingGroups.value = true
  try {
    const token = useCookie("auth_token").value
    const response: any = await $fetch("/api/v1/groups/my-groups", {
      headers: { Authorization: `Bearer ${token}` }
    })
    myGroups.value = response.data?.groups || []
  } catch (err) {
    console.error("Guruhlarni yuklashda xatolik:", err)
  } finally {
    loadingGroups.value = false
  }
}

// Group Detailed Views
const viewGroupDetails = async (group: any) => {
  selectedGroup.value = group
  currentGroupTab.value = "students"
  showGroupDetailsModal.value = true
  
  // Load past lesson plans
  fetchGroupLessonPlans(group._id)
  // Load group exams
  fetchGroupExams(group._id)
}

watch(currentGroupTab, (newTab) => {
  if (newTab === 'finalResults' && selectedGroup.value) {
    if (selectedGroup.value.status === 'CLOSED') {
      previewResults.value = sortedFinalResults(selectedGroup.value.finalResults)
    } else {
      fetchPreviewResults(selectedGroup.value._id)
    }
  }
})

const fetchPreviewResults = async (groupId: string) => {
  loadingPreview.value = true
  try {
    const token = useCookie("auth_token").value
    const res: any = await $fetch(`/api/teacher/dashboard/groups/${groupId}/preview-results`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    previewResults.value = res.data.preview || []
  } catch (err) {
    console.error("Natijalarni yuklashda xatolik:", err)
  } finally {
    loadingPreview.value = false
  }
}

const fetchGroupLessonPlans = async (groupId: string) => {
  loadingGroupLessonPlans.value = true
  try {
    const token = useCookie("auth_token").value
    const response: any = await $fetch(`/api/teacher/dashboard/groups/${groupId}/lesson-plans`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    groupLessonPlans.value = response.data?.lessonPlans || []
  } catch (err) {
    console.error("Darslarni yuklashda xatolik:", err)
  } finally {
    loadingGroupLessonPlans.value = false
  }
}

const fetchGroupExams = async (groupId: string) => {
  loadingExams.value = true
  try {
    const token = useCookie("auth_token").value
    const response: any = await $fetch(`/api/v1/groups/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    // Get exams from DB filter
    const examsResponse: any = await $fetch("/api/teacher/dashboard/summary", {
      headers: { Authorization: `Bearer ${token}` }
    })
    // Filter exams for this group
    const allExams = examsResponse?.data?.upcomingExams || []
    groupExams.value = allExams.filter((e: any) => e.group?._id === groupId)
  } catch (err) {
    console.error("Imtihonlarni yuklashda xatolik:", err)
  } finally {
    loadingExams.value = false
  }
}

// Modals Init
const openAttendanceModal = (group: any) => {
  activeAttendanceGroup.value = group
  // Pre-fill attendance map with PRESENT
  group.students.forEach((s: any) => {
    attendanceForm[s._id] = "PRESENT"
  })
  showAttendanceModal.value = true
}

const submitAttendance = async () => {
  submittingAttendance.value = true
  try {
    const token = useCookie("auth_token").value
    await $fetch("/api/v1/teachers/attendance", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: {
        group: activeAttendanceGroup.value._id,
        date: new Date().toISOString(),
        statusMap: attendanceForm
      }
    })
    alert("Davomat muvaffaqiyatli saqlandi!")
    showAttendanceModal.value = false
  } catch (err: any) {
    alert(err?.data?.message || "Davomatni saqlashda xatolik yuz berdi")
  } finally {
    submittingAttendance.value = false
  }
}

const openGradesModal = (group: any) => {
  activeGradesGroup.value = group
  gradesTopic.value = ""
  // Clear grades map
  group.students.forEach((s: any) => {
    gradesForm[s._id] = 0
  })
  showGradesModal.value = true
}

const submitGrades = async () => {
  if (!gradesTopic.value.trim()) return
  submittingGrades.value = true
  try {
    const token = useCookie("auth_token").value
    await $fetch("/api/v1/teachers/grades", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: {
        group: activeGradesGroup.value._id,
        topic: gradesTopic.value,
        date: new Date().toISOString(),
        gradesMap: gradesForm
      }
    })
    alert("Baholar muvaffaqiyatli qo'yildi!")
    showGradesModal.value = false
  } catch (err: any) {
    alert(err?.data?.message || "Baholarni saqlashda xatolik yuz berdi")
  } finally {
    submittingGrades.value = false
  }
}

// Lesson Plan addition (Multi-file uploads)
const openLessonPlanModal = (group: any) => {
  activeLpGroup.value = group
  lpForm.topic = ""
  lpForm.homeworkDetails = ""
  lpForm.homeworkDeadline = ""
  lpFiles.value = []
  lpError.value = ""
  showLessonPlanModal.value = true
}

const handleLpFileUpload = (e: any) => {
  const selectedFiles = e.target.files
  if (selectedFiles) {
    lpFiles.value = Array.from(selectedFiles)
  }
}

const submitLessonPlan = async () => {
  if (!lpForm.topic || !lpForm.homeworkDetails || !lpForm.homeworkDeadline) return
  submittingLp.value = true
  lpError.value = ""
  try {
    const token = useCookie("auth_token").value
    
    // Create multipart FormData
    const formData = new FormData()
    formData.append("group", activeLpGroup.value._id)
    formData.append("topic", lpForm.topic)
    formData.append("homeworkDetails", lpForm.homeworkDetails)
    formData.append("homeworkDeadline", lpForm.homeworkDeadline)
    
    lpFiles.value.forEach((file) => {
      formData.append("materials", file)
    })

    await $fetch("/api/teacher/dashboard/lesson-plans", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
        // Nuxt $fetch setting boundary headers dynamically for FormData
      },
      body: formData
    })

    alert("Dars rejasi va vazifalar muvaffaqiyatli yuklandi!")
    showLessonPlanModal.value = false
    
    // Refresh lists
    fetchSummary()
    if (selectedGroup.value?._id === activeLpGroup.value._id) {
      fetchGroupLessonPlans(activeLpGroup.value._id)
    }
  } catch (err: any) {
    lpError.value = err?.data?.message || "Dars rejasini yuklashda xatolik yuz berdi"
  } finally {
    submittingLp.value = false
  }
}

// Exams announcement
const openExamModal = (group: any) => {
  activeExamGroup.value = group
  examForm.name = ""
  examForm.date = ""
  showExamModal.value = true
}

const submitExam = async () => {
  submittingExam.value = true
  try {
    const token = useCookie("auth_token").value
    await $fetch("/api/v1/teachers/exams", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: {
        group: activeExamGroup.value._id,
        name: examForm.name,
        date: examForm.date,
        resultsMap: {} // Initially empty results
      }
    })
    alert("Imtihon muvaffaqiyatli rejalashtirildi va e'lon qilindi!")
    showExamModal.value = false
    fetchSummary()
    if (selectedGroup.value?._id === activeExamGroup.value._id) {
      fetchGroupExams(activeExamGroup.value._id)
    }
  } catch (err: any) {
    alert(err?.data?.message || "Imtihon yaratishda xatolik")
  } finally {
    submittingExam.value = false
  }
}

// Exam results entry
const openExamResultsModal = async (exam: any) => {
  activeExamResults.value = exam
  examGroupStudents.value = []
  
  // Clear exam results map
  examResultsForm.uid = 0 // clear reactivity
  
  // Fetch group to get students
  try {
    const token = useCookie("auth_token").value
    const groupResp: any = await $fetch(`/api/v1/groups/${exam.group?._id || exam.group}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const students = groupResp.data?.group?.students || []
    examGroupStudents.value = students
    students.forEach((s: any) => {
      examResultsForm[s._id] = exam.results?.find((r: any) => r.student === s._id)?.score || 0
    })
  } catch (err) {
    console.error("Guruh o'quvchilarini yuklashda xatolik:", err)
  }

  showExamResultsModal.value = true
}

const submitExamResults = async () => {
  submittingExamResults.value = true
  try {
    const token = useCookie("auth_token").value
    await $fetch("/api/v1/teachers/exams", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: {
        group: activeExamResults.value.group?._id || activeExamResults.value.group,
        name: activeExamResults.value.name,
        date: activeExamResults.value.date,
        resultsMap: examResultsForm
      }
    })
    alert("Imtihon natijalari saqlandi!")
    showExamResultsModal.value = false
  } catch (err: any) {
    alert(err?.data?.message || "Natijalarni saqlashda xatolik")
  } finally {
    submittingExamResults.value = false
  }
}

// Preview and Close Group
const calculateTotalPreview = (res: any) => {
  const cwPct = res.classworkScore || 0
  const hwPct = res.homeworkScore || 0
  let combinedDaily = 0
  if (cwPct > 0 && hwPct > 0) combinedDaily = (cwPct + hwPct) / 2
  else if (cwPct > 0) combinedDaily = cwPct
  else if (hwPct > 0) combinedDaily = hwPct

  const midScore = res.midtermScore || 0
  const finalScore = res.finalScore || 0

  return (combinedDaily * 0.4) + (midScore * 0.3) + (finalScore * 0.3)
}

const saveAndCloseGroup = async () => {
  if (!selectedGroup.value) return
  if (!confirm("Haqiqatan ham ushbu guruhni yopib, barcha natijalarni saqlamoqchimisiz? Guruh yopilgach, natijalarni o'zgartirib bo'lmaydi.")) return
  
  closingGroup.value = true
  try {
    const token = useCookie("auth_token").value
    
    // First, save the exam percentages using the existing endpoint
    const gradesPayload = previewResults.value.map(res => ({
      studentId: res.student,
      midtermScore: res.midtermScore || 0,
      finalScore: res.finalScore || 0
    }))
    
    await $fetch(`/api/teacher/dashboard/groups/${selectedGroup.value._id}/exam-percentages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: { grades: gradesPayload }
    })

    // Then, close the group
    const res: any = await $fetch(`/api/teacher/dashboard/groups/${selectedGroup.value._id}/close`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    })
    
    alert("Guruh muvaffaqiyatli yopildi va natijalar hisoblandi!")
    selectedGroup.value.status = 'CLOSED'
    selectedGroup.value.finalResults = res.data.finalResults
    previewResults.value = sortedFinalResults(selectedGroup.value.finalResults)
  } catch (err: any) {
    alert(err?.data?.message || "Xatolik yuz berdi")
  } finally {
    closingGroup.value = false
  }
}

const sortedFinalResults = (results: any[]) => {
  if (!results) return []
  return [...results].sort((a, b) => a.rank - b.rank)
}

const getStudentName = (group: any, studentId: string) => {
  const student = group.students?.find((s: any) => s._id === studentId || s === studentId)
  return student?.user ? `${student.user.firstname} ${student.user.lastname}` : 'Noma\'lum o\'quvchi'
}

// Pending Homeworks submissions grading
const openPendingHomeworksModal = async () => {
  loadingPendingSubmissions.value = true
  showPendingHomeworksModal.value = true
  try {
    const token = useCookie("auth_token").value
    const response: any = await $fetch("/api/teacher/dashboard/homework-submissions/pending", {
      headers: { Authorization: `Bearer ${token}` }
    })
    pendingSubmissions.value = response.data?.submissions || []
    
    // Clear forms
    pendingSubmissions.value.forEach((s) => {
      gradingInputMap[s._id] = 0
      feedbackInputMap[s._id] = ""
    })
  } catch (err) {
    console.error("Javoblarni yuklashda xatolik:", err)
  } finally {
    loadingPendingSubmissions.value = false
  }
}

const submitGradeForHomework = async (submissionId: string) => {
  const grade = gradingInputMap[submissionId]
  const feedback = feedbackInputMap[submissionId]

  try {
    const token = useCookie("auth_token").value
    await $fetch(`/api/teacher/dashboard/homework-submissions/${submissionId}/grade`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: { grade, feedback }
    })
    
    alert("Vazifa muvaffaqiyatli baholandi!")
    
    // Remove graded item from local pending array
    pendingSubmissions.value = pendingSubmissions.value.filter((s) => s._id !== submissionId)
    
    // Refresh stats
    fetchSummary()
  } catch (err: any) {
    alert(err?.data?.message || "Baholashda xatolik yuz berdi")
  }
}

// ─── Edit Lesson Plan ───
const openEditLessonPlanModal = (lp: any) => {
  editLpData.value = {
    _id: lp._id,
    topic: lp.topic,
    homeworkDetails: lp.homeworkDetails,
    homeworkDeadline: new Date(lp.homeworkDeadline).toISOString().slice(0, 16),
    groupId: lp.group?._id || lp.group
  }
  editLpFiles.value = []
  editLpError.value = ''
  showEditLpModal.value = true
}

const handleEditLpFiles = (e: Event) => {
  const target = e.target as HTMLInputElement
  editLpFiles.value = target.files ? Array.from(target.files) : []
}

const submitEditLessonPlan = async () => {
  if (!editLpData.value) return
  submittingEditLp.value = true
  editLpError.value = ''
  try {
    const token = useCookie("auth_token").value
    const formData = new FormData()
    formData.append('topic', editLpData.value.topic)
    formData.append('homeworkDetails', editLpData.value.homeworkDetails)
    formData.append('homeworkDeadline', editLpData.value.homeworkDeadline)
    editLpFiles.value.forEach(file => formData.append('materials', file))

    await $fetch(`/api/teacher/dashboard/lesson-plans/${editLpData.value._id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })

    alert('Dars rejasi muvaffaqiyatli yangilandi!')
    showEditLpModal.value = false

    // Refresh lesson plans list
    if (editLpData.value.groupId) {
      fetchGroupLessonPlans(editLpData.value.groupId)
    }
  } catch (err: any) {
    editLpError.value = err?.data?.message || "Yangilashda xatolik yuz berdi"
  } finally {
    submittingEditLp.value = false
  }
}

// ─── Edit Exam ───
const openEditExamModal = (exam: any) => {
  editExamData.value = {
    _id: exam._id,
    name: exam.name,
    date: new Date(exam.date).toISOString().slice(0, 16),
    description: exam.description || '',
    groupId: exam.group?._id || exam.group
  }
  editExamError.value = ''
  showEditExamModal.value = true
}

const submitEditExam = async () => {
  if (!editExamData.value) return
  submittingEditExam.value = true
  editExamError.value = ''
  try {
    const token = useCookie("auth_token").value
    await $fetch(`/api/teacher/dashboard/exams/${editExamData.value._id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: {
        name: editExamData.value.name,
        date: editExamData.value.date,
        description: editExamData.value.description
      }
    })

    alert('Imtihon muvaffaqiyatli yangilandi!')
    showEditExamModal.value = false

    // Refresh exams list
    if (editExamData.value.groupId) {
      fetchGroupExams(editExamData.value.groupId)
    }
  } catch (err: any) {
    editExamError.value = err?.data?.message || "Yangilashda xatolik yuz berdi"
  } finally {
    submittingEditExam.value = false
  }
}

onMounted(() => {
  todayFormatted.value = new Date().toLocaleDateString("uz-UZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  })

  fetchSummary()
  fetchMyGroups()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
