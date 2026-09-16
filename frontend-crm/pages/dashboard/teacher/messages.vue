<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
      <div class="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-slate-800 flex-1 shadow-xl">
        <h2 class="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <Icon name="lucide:message-square" class="w-7 h-7 text-indigo-400" />
          Ota-onalar bilan aloqa
        </h2>
        <p class="text-sm text-slate-400 mt-1">Xabarlar va murojaatlar</p>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6 h-[70vh]">
      <!-- Users List -->
      <div class="w-full lg:w-1/3 bg-slate-950/40 border border-slate-800/80 rounded-2xl shadow-xl flex flex-col h-full overflow-hidden">
        <div class="p-4 border-b border-slate-800/80 bg-slate-900/50">
          <h3 class="font-bold text-white">Yozishmalar</h3>
        </div>
        
        <div class="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
          <div v-if="loadingUsers" class="text-center text-slate-500 text-xs py-4">Yuklanmoqda...</div>
          <div v-else-if="users.length === 0" class="text-center text-slate-500 text-xs py-8 bg-slate-900/50 rounded-xl border border-slate-800/50">
            Hozircha xabarlar yo'q
          </div>
          <button
            v-else
            v-for="user in users"
            :key="user._id"
            @click="selectUser(user)"
            class="w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 border border-transparent"
            :class="selectedUser?._id === user._id ? 'bg-indigo-600/20 border-indigo-500/30' : 'hover:bg-slate-800/50 hover:border-slate-700/50'"
          >
            <div class="flex items-center gap-3 flex-1 overflow-hidden">
              <div class="relative">
                <img v-if="user.avatar" :src="user.avatar" class="w-10 h-10 rounded-full object-cover border border-slate-700" />
                <div v-else class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700">
                  {{ user.firstname?.[0] || 'O' }}
                </div>
                <div v-if="user.unreadCount > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[9px] font-bold text-white">
                  {{ user.unreadCount }}
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-bold text-white truncate">{{ user.firstname }} {{ user.lastname }}</h4>
                <p v-if="user.children && user.children.length > 0" class="text-[10px] text-indigo-400 font-semibold truncate">
                  🎓 {{ user.children.map((c: any) => c.firstname + ' ' + c.lastname).join(', ') }} ning ota/onasi
                </p>
                <p class="text-xs text-slate-400 truncate mt-0.5">{{ user.lastMessage || 'Xabar yo\'q' }}</p>
              </div>
            </div>
            <div class="text-[10px] text-slate-500 font-medium shrink-0">
              {{ user.lastMessageTime ? new Date(user.lastMessageTime).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '' }}
            </div>
          </button>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="flex-1 bg-slate-950/40 border border-slate-800/80 rounded-2xl shadow-xl flex flex-col h-full overflow-hidden">
        <template v-if="selectedUser">
          <div class="p-4 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img v-if="selectedUser.avatar" :src="selectedUser.avatar" class="w-10 h-10 rounded-full object-cover border border-slate-700" />
              <div v-else class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700">
                {{ selectedUser.firstname?.[0] || 'O' }}
              </div>
              <div>
                <h3 class="font-bold text-white">{{ selectedUser.firstname }} {{ selectedUser.lastname }}</h3>
                <p v-if="selectedUser.children && selectedUser.children.length > 0" class="text-xs text-indigo-400 font-semibold">
                  🎓 {{ selectedUser.children.map((c: any) => c.firstname + ' ' + c.lastname).join(', ') }} ning ota/onasi
                </p>
                <p class="text-xs text-slate-400">📞 {{ selectedUser.phone }}</p>
              </div>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide" id="chat-messages-container">
            <div v-if="loadingMessages" class="text-center text-slate-500 text-xs py-4">Xabarlar yuklanmoqda...</div>
            <div v-else-if="messages.length === 0" class="text-center text-slate-500 text-xs py-8">
              Xabarlar yo'q
            </div>
            <div v-else v-for="msg in messages" :key="msg._id" class="flex flex-col" :class="msg.sender === authStore.user?._id ? 'items-end' : 'items-start'">
              <div class="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm"
                :class="msg.sender === authStore.user?._id ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-sm'"
              >
                {{ msg.message }}
              </div>
              <span class="text-[10px] text-slate-500 mt-1 px-1 font-medium">
                {{ new Date(msg.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) }}
                <span v-if="msg.sender === authStore.user?._id" class="ml-1 text-indigo-400">
                  {{ msg.isRead ? '👁️' : '✓' }}
                </span>
              </span>
            </div>
          </div>

          <div class="p-4 border-t border-slate-800/80 bg-slate-900/50">
            <form @submit.prevent="sendMessage" class="flex items-center gap-3">
              <input
                v-model="newMessage"
                type="text"
                placeholder="Xabar yozing..."
                class="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                :disabled="sending"
              />
              <button
                type="submit"
                class="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50 flex items-center justify-center shadow-lg shadow-indigo-600/20"
                :disabled="!newMessage.trim() || sending"
              >
                <Icon v-if="!sending" name="lucide:send" class="w-5 h-5" />
                <div v-else class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              </button>
            </form>
          </div>
        </template>
        <div v-else class="flex-1 flex items-center justify-center text-slate-500 text-sm">
          Chap tomondan yozishmani tanlang
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useCookie } from '#app'

