<script setup lang="ts">
definePageMeta({ layout: false })

const token = useCookie("auth_token")

await navigateTo(token.value ? "/dashboard" : "/login")
</script>

<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center">
    <p class="text-slate-400 text-sm">Yo'naltirilmoqda...</p>
  </div>
</template>
