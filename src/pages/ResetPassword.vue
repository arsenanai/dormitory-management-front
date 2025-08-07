<template>
  <div class="flex min-h-screen items-center justify-center bg-primary-50">
    <div class="w-full max-w-md">
      <h2 class="text-2xl font-bold mb-4 text-center text-primary-700">{{ t('Reset Password') }}</h2>
      <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
        <CInput
          v-model="password"
          type="password"
          label="New Password"
          required
          autocomplete="new-password"
          :error="passwordError"
          id="reset-new-password"
        />
        <CInput
          v-model="confirmPassword"
          type="password"
          label="Confirm Password"
          required
          autocomplete="new-password"
          :error="confirmPasswordError"
          id="reset-confirm-password"
        />
        <div v-if="successMessage" class="text-green-600">{{ successMessage }}</div>
        <div v-if="errorMessage" class="text-red-600">{{ errorMessage }}</div>
        <CButton type="submit" variant="primary">Reset Password</CButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import CInput from '@/components/CInput.vue'
import CButton from '@/components/CButton.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const password = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const token = route.params.token as string

async function onSubmit() {
  passwordError.value = ''
  confirmPasswordError.value = ''
  errorMessage.value = ''
  successMessage.value = ''

  if (!password.value || password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters.'
    return
  }
  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match.'
    return
  }
  try {
    // You may want to get email from a query param, or add an email field to the form if required by backend
    const email = route.query.email as string || ''
    await authStore.resetPasswordConfirm(token, password.value, confirmPassword.value, email)
    successMessage.value = 'Password reset successful. You can now log in.'
    setTimeout(() => router.push({ name: 'login' }), 2000)
  } catch (e: any) {
    errorMessage.value = e?.message || 'Failed to reset password.'
  }
}
</script>
