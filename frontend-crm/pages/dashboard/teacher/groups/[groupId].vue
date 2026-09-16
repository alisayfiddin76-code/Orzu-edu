
<template>
  <div class="bg-[#0f172a] text-slate-300 font-sans min-h-[90vh] pb-12 selection:bg-indigo-500 selection:text-white rounded-3xl -mx-4 -my-4 md:-mx-8 md:-my-6 px-4 py-6 md:px-8 shadow-inner border border-slate-800">
    <div class="max-w-6xl mx-auto">
      
      <div class="mb-4">
        <NuxtLink to="/dashboard/teacher" class="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition mb-4 group">
          <Icon name="lucide:arrow-left" class="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Dashboardga qaytish
        </NuxtLink>
      </div>

      <div v-if="loading" class="flex justify-center items-center py-24">
        <div class="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>

      <div v-else-if="error" class="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
        {{ error }}
      </div>

      <template v-else-if="groupData">
        <div class="bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700/50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p class="text-indigo-400 text-xs font-bold tracking-widest uppercase mb-1">{{ groupData.course?.title || 'Kurs' }}</p>
            <h1 class="text-3xl font-bold text-white mb-2">{{ groupData.title }}</h1>
            <div class="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <span class="flex items-center gap-1.5"><Icon name="lucide:clock" class="w-4 h-4" /> {{ groupData.start_time || '—' }} – {{ groupData.end_time || '—' }}</span>
              <span class="w-1 h-1 bg-slate-600 rounded-full"></span>
              <span class="flex items-center gap-1.5"><Icon name="lucide:calendar" class="w-4 h-4" /> {{ formatDays(groupData.days) }}</span>
              <span v-if="groupData.room" class="w-1 h-1 bg-slate-600 rounded-full"></span>
              <span v-if="groupData.room" class="flex items-center gap-1.5"><Icon name="lucide:door-open" class="w-4 h-4" /> {{ groupData.room }}</span>
            </div>
          </div>
          
          <div class="bg-slate-900 border border-slate-700 rounded-xl px-6 py-3 text-center flex flex-col items-center justify-center min-w-[100px]">
            <span class="text-3xl font-black text-white">{{ students.length }}</span>
            <span class="text-xs text-slate-400 font-medium uppercase tracking-wide">O'quvchi</span>
          </div>
        </div>

        <div class="mt-8 flex gap-2 overflow-x-auto border-b border-slate-800 pb-px scrollbar-hide">
          <button @click="activeTab = 'students'" :class="activeTab === 'students' ? 'text-indigo-400 bg-slate-800 border-t-2 border-indigo-500' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'" class="px-5 py-3 text-sm font-medium rounded-t-lg transition flex items-center gap-2 whitespace-nowrap">
            <Icon name="lucide:users" class="w-4 h-4" /> O'quvchilar
          </button>
          <button @click="activeTab = 'attendance'" :class="activeTab === 'attendance' ? 'text-indigo-400 bg-slate-800 border-t-2 border-indigo-500' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'" class="px-5 py-3 text-sm font-medium rounded-t-lg transition flex items-center gap-2 whitespace-nowrap">
            <Icon name="lucide:clipboard-check" class="w-4 h-4" /> Davomat
          </button>
          <button @click="activeTab = 'grades'" :class="activeTab === 'grades' ? 'text-indigo-400 bg-slate-800 border-t-2 border-indigo-500' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'" class="px-5 py-3 text-sm font-medium rounded-t-lg transition flex items-center gap-2 whitespace-nowrap">
            <Icon name="lucide:star" class="w-4 h-4" /> Baholash
          </button>
          <button @click="activeTab = 'homework'" :class="activeTab === 'homework' ? 'text-indigo-400 bg-slate-800 border-t-2 border-indigo-500' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'" class="px-5 py-3 text-sm font-medium rounded-t-lg transition flex items-center gap-2 whitespace-nowrap">
            <Icon name="lucide:upload-cloud" class="w-4 h-4" /> Vazifa / Material
          </button>
          <button @click="activeTab = 'exams'" :class="activeTab === 'exams' ? 'text-indigo-400 bg-slate-800 border-t-2 border-indigo-500' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'" class="px-5 py-3 text-sm font-medium rounded-t-lg transition flex items-center gap-2 whitespace-nowrap">
            <Icon name="lucide:calendar-days" class="w-4 h-4" /> Imtihonlar
          </button>
          <button @click="activeTab = 'finalResults'" :class="activeTab === 'finalResults' ? 'text-indigo-400 bg-slate-800 border-t-2 border-indigo-500' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'" class="px-5 py-3 text-sm font-medium rounded-t-lg transition flex items-center gap-2 whitespace-nowrap">
            <Icon name="lucide:award" class="w-4 h-4" /> Yakuniy Natijalar
          </button>
        </div>

        <!-- TAB 1: O'QUVCHILAR -->
        <div v-if="activeTab === 'students'" class="mt-6 bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 p-6 md:p-8">
          <h2 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span class="bg-indigo-500/20 p-2 rounded-lg"><Icon name="lucide:users" class="w-5 h-5 text-indigo-400" /></span>
            O'quvchilar ro'yxati
          </h2>

          <div v-if="students.length === 0" class="p-8 text-center text-slate-500 text-sm rounded-2xl bg-[#0f172a] border border-slate-700">
            Bu guruhda hali o'quvchi yo'q.
          </div>

          <div v-else class="overflow-x-auto rounded-xl border border-slate-700">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
                  <th class="text-left px-5 py-4">#</th>
                  <th class="text-left px-5 py-4">Ism Familya</th>
                  <th class="text-left px-5 py-4">Telefon</th>
                  <th class="text-left px-5 py-4">O'rtacha baho</th>
                  <th class="text-left px-5 py-4">So'nggi davomat</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-700/60 bg-[#0f172a]/30">
                <tr v-for="(s, idx) in students" :key="s._id" class="hover:bg-slate-900/50 transition-colors">
                  <td class="px-5 py-4 text-slate-500">{{ idx + 1 }}</td>
                  <td class="px-5 py-4 font-semibold text-white">{{ s.user?.firstname }} {{ s.user?.lastname }}</td>
                  <td class="px-5 py-4 text-slate-400">{{ s.user?.phone || '—' }}</td>
                  <td class="px-5 py-4">
                    <span v-if="s.avgGrade !== null"
                      :class="Number(s.avgGrade) >= 4 ? 'text-emerald-400' : (Number(s.avgGrade) >= 3 ? 'text-amber-400' : 'text-rose-400')"
                      class="font-bold"
                    >{{ s.avgGrade }}</span>
                    <span v-else class="text-slate-600">—</span>
                  </td>
                  <td class="px-5 py-4">
                    <span v-if="s.lastAttendance"
                      :class="{
                        'text-emerald-400': s.lastAttendance.status === 'PRESENT',
                        'text-rose-400': s.lastAttendance.status === 'ABSENT',
                        'text-amber-400': s.lastAttendance.status === 'LATE',
                      }"
                      class="font-semibold"
                    >
                      {{ statusLabel(s.lastAttendance.status) }}
                      <span class="text-slate-600 font-normal ml-1 text-xs">({{ formatDate(s.lastAttendance.date) }})</span>
                    </span>
                    <span v-else class="text-slate-600">—</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 2: DAVOMAT -->
        <div v-if="activeTab === 'attendance'" class="mt-6 bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 p-6 md:p-8">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 class="text-lg font-semibold text-white flex items-center gap-2">
              <span class="bg-indigo-500/20 p-2 rounded-lg"><Icon name="lucide:clipboard-check" class="w-5 h-5 text-indigo-400" /></span>
              Davomat belgilash
            </h2>
            <div class="flex items-center gap-3">
              <label class="text-sm text-slate-400 font-medium">Sana:</label>
              <div class="relative">
                <input v-model="attendanceDate" type="date"
                  class="bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-inner" />
              </div>
            </div>
          </div>

          <div v-if="students.length === 0" class="p-8 text-center text-slate-500 text-sm rounded-2xl bg-[#0f172a] border border-slate-700">
            Bu guruhda hali o'quvchi yo'q.
          </div>

          <div v-else class="space-y-6">
            <div class="rounded-xl border border-slate-700 overflow-hidden">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
                    <th class="text-left px-5 py-4">O'quvchi</th>
                    <th class="px-5 py-4 text-center w-72">Davomat Holati</th>
                    <th class="text-left px-5 py-4">Izoh</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-700/60 bg-[#0f172a]/30">
                  <tr v-for="s in students" :key="s._id" class="hover:bg-slate-900/50 transition-colors">
                    <td class="px-5 py-4 font-semibold text-white">{{ s.user?.firstname }} {{ s.user?.lastname }}</td>
                    <td class="px-5 py-4 text-center">
                      <div class="inline-flex items-center justify-center bg-slate-900 p-1 rounded-xl border border-slate-700 gap-1">
                        <button
                          @click="attendanceMap[s._id] = 'PRESENT'"
                          :class="attendanceMap[s._id] === 'PRESENT' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'text-slate-400 hover:text-white border-transparent bg-transparent'"
                          class="px-4 py-2 rounded-lg text-xs font-bold border transition-all"
                        >
                          Keldi
                        </button>
                        <button
                          @click="attendanceMap[s._id] = 'ABSENT'"
                          :class="attendanceMap[s._id] === 'ABSENT' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'text-slate-400 hover:text-white border-transparent bg-transparent'"
                          class="px-4 py-2 rounded-lg text-xs font-bold border transition-all"
                        >
                          Kelmadi
                        </button>
                        <button
                          @click="attendanceMap[s._id] = 'LATE'"
                          :class="attendanceMap[s._id] === 'LATE' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'text-slate-400 hover:text-white border-transparent bg-transparent'"
                          class="px-4 py-2 rounded-lg text-xs font-bold border transition-all"
                        >
                          Kechikdi
                        </button>
                      </div>
                    </td>
                    <td class="px-5 py-4">
                      <input v-model="attendanceReasons[s._id]" type="text" placeholder="Izoh (ixtiyoriy)..."
                        class="w-full bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-700/50">
              <div class="flex gap-2">
                <button @click="selectAll('PRESENT')" class="text-xs px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors font-medium">
                  Barchasi keldi
                </button>
                <button @click="selectAll('ABSENT')" class="text-xs px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors font-medium">
                  Barchasi kelmadi
                </button>
              </div>
              <button @click="submitAttendance" :disabled="savingAttendance"
                class="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-8 rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200 flex items-center gap-2 disabled:opacity-50">
                <Icon name="lucide:save" class="w-4 h-4" /> {{ savingAttendance ? 'Saqlanmoqda...' : 'Davomatni saqlash' }}
              </button>
            </div>
            <p v-if="attendanceMsg" :class="attendanceMsgType === 'ok' ? 'text-emerald-400' : 'text-rose-400'" class="text-sm font-medium mt-2 text-right">
              {{ attendanceMsg }}
            </p>
          </div>
        </div>

        <!-- TAB 3: BAHOLASH -->
        <div v-if="activeTab === 'grades'" class="mt-6 bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 p-6 md:p-8">
          <h2 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span class="bg-indigo-500/20 p-2 rounded-lg"><Icon name="lucide:star" class="w-5 h-5 text-indigo-400" /></span>
            O'quvchilarni baholash
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-2">Mavzu / Fan <span class="text-rose-500">*</span></label>
              <input v-model="gradesTopic" type="text" placeholder="Masalan: 3-dars — Funksiyalar"
                class="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-inner" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-2">Sana <span class="text-rose-500">*</span></label>
              <div class="relative">
                <input v-model="gradesDate" type="date"
                  class="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-inner" />
              </div>
            </div>
          </div>

          <div v-if="students.length === 0" class="p-8 text-center text-slate-500 text-sm rounded-2xl bg-[#0f172a] border border-slate-700">
            Bu guruhda hali o'quvchi yo'q.
          </div>
          
          <div v-else class="space-y-6">
            <div class="rounded-xl border border-slate-700 overflow-hidden">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
                    <th class="text-left px-5 py-4">O'quvchi</th>
                    <th class="text-left px-5 py-4 w-48">Baho (0–5)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-700/60 bg-[#0f172a]/30">
                  <tr v-for="s in students" :key="s._id" class="hover:bg-slate-900/50 transition-colors">
                    <td class="px-5 py-4 font-semibold text-white">{{ s.user?.firstname }} {{ s.user?.lastname }}</td>
                    <td class="px-5 py-4">
                      <input v-model.number="gradesMap[s._id]" type="number" min="0" max="5" placeholder="0–5"
                        class="w-24 bg-[#0f172a] border border-slate-700 text-white text-base font-medium rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-center shadow-inner" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex justify-end pt-4 border-t border-slate-700/50">
              <button @click="submitGrades" :disabled="savingGrades || !gradesTopic"
                class="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-8 rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200 flex items-center gap-2 disabled:opacity-50">
                <Icon name="lucide:save" class="w-4 h-4" /> {{ savingGrades ? 'Saqlanmoqda...' : 'Baholarni saqlash' }}
              </button>
            </div>
            <p v-if="gradesMsg" :class="gradesMsgType === 'ok' ? 'text-emerald-400' : 'text-rose-400'" class="text-sm font-medium mt-2 text-right">
              {{ gradesMsg }}
            </p>
          </div>
        </div>

        <!-- TAB 4: VAZIFA VA MATERIALLAR -->
        <div v-if="activeTab === 'homework'" class="mt-6 space-y-6">
          <div class="bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 p-6 md:p-8">
            <h2 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <span class="bg-indigo-500/20 p-2 rounded-lg"><Icon name="lucide:plus" class="w-5 h-5 text-indigo-400" /></span>
                Yangi dars va uy vazifasi yuborish
            </h2>
            
            <form @submit.prevent="submitLessonPlan" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-slate-400 mb-2">Dars mavzusi <span class="text-rose-500">*</span></label>
                        <input v-model="lessonForm.topic" type="text" placeholder="Masalan: JavaScriptda DOM manipulyatsiyasi..." 
                            class="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-inner">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-slate-400 mb-2">Topshirish muddati <span class="text-rose-500">*</span></label>
                        <div class="relative">
                            <!-- Native datetime-local matches the flatpickr styling intent -->
                            <input v-model="lessonForm.homeworkDeadline" type="datetime-local"
                                class="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-inner cursor-pointer" />
                            <Icon name="lucide:calendar-clock" class="absolute left-4 top-3.5 w-5 h-5 text-slate-500 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-400 mb-2">Uy vazifasi tavsifi <span class="text-rose-500">*</span></label>
                    <textarea v-model="lessonForm.homeworkDetails" rows="4" placeholder="O'quvchilarga berilayotgan topshiriq haqida batafsil ma'lumot yozing..." 
                        class="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-inner resize-y"></textarea>
                </div>

                <div>
                    <label class="block text-sm font-medium text-slate-400 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span>Materiallar biriktirish</span>
                        <span class="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">Max: 5 ta fayl (10MB dan)</span>
                    </label>
                    <div class="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center bg-[#0f172a]/50 hover:bg-[#0f172a] hover:border-indigo-500 transition cursor-pointer group"
                      @dragover.prevent @drop.prevent="handleFileDrop" @click="fileInput?.click()">
                        <div class="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                            <Icon name="lucide:cloud-upload" class="w-8 h-8 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <p class="text-slate-300 font-medium text-lg mb-1">Fayllarni bu yerga tashlang yoki bosing</p>
                        <p class="text-slate-500 text-sm">PDF, DOCX, JPG, PNG, WEBP qabul qilinadi</p>
                        <input ref="fileInput" type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" class="hidden" @change="handleFileSelect" />
                    </div>
                    
                    <div v-if="selectedFiles.length > 0" class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div v-for="(file, i) in selectedFiles" :key="i"
                        class="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-700">
                        <div class="flex items-center gap-3 overflow-hidden">
                          <Icon name="lucide:file" class="w-4 h-4 text-indigo-400 shrink-0" />
                          <span class="text-sm text-slate-300 truncate">{{ file.name }}</span>
                        </div>
                        <button type="button" @click.stop="removeFile(i)" class="text-slate-500 hover:text-rose-400 transition p-1">
                          <Icon name="lucide:x" class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                </div>

                <div class="flex justify-end pt-4 border-t border-slate-700/50">
                    <button type="submit" :disabled="savingLesson || !lessonForm.topic || !lessonForm.homeworkDetails || !lessonForm.homeworkDeadline"
                      class="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-8 rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0">
                        <Icon name="lucide:send" class="w-4 h-4" /> {{ savingLesson ? 'Yuborilmoqda...' : 'Vazifani yuborish' }}
                    </button>
                </div>
                <p v-if="lessonMsg" :class="lessonMsgType === 'ok' ? 'text-emerald-400' : 'text-rose-400'" class="text-sm font-medium mt-2 text-right">
                  {{ lessonMsg }}
                </p>
            </form>
          </div>

          <!-- Past lesson plans history -->
          <div class="bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 p-6 md:p-8">
            <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span class="bg-slate-700 p-2 rounded-lg"><Icon name="lucide:history" class="w-5 h-5 text-slate-300" /></span>
              O'tilgan darslar va vazifalar
            </h3>
            
            <div v-if="lessonPlans.length === 0" class="p-8 text-center text-slate-500 text-sm rounded-2xl bg-[#0f172a] border border-slate-700">
              Hali dars rejasi yuklanmagan.
            </div>
            <div v-else class="space-y-4">
              <div v-for="plan in lessonPlans" :key="plan._id"
                class="p-6 rounded-2xl bg-[#0f172a]/50 border border-slate-700 hover:border-slate-600 transition-colors">
                <div class="flex flex-col md:flex-row gap-6">
                  <div class="flex-1 space-y-3">
                    <div>
                      <div class="flex items-center justify-between">
                        <h4 class="text-lg font-semibold text-white">{{ plan.topic }}</h4>
                        <button @click="openEditLessonPlanModal(plan)" class="text-[10px] bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 px-3 py-1.5 rounded transition-colors flex items-center gap-1.5"><Icon name="lucide:edit-3" class="w-3 h-3" /> Tahrirlash</button>
                      </div>
                      <p class="text-xs text-slate-400 mt-1 flex items-center gap-1.5"><Icon name="lucide:calendar" class="w-3.5 h-3.5" /> {{ formatDate(plan.date) }}</p>
                    </div>
                    
                    <div v-if="plan.homeworkDetails" class="bg-slate-900 rounded-xl p-4 border border-slate-800 relative mt-4">
                      <div class="absolute -top-3 left-4 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-indigo-400 uppercase">Topshiriq</div>
                      <p class="text-sm text-slate-300 leading-relaxed mt-1 whitespace-pre-line">
                        {{ plan.homeworkDetails }}
                      </p>
                      <div v-if="plan.homeworkDeadline" class="mt-4 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Icon name="lucide:clock-4" class="w-3.5 h-3.5" /> Muddat: {{ formatDate(plan.homeworkDeadline) }}
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="plan.materials?.length > 0" class="md:w-64 shrink-0 bg-slate-900 rounded-xl p-4 border border-slate-800 h-fit">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Icon name="lucide:paperclip" class="w-3.5 h-3.5" /> Materiallar</p>
                    <div class="flex flex-col gap-2">
                      <a v-for="(mat, i) in plan.materials" :key="i"
                        :href="`${mat}`" target="_blank"
                        class="flex items-center gap-2 p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition group">
                        <Icon name="lucide:file-text" class="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
                        <span class="text-xs text-slate-300 group-hover:text-white truncate flex-1">Fayl {{ i + 1 }}</span>
                        <Icon name="lucide:download" class="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                      </a>
                    </div>
                  </div>
                </div>

                <div class="mt-4 pt-4 border-t border-slate-800 flex justify-end">
                  <button @click="toggleHwSubmissions(plan)" class="px-4 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-semibold transition-colors flex items-center gap-2 text-sm">
                    <Icon :name="activeHwLessonPlanId === plan._id ? 'lucide:chevron-up' : 'lucide:check-square'" class="w-4 h-4" />
                    {{ activeHwLessonPlanId === plan._id ? 'Baholashni yopish' : 'Uyga vazifalarni tekshirish va baholash' }}
                  </button>
                </div>

                <!-- Inline Homework Submissions and Grading -->
                <div v-if="activeHwLessonPlanId === plan._id" class="mt-4 pt-4 border-t border-slate-700 space-y-4">
                  <div class="flex items-center justify-between">
                    <p class="text-sm text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-2">
                      <Icon name="lucide:check-circle" class="w-4 h-4" /> Barcha o'quvchilar natijasi
                    </p>
                    <span v-if="loadingHwSubmissions" class="text-xs text-slate-400 animate-pulse">Yuklanmoqda...</span>
                  </div>
                  
                  <div class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
                    <table class="w-full text-left text-sm">
                      <thead>
                        <tr class="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                          <th class="px-4 py-3">O'quvchi</th>
                          <th class="px-4 py-3">Holati</th>
                          <th class="px-4 py-3">Fayllar</th>
                          <th class="px-4 py-3 w-32 text-center">Baho (0-5)</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-800 text-slate-300">
                        <tr v-for="studentResult in hwSubmissionsList" :key="studentResult.student" class="hover:bg-slate-900/50">
                          <td class="px-4 py-3 font-medium">{{ getStudentName(studentResult.student) }}</td>
                          <td class="px-4 py-3">
                            <span v-if="studentResult.submission" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <Icon name="lucide:check" class="w-3 h-3" /> Jo'natilgan
                            </span>
                            <span v-else class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <Icon name="lucide:x" class="w-3 h-3" /> Topshirilmadi
                            </span>
                          </td>
                          <td class="px-4 py-3">
                            <div v-if="studentResult.submission?.files?.length" class="flex gap-2 flex-wrap">
                              <a v-for="(f, i) in studentResult.submission.files" :key="i" :href="f" target="_blank" class="text-xs text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1">
                                <Icon name="lucide:link" class="w-3 h-3" /> Fayl {{ i + 1 }}
                              </a>
                            </div>
                            <span v-else class="text-xs text-slate-600">—</span>
                          </td>
                          <td class="px-4 py-3">
                            <input v-model.number="hwGradesMap[studentResult.student]" type="number" min="0" max="5" placeholder="0-5"
                              class="w-full bg-[#0f172a] border border-slate-700 text-white text-sm font-bold text-center rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div class="flex justify-end gap-3 pt-2">
                    <button @click="activeHwLessonPlanId = null" class="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium text-sm">
                      Bekor qilish
                    </button>
                    <button @click="saveHwGrades(plan._id)" :disabled="savingHwGrades" class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 text-sm disabled:opacity-50">
                      <Icon name="lucide:save" class="w-4 h-4" /> {{ savingHwGrades ? 'Saqlanmoqda...' : 'Baholarni saqlash' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 5: IMTIHONLAR -->
        <div v-if="activeTab === 'exams'" class="mt-6 space-y-6">
          <div class="bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 p-6 md:p-8">
            <h2 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span class="bg-indigo-500/20 p-2 rounded-lg"><Icon name="lucide:calendar-plus" class="w-5 h-5 text-indigo-400" /></span>
              Yangi imtihon rejalashtirish
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-2">Imtihon nomi <span class="text-rose-500">*</span></label>
                <input v-model="examForm.name" type="text" placeholder="Oraliq imtihon..."
                  class="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-inner" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-2">Sana va vaqt <span class="text-rose-500">*</span></label>
                <div class="relative">
                  <input v-model="examForm.date" type="datetime-local"
                    class="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-inner cursor-pointer" />
                  <Icon name="lucide:calendar-clock" class="absolute left-4 top-3.5 w-5 h-5 text-slate-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-2">Izoh</label>
                <input v-model="examForm.description" type="text" placeholder="Qo'shimcha ma'lumot..."
                  class="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-inner" />
              </div>
            </div>

            <div class="flex justify-end pt-4 border-t border-slate-700/50">
              <button @click="scheduleExam" :disabled="savingExam || !examForm.name || !examForm.date"
                class="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-8 rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-200 flex items-center gap-2 disabled:opacity-50">
                <Icon name="lucide:calendar-plus" class="w-4 h-4" /> {{ savingExam ? 'Saqlanmoqda...' : 'Imtihonni rejalashtirish' }}
              </button>
            </div>
            <p v-if="examMsg" :class="examMsgType === 'ok' ? 'text-emerald-400' : 'text-rose-400'" class="text-sm font-medium mt-2 text-right">
              {{ examMsg }}
            </p>
          </div>

          <div class="bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 p-6 md:p-8">
            <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span class="bg-slate-700 p-2 rounded-lg"><Icon name="lucide:award" class="w-5 h-5 text-slate-300" /></span>
              Rejalashtirilgan imtihonlar
            </h3>
            
            <div v-if="upcomingExams.length === 0" class="p-8 text-center text-slate-500 text-sm rounded-2xl bg-[#0f172a] border border-slate-700">
              Yaqinlashayotgan imtihon yo'q.
            </div>
            <div v-else class="space-y-4">
              <div v-for="exam in upcomingExams" :key="exam._id"
                class="p-6 rounded-2xl bg-[#0f172a]/50 border border-slate-700 transition-colors">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 class="text-lg font-semibold text-white">{{ exam.name }}</h4>
                    <p class="text-sm text-slate-400 mt-1 flex items-center gap-1.5"><Icon name="lucide:calendar-clock" class="w-4 h-4" /> {{ formatDate(exam.date) }}</p>
                    <p v-if="exam.description" class="text-sm text-slate-500 mt-2 bg-slate-900 rounded-lg px-3 py-2 border border-slate-800">{{ exam.description }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button @click="openEditExamModal(exam)"
                      class="shrink-0 px-4 py-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-300 font-semibold transition-colors flex items-center gap-2">
                      <Icon name="lucide:edit-3" class="w-4 h-4" /> Tahrirlash
                    </button>
                    <button @click="toggleExamResults(exam)"
                      class="shrink-0 px-5 py-2.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-semibold transition-colors flex items-center gap-2">
                      <Icon :name="activeExamResultsId === exam._id ? 'lucide:chevron-up' : 'lucide:check-circle'" class="w-4 h-4" />
                      {{ activeExamResultsId === exam._id ? 'Yopish' : 'Natijalar kiritish' }}
                    </button>
                  </div>
                </div>

                <!-- Inline results entry -->
                <div v-if="activeExamResultsId === exam._id" class="mt-6 space-y-4 border-t border-slate-700 pt-6">
                  <p class="text-sm text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-2">
                    <Icon name="lucide:edit-3" class="w-4 h-4" /> O'quvchilar natijalarini baholang (0–5)
                  </p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="s in students" :key="s._id" class="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span class="text-sm font-medium text-white">{{ s.user?.firstname }} {{ s.user?.lastname }}</span>
                      <input v-model.number="examResultsMap[s._id]" type="number" min="0" max="5" placeholder="0–5"
                        class="w-20 bg-[#0f172a] border border-slate-700 text-white text-sm font-bold text-center rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner" />
                    </div>
                  </div>
                  <div class="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <button @click="activeExamResultsId = null"
                      class="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium">
                      Bekor qilish
                    </button>
                    <button @click="saveExamResults(exam._id)" :disabled="savingExamResults"
                      class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50">
                      <Icon name="lucide:save" class="w-4 h-4" /> {{ savingExamResults ? 'Saqlanmoqda...' : 'Saqlash' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 6: FINAL RESULTS (YAKUNIY NATIJALAR) -->
        <div v-if="activeTab === 'finalResults'" class="mt-6 space-y-6">
          <div class="bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 p-6 md:p-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-semibold text-white flex items-center gap-2">
                <span class="bg-indigo-500/20 p-2 rounded-lg"><Icon name="lucide:award" class="w-5 h-5 text-indigo-400" /></span>
                Yakuniy Natijalar va Guruhni Yopish
              </h2>
              <div class="flex gap-2">
                <button v-if="groupData.status !== 'CLOSED'" @click="saveAndCloseGroup" :disabled="closingGroup" class="text-sm bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-rose-600/20 transition-all font-bold disabled:opacity-50">
                  {{ closingGroup ? 'Saqlanmoqda...' : 'Guruhni Yopish & Natijalarni Saqlash' }}
                </button>
              </div>
            </div>

            <div v-if="groupData.status === 'CLOSED'">
              <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-4 font-medium flex items-center gap-2">
                <Icon name="lucide:check-circle" class="w-5 h-5" /> Guruh muvaffaqiyatli yopilgan va yakuniy natijalar saqlangan.
              </div>
            </div>
            <div v-else>
              <div class="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-4 font-medium">
                <Icon name="lucide:info" class="w-5 h-5 inline mr-1" /> Quyidagi jadvalda o'quvchilarning joriy o'zlashtirishi (Kundalik 40%) ko'rsatilgan. Oraliq (30%) va Yakuniy (30%) baholarni (100 ballik tizimda) kiritib <strong>Guruhni Yopish</strong> tugmasini bosing.
              </div>
            </div>
              
            <div class="overflow-x-auto rounded-xl border border-slate-700">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
                    <th class="text-left px-5 py-4">O'rin</th>
                    <th class="text-left px-5 py-4">O'quvchi</th>
                    <th class="text-center px-5 py-4">Kundalik (20%)</th>
                    <th class="text-center px-5 py-4">Davomat (10%)</th>
                    <th class="text-center px-5 py-4">Oraliq (40%)</th>
                    <th class="text-center px-5 py-4">Yakuniy (60%)</th>
                    <th class="text-center px-5 py-4 font-bold text-white">Umumiy (100%)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-700/60 bg-[#0f172a]/30">
                  <tr v-for="(res, index) in previewResults" :key="res.student" class="hover:bg-slate-900/50 transition-colors">
                    <td class="px-5 py-4 font-bold text-white">#{{ groupData.status === 'CLOSED' ? res.rank : index + 1 }}</td>
                    <td class="px-5 py-4 font-semibold text-white">{{ getStudentName(res.student) }}</td>
                    <td class="px-5 py-4 text-center">
                      <div class="flex flex-col items-center justify-center">
                        <span class="text-indigo-400 font-bold text-lg">{{ res.dailyScore }}%</span>
                      </div>
                    </td>
                    
                    <td class="px-5 py-4 text-center">
                      <div class="flex flex-col items-center justify-center">
                        <span class="text-amber-400 font-bold text-lg">{{ res.attendanceScore }}%</span>
                      </div>
                    </td>
                    
                    <td class="px-5 py-4 text-center" v-if="groupData.status !== 'CLOSED'">
                      <input type="number" min="0" max="100" placeholder="0-100" v-model.number="res.midtermScore" class="w-20 bg-[#0f172a] border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-center shadow-inner" />
                    </td>
                    <td class="px-5 py-4 text-center font-medium" v-if="groupData.status === 'CLOSED'">{{ res.midtermScore }}%</td>
                    
                    <td class="px-5 py-4 text-center" v-if="groupData.status !== 'CLOSED'">
                      <input type="number" min="0" max="100" placeholder="0-100" v-model.number="res.finalScore" class="w-20 bg-[#0f172a] border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-center shadow-inner" />
                    </td>
                    <td class="px-5 py-4 text-center font-medium" v-if="groupData.status === 'CLOSED'">{{ res.finalScore }}%</td>
                    
                    <td class="px-5 py-4 text-center text-lg font-bold" :class="calculateTotalPreview(res) >= 80 ? 'text-emerald-400' : calculateTotalPreview(res) >= 60 ? 'text-amber-400' : 'text-rose-400'">
                      {{ calculateTotalPreview(res).toFixed(1) }}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </template>

      <!-- MODAL: Edit Lesson Plan -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="showEditLpModal && editLpData" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showEditLpModal = false">
            <div class="bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5" @click.stop>
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
            <div class="bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5" @click.stop>
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
  </div>
</template>
<script setup lang="ts">
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

const route = useRoute()
const groupId = route.params.groupId as string
const API = ''
const token = useCookie('auth_token')

const loading = ref(true)
const error = ref<string | null>(null)

const groupData = ref<any>(null)
const students = ref<any[]>([])
const lessonPlans = ref<any[]>([])
const upcomingExams = ref<any[]>([])

const activeTab = ref('students')
const tabs = [
  { id: 'students', label: "O'quvchilar", icon: '👥' },
  { id: 'attendance', label: 'Davomat', icon: '📋' },
  { id: 'grades', label: 'Baholash', icon: '⭐' },
  { id: 'homework', label: 'Vazifa/Material', icon: '📤' },
  { id: 'exams', label: 'Imtihonlar', icon: '🗓' },
]

// ─── Attendance ─────────────────────────────────────────
const attendanceDate = ref(new Date().toISOString().split('T')[0])
const attendanceMap = ref<Record<string, string>>({})
const attendanceReasons = ref<Record<string, string>>({})
const savingAttendance = ref(false)
const attendanceMsg = ref('')
const attendanceMsgType = ref<'ok' | 'err'>('ok')

// ─── Grades ─────────────────────────────────────────────
const gradesTopic = ref('')
const gradesDate = ref(new Date().toISOString().split('T')[0])
const gradesMap = ref<Record<string, number>>({})
const savingGrades = ref(false)
const gradesMsg = ref('')
const gradesMsgType = ref<'ok' | 'err'>('ok')

// ─── Lesson Plan ────────────────────────────────────────
const lessonForm = ref({ topic: '', homeworkDetails: '', homeworkDeadline: '' })
const selectedFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const savingLesson = ref(false)
const lessonMsg = ref('')
const lessonMsgType = ref<'ok' | 'err'>('ok')

// ─── Homework Submissions & Grading ───────────────────────
const activeHwLessonPlanId = ref<string | null>(null)
const hwSubmissionsList = ref<any[]>([])
const hwGradesMap = ref<Record<string, number | null>>({})
const loadingHwSubmissions = ref(false)
const savingHwGrades = ref(false)

// ─── Exams ──────────────────────────────────────────────
const examForm = ref({ name: '', date: '', description: '' })
const savingExam = ref(false)
const examMsg = ref('')
const examMsgType = ref<'ok' | 'err'>('ok')
const activeExamResultsId = ref<string | null>(null)
const examResultsMap = ref<Record<string, number>>({})
const savingExamResults = ref(false)

// ─── Final Results ──────────────────────────────────────────
const previewResults = ref<any[]>([])
const loadingPreview = ref(false)
const closingGroup = ref(false)

// ─── Fetch data ──────────────────────────────────────────
const fetchGroupData = async () => {
  loading.value = true
  error.value = null
  try {
    const resp: any = await $fetch(`${API}/api/teacher/dashboard/groups/${groupId}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    groupData.value = resp.data.group
    students.value = resp.data.students || []
    lessonPlans.value = resp.data.lessonPlans || []
    upcomingExams.value = resp.data.upcomingExams || []

    // Init maps
    students.value.forEach((s: any) => {
      attendanceMap.value[s._id] = 'PRESENT'
      attendanceReasons.value[s._id] = ''
      gradesMap.value[s._id] = 0
      examResultsMap.value[s._id] = 0
    })
  } catch (err: any) {
    error.value = err?.data?.message || "Guruh ma'lumotlarini yuklashda xatolik"
  } finally {
    loading.value = false
  }
}

// ─── Attendance ──────────────────────────────────────────
const selectAll = (status: string) => {
  students.value.forEach((s: any) => { attendanceMap.value[s._id] = status })
}

const submitAttendance = async () => {
  savingAttendance.value = true
  attendanceMsg.value = ''
  try {
    const records = students.value.map((s: any) => ({
      student: s._id,
      status: attendanceMap.value[s._id] || 'PRESENT',
      reason: attendanceReasons.value[s._id] || ''
    }))
    await $fetch(`${API}/api/teacher/dashboard/groups/${groupId}/attendance`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}`, 'Content-Type': 'application/json' },
      body: { date: attendanceDate.value, records }
    })
    attendanceMsg.value = '✅ Davomat muvaffaqiyatli saqlandi!'
    attendanceMsgType.value = 'ok'
  } catch (err: any) {
    attendanceMsg.value = err?.data?.message || 'Saqlashda xatolik'
    attendanceMsgType.value = 'err'
  } finally {
    savingAttendance.value = false
    setTimeout(() => { attendanceMsg.value = '' }, 4000)
  }
}

// ─── Grades ──────────────────────────────────────────────
const submitGrades = async () => {
  if (!gradesTopic.value.trim()) return
  savingGrades.value = true
  gradesMsg.value = ''
  try {
    const records = students.value
      .filter((s: any) => gradesMap.value[s._id] !== undefined && gradesMap.value[s._id] > 0)
      .map((s: any) => ({ student: s._id, value: gradesMap.value[s._id] }))

    await $fetch(`${API}/api/teacher/dashboard/groups/${groupId}/grades`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}`, 'Content-Type': 'application/json' },
      body: { topic: gradesTopic.value, date: gradesDate.value, records }
    })
    gradesMsg.value = '✅ Baholar muvaffaqiyatli saqlandi!'
    gradesMsgType.value = 'ok'
    await fetchGroupData()
  } catch (err: any) {
    gradesMsg.value = err?.data?.message || 'Saqlashda xatolik'
    gradesMsgType.value = 'err'
  } finally {
    savingGrades.value = false
    setTimeout(() => { gradesMsg.value = '' }, 4000)
  }
}

// ─── Files ────────────────────────────────────────────────
const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files) addFiles(Array.from(input.files))
}

const handleFileDrop = (e: DragEvent) => {
  if (e.dataTransfer?.files) addFiles(Array.from(e.dataTransfer.files))
}

const ALLOWED_TYPES = [
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp'
]

const addFiles = (files: File[]) => {
  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) continue
    if (selectedFiles.value.length >= 5) break
    selectedFiles.value.push(file)
  }
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

// ─── Lesson Plan ──────────────────────────────────────────
const submitLessonPlan = async () => {
  if (!lessonForm.value.topic || !lessonForm.value.homeworkDetails || !lessonForm.value.homeworkDeadline) return
  savingLesson.value = true
  lessonMsg.value = ''
  try {
    const formData = new FormData()
    formData.append('group', groupId)
    formData.append('topic', lessonForm.value.topic)
    formData.append('homeworkDetails', lessonForm.value.homeworkDetails)
    formData.append('homeworkDeadline', lessonForm.value.homeworkDeadline)
    selectedFiles.value.forEach((file) => formData.append('materials', file))

    await $fetch(`${API}/api/teacher/dashboard/lesson-plans`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: formData
    })
    lessonMsg.value = '✅ Dars va vazifa muvaffaqiyatli yuborildi!'
    lessonMsgType.value = 'ok'
    lessonForm.value = { topic: '', homeworkDetails: '', homeworkDeadline: '' }
    selectedFiles.value = []
    if (fileInput.value) fileInput.value.value = ''
    await fetchGroupData()
  } catch (err: any) {
    lessonMsg.value = err?.data?.message || 'Yuklashda xatolik'
    lessonMsgType.value = 'err'
  } finally {
    savingLesson.value = false
    setTimeout(() => { lessonMsg.value = '' }, 5000)
  }
}

// ─── Exams ────────────────────────────────────────────────
const scheduleExam = async () => {
  if (!examForm.value.name || !examForm.value.date) return
  savingExam.value = true
  examMsg.value = ''
  try {
    await $fetch(`${API}/api/teacher/dashboard/groups/${groupId}/exams`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}`, 'Content-Type': 'application/json' },
      body: { name: examForm.value.name, date: examForm.value.date, description: examForm.value.description }
    })
    examMsg.value = '✅ Imtihon rejalashtirildi!'
    examMsgType.value = 'ok'
    examForm.value = { name: '', date: '', description: '' }
    await fetchGroupData()
  } catch (err: any) {
    examMsg.value = err?.data?.message || 'Saqlashda xatolik'
    examMsgType.value = 'err'
  } finally {
    savingExam.value = false
    setTimeout(() => { examMsg.value = '' }, 4000)
  }
}

const toggleExamResults = (exam: any) => {
  activeExamResultsId.value = activeExamResultsId.value === exam._id ? null : exam._id
  students.value.forEach((s: any) => {
    const existing = exam.results?.find((r: any) =>
      r.student === s._id || r.student?._id === s._id
    )
    examResultsMap.value[s._id] = existing?.score ?? 0
  })
}

const saveExamResults = async (examId: string) => {
  savingExamResults.value = true
  try {
    const results = students.value.map((s: any) => ({
      student: s._id,
      score: examResultsMap.value[s._id] || 0
    }))
    await $fetch(`${API}/api/teacher/dashboard/exams/${examId}/results`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token.value}`, 'Content-Type': 'application/json' },
      body: { results }
    })
    activeExamResultsId.value = null
    await fetchGroupData()
  } catch (err: any) {
    alert(err?.data?.message || 'Natijalarni saqlashda xatolik')
  } finally {
    savingExamResults.value = false
  }
}

// ─── Utils ────────────────────────────────────────────────
const formatDate = (date: any) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' })
}

const statusLabel = (status: string) =>
  ({ PRESENT: '✅ Keldi', ABSENT: '❌ Kelmadi', LATE: '⏰ Kechikdi' }[status] || status)

// ─── Edit Lesson Plan ───
const showEditLpModal = ref(false)
const editLpData = ref<any>(null)
const editLpFiles = ref<File[]>([])
const editLpError = ref('')
const submittingEditLp = ref(false)

const openEditLessonPlanModal = (lp: any) => {
  editLpData.value = {
    _id: lp._id,
    topic: lp.topic,
    homeworkDetails: lp.homeworkDetails,
    homeworkDeadline: new Date(lp.homeworkDeadline).toISOString().slice(0, 16),
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
    const formData = new FormData()
    formData.append('topic', editLpData.value.topic)
    formData.append('homeworkDetails', editLpData.value.homeworkDetails)
    formData.append('homeworkDeadline', editLpData.value.homeworkDeadline)
    editLpFiles.value.forEach(file => formData.append('materials', file))

    await $fetch(`${API}/api/teacher/dashboard/lesson-plans/${editLpData.value._id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token.value}` },
      body: formData
    })

    alert('Dars rejasi muvaffaqiyatli yangilandi!')
    showEditLpModal.value = false
    await fetchGroupData()
  } catch (err: any) {
    editLpError.value = err?.data?.message || "Yangilashda xatolik yuz berdi"
  } finally {
    submittingEditLp.value = false
  }
}

// ─── Edit Exam ───
const showEditExamModal = ref(false)
const editExamData = ref<any>(null)
const editExamError = ref('')
const submittingEditExam = ref(false)

const openEditExamModal = (exam: any) => {
  editExamData.value = {
    _id: exam._id,
    name: exam.name,
    date: new Date(exam.date).toISOString().slice(0, 16),
    description: exam.description || '',
  }
  editExamError.value = ''
  showEditExamModal.value = true
}

const submitEditExam = async () => {
  if (!editExamData.value) return
  submittingEditExam.value = true
  editExamError.value = ''
  try {
    await $fetch(`${API}/api/teacher/dashboard/exams/${editExamData.value._id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token.value}`, 'Content-Type': 'application/json' },
      body: {
        name: editExamData.value.name,
        date: editExamData.value.date,
        description: editExamData.value.description
      }
    })

    alert('Imtihon muvaffaqiyatli yangilandi!')
    showEditExamModal.value = false
    await fetchGroupData()
  } catch (err: any) {
    editExamError.value = err?.data?.message || "Yangilashda xatolik yuz berdi"
  } finally {
    submittingEditExam.value = false
  }
}

// ─── Final Results ───
watch(activeTab, (newTab) => {
  if (newTab === 'finalResults' && groupData.value) {
    if (groupData.value.status === 'CLOSED') {
      previewResults.value = sortedFinalResults(groupData.value.finalResults)
    } else {
      fetchPreviewResults()
    }
  }
})

const fetchPreviewResults = async () => {
  loadingPreview.value = true
  try {
    const res: any = await $fetch(`${API}/api/teacher/dashboard/groups/${groupId}/preview-results`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    previewResults.value = res.data.preview || []
  } catch (err) {
    console.error("Natijalarni yuklashda xatolik:", err)
  } finally {
    loadingPreview.value = false
  }
}

const calculateTotalPreview = (res: any) => {
  const daily = res.dailyScore || 0
  const attendance = res.attendanceScore || 0
  const midScore = res.midtermScore || 0
  const finalScore = res.finalScore || 0

  const exam_percentage = (midScore * 0.40) + (finalScore * 0.60)
  return (daily * 0.20) + (exam_percentage * 0.70) + (attendance * 0.10)
}

const saveAndCloseGroup = async () => {
  if (!groupData.value) return
  if (!confirm("Haqiqatan ham ushbu guruhni yopib, barcha natijalarni saqlamoqchimisiz? Guruh yopilgach, natijalarni o'zgartirib bo'lmaydi.")) return
  
  closingGroup.value = true
  try {
    // Save exam percentages
    const gradesPayload = previewResults.value.map(res => ({
      studentId: res.student,
      midtermScore: res.midtermScore || 0,
      finalScore: res.finalScore || 0
    }))
    
    await $fetch(`${API}/api/teacher/dashboard/groups/${groupId}/exam-percentages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token.value}` },
      body: { grades: gradesPayload }
    })

    // Close group
    const res: any = await $fetch(`${API}/api/teacher/dashboard/groups/${groupId}/close`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token.value}` }
    })
    
    alert("Guruh muvaffaqiyatli yopildi va natijalar hisoblandi!")
    groupData.value.status = 'CLOSED'
    groupData.value.finalResults = res.data.finalResults
    previewResults.value = sortedFinalResults(groupData.value.finalResults)
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

const getStudentName = (studentId: string) => {
  const student = students.value?.find((s: any) => s._id === studentId || s === studentId)
  return student?.user ? `${student.user.firstname} ${student.user.lastname}` : 'Noma\'lum o\'quvchi'
}

// ─── Homework Grading ───
const toggleHwSubmissions = async (plan: any) => {
  if (activeHwLessonPlanId.value === plan._id) {
    activeHwLessonPlanId.value = null
    return
  }
  activeHwLessonPlanId.value = plan._id
  hwSubmissionsList.value = []
  hwGradesMap.value = {}
  loadingHwSubmissions.value = true

  try {
    const res: any = await $fetch(`${API}/api/teacher/dashboard/lesson-plans/${plan._id}/hw-submissions`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    hwSubmissionsList.value = res.data.results || []
    
    // Init grades map
    hwSubmissionsList.value.forEach(s => {
      hwGradesMap.value[s.student] = s.grade !== null && s.grade !== undefined ? s.grade : null
    })
  } catch (err: any) {
    console.error("Vazifalarni yuklashda xatolik:", err)
    alert(err?.data?.message || "Vazifalarni yuklashda xatolik")
  } finally {
    loadingHwSubmissions.value = false
  }
}

const saveHwGrades = async (lessonPlanId: string) => {
  const payload = Object.entries(hwGradesMap.value)
    .filter(([_, score]) => score !== null && score !== "")
    .map(([studentId, score]) => ({
      studentId,
      score: Number(score)
    }))

  if (payload.length === 0) {
    alert("Saqlash uchun hech qanday baho kiritilmadi.")
    return
  }

  savingHwGrades.value = true
  try {
    await $fetch(`${API}/api/teacher/dashboard/lesson-plans/${lessonPlanId}/grade-homeworks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}`, 'Content-Type': 'application/json' },
      body: { grades: payload }
    })
    alert('Baholar muvaffaqiyatli saqlandi!')
    // refresh list
    await toggleHwSubmissions({ _id: lessonPlanId })
    activeHwLessonPlanId.value = lessonPlanId
  } catch (err: any) {
    alert(err?.data?.message || "Saqlashda xatolik yuz berdi")
  } finally {
    savingHwGrades.value = false
  }
}

onMounted(() => {
  fetchGroupData()
})
</script>\n