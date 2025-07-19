<template>
  <CModal v-model="show" title="Reset Password">
    <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
      <CInput
        v-model="email"
        type="email"
        label="Email"
        required
        autocomplete="email"
        :error="emailError"
        data-testid="reset-email"
      />
      <div v-if="successMessage" class="text-green-600">{{ successMessage }}</div>
      <div v-if="errorMessage" class="text-red-600">{{ errorMessage }}</div>
      <div class="flex justify-end gap-2 mt-2">
        <CButton type="button" variant="secondary" @click="close">Cancel</CButton>
        <CButton type="submit" variant="primary">Send Reset Link</CButton>
      </div>
    </form>
  </CModal>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue'])

const show = ref(props.modelValue)
watch(() => props.modelValue, v => (show.value = v))
watch(show, v => emit('update:modelValue', v))

const email = ref('')
const emailError = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const authStore = useAuthStore()

function close() {
  show.value = false
  email.value = ''
  emailError.value = ''
  errorMessage.value = ''
  successMessage.value = ''
}

async function onSubmit() {
  emailError.value = ''
  errorMessage.value = ''
  successMessage.value = ''
  if (!email.value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
    emailError.value = 'Invalid email'
    return
  }
  try {
    await authStore.resetPassword(email.value)
    successMessage.value = 'Check your email for the reset link.'
  } catch (e: any) {
    errorMessage.value = e?.message || 'Failed to send reset link.'
  }
}
</script>
