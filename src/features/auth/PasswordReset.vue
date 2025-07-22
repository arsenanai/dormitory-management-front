
<template>
  <CModal :modelValue="props.modelValue" @update:modelValue="emit('update:modelValue', $event)" :title="t('Reset Password')">
    <div role="dialog" id="playwright-reset-modal" class="">
      <form @submit.prevent="onSubmit" class="flex flex-col gap-4 pt-2" id="reset-modal-marker" novalidate>
        <h2 class="text-xl font-semibold text-center">{{ t('Reset Password') }}</h2>
        <div v-if="emailError" class="text-red-600 text-center" data-testid="reset-email-error">{{ emailError }}</div>
        <CInput
          v-model="email"
          type="email"
          :label="t('Email')"
          required
          autocomplete="email"
          :error="emailError"
          data-testid="reset-email"
          id="reset-email"
        />
        <div v-if="successMessage" class="text-green-600 text-center">{{ t(successMessage) }}</div>
        <div v-if="errorMessage" class="text-red-600 text-center">{{ t(errorMessage) }}</div>
        <div v-if="loading" class="text-blue-600 text-center">{{ t('Sending...') }}</div>
        <div class="flex justify-end gap-2">
          <CButton type="button" @click="close" :disabled="loading">{{ t('Cancel') }}</CButton>
          <CButton type="submit" variant="primary" :disabled="loading">{{ t('Send Reset Link') }}</CButton>
        </div>
      </form>
    </div>
  </CModal>
</template>


<script setup lang="ts">
import { ref, defineProps, defineEmits, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import CModal from '../../components/CModal.vue'
import CInput from '../../components/CInput.vue'
import CButton from '../../components/CButton.vue'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue'])

const email = ref('')
const emailError = ref('')
const errorMessage = ref('')
const successMessage = ref('')

const authStore = useAuthStore()
const loading = ref(false)

function close() {
  emit('update:modelValue', false)
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
    emailError.value = t('Invalid email')
    console.log('DEBUG: emailError after invalid email submit:', emailError.value)
    await nextTick()
    return
  }
  loading.value = true
  try {
    await authStore.resetPassword(email.value)
    successMessage.value = t('Check your email for the reset link.')
  } catch (e: any) {
    errorMessage.value = e?.message ? t(e.message) : t('Failed to send reset link.')
  } finally {
    loading.value = false
  }
}
</script>