definePageMeta({ layout: "admin" })

const users = ref<any[]>([])
const loadingUsers = ref(true)
const selectedUser = ref<any>(null)
const messages = ref<any[]>([])
const loadingMessages = ref(false)
const newMessage = ref('')
const sending = ref(false)
let pollInterval: any = null

const authStore = {
  user: { _id: '' }
}

const fetchUsers = async () => {
  try {
    const token = useCookie("auth_token")
    if (!token.value) return

    // Decode token manually just to get ID if needed, but we have API
    const res = await $fetch<any>("/api/v1/chat/users", {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    
    if (res.status === 'success') {
      users.value = res.data.users
    }
  } catch (err) {
    console.error("Foydalanuvchilarni yuklashda xatolik:", err)
  } finally {
    loadingUsers.value = false
  }
}

const fetchMessages = async (userId: string, isSilent = false) => {
  if (!isSilent) loadingMessages.value = true
  try {
    const token = useCookie("auth_token")
    const res = await $fetch<any>(`/api/v1/chat/messages/${userId}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    
    if (res.status === 'success') {
      messages.value = res.data.messages
      if (!isSilent) scrollToBottom()
    }
  } catch (err) {
    console.error("Xabarlarni yuklashda xatolik:", err)
  } finally {
    loadingMessages.value = false
  }
}

const selectUser = (user: any) => {
  selectedUser.value = user
  user.unreadCount = 0 // Optimistic reset
  fetchMessages(user._id)
}

const sendMessage = async () => {
  const text = newMessage.value.trim()
  if (!text || !selectedUser.value) return

  sending.value = true
  try {
    const token = useCookie("auth_token")
    const res = await $fetch<any>('/api/v1/chat/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { receiverId: selectedUser.value._id, message: text }
    })

    if (res.status === 'success') {
      messages.value.push(res.data.message)
      newMessage.value = ''
      scrollToBottom()
      
      // Update users list last message
      const userIdx = users.value.findIndex(u => u._id === selectedUser.value._id)
      if (userIdx !== -1) {
        users.value[userIdx].lastMessage = text
        users.value[userIdx].lastMessageTime = new Date()
        // Move to top
        const user = users.value.splice(userIdx, 1)[0]
        users.value.unshift(user)
      }
    }
  } catch (err) {
    console.error("Xabar yuborishda xatolik:", err)
  } finally {
    sending.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    const container = document.getElementById('chat-messages-container')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  })
}

onMounted(async () => {
  // get user ID from token
  const token = useCookie("auth_token").value
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      authStore.user._id = payload.id
    } catch(e) {}
  }
  
  await fetchUsers()

  pollInterval = setInterval(() => {
    fetchUsers()
    if (selectedUser.value) {
      fetchMessages(selectedUser.value._id, true)
    }
  }, 5000)
})

onBeforeUnmount(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
