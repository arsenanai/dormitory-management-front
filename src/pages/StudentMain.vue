<template>
  <Navigation :title="t('Student\'s page')">
    <!-- Dormitory Access Status (NEW) -->
    <div v-if="dormitoryAccessLoading" class="bg-primary-100 text-primary-800 p-3 rounded animate-pulse">
      {{ t('Loading dormitory access information...') }}
    </div>

    <div v-if="!canAccessDormitory" class="bg-red-100 text-red-800 p-3 rounded">
      {{ t('Access Denied') }}
      <div class="text-xs mt-1">{{ dormitoryAccessReason }}</div>
    </div>
    <div v-else class="bg-green-100 text-green-800 p-3 rounded">
      {{ t('Access Granted') }}
      <div class="text-xs mt-1">{{ t('You have access to the dormitory.') }}</div>
    </div>

    <h2 class="text-lg font-bold text-primary-700 mt-6 mb-4">
      {{ t('Dormitory Information') }}
    </h2>
    <!-- Registration Status -->
    <div class="mb-6">
      <h3 class="text-sm font-medium text-primary-600 mb-2">
        {{ t('Registration Status') }}
      </h3>
    </div>

    <!-- Messages Section -->
    <div class="mb-6">
      <h2 class="flex items-center gap-2 text-lg font-bold text-gray-800">
        {{ t("MESSAGES") }}
        <span
          class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 text-xs font-semibold text-blue-800"
        >
          {{ messages.length }}
        </span>
      </h2>

      <!-- Messages Table -->
      <CTable 
        :columns="messageColumns" 
        :data="messages" 
        :loading="false"
        hoverable
        @row-click="handleMessageClick"
      />
    </div>

    <!-- Selected Message -->
    <div v-if="selectedMessage" class="flex flex-col gap-4">
      <h3 class="text-sm font-medium text-gray-700">
        {{ t("From") }}: {{ selectedMessage.from }}
        <span class="mt-4">{{ selectedMessage.dateTime }}</span>
      </h3>
      <div>
        <CTextarea
          id="selected-message"
          v-model="selectedMessage.content"
          :label="t('Selected Message')"
          :placeholder="t('No message selected')"
          :rows="5"
          readonly
        />
      </div>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CTable from "@/components/CTable.vue";
import CTextarea from "@/components/CTextarea.vue";
import { Message } from "@/models/Message"; // Import the Message class
import { dormitoryAccessService } from '@/services/api';

const { t } = useI18n();

// Message table columns
const messageColumns = [
  { key: 'from', label: t('FROM') },
  { key: 'subject', label: t('SUBJECT') },
  { key: 'dateTime', label: t('DATE-TIME') },
];

// Messages Data
const messages = ref<Message[]>([
  new Message(
    "Admin",
    "All",
    "Welcome",
    "01-09-2024 11:34",
    "Welcome to the dormitory management system!",
  ),
  new Message(
    "Admin",
    "All",
    "Reminder",
    "02-09-2024 10:00",
    "Don't forget to complete your registration.",
  ),
]);

// Selected Message
const selectedMessage = ref<Message | null>(null);
const selectedMessageIndex = ref<number | null>(null);

// Dormitory Access Status
const canAccessDormitory = ref<boolean>(true);
const dormitoryAccessChecked = ref<boolean>(false);
const dormitoryAccessReason = ref<string>('');
const dormitoryAccessLoading = ref<boolean>(true);

// Select Message
const selectMessage = (message: Message, index: number): void => {
  selectedMessage.value = message;
  selectedMessageIndex.value = index;
};

// Handle message row click
const handleMessageClick = (message: Message): void => {
  const index = messages.value.findIndex(m => m === message);
  if (index !== -1) {
    selectMessage(message, index);
  }
};

// Set the latest message as active on component mount
onMounted(async () => {
  dormitoryAccessLoading.value = true;
  try {
    const response = await dormitoryAccessService.check();
    canAccessDormitory.value = !!response.data.can_access;
    dormitoryAccessReason.value = response.data.reason || (response.data.can_access ? '' : t('No current semester payment or payment not approved.'));
  } catch (e) {
    canAccessDormitory.value = false;
    dormitoryAccessReason.value = t('Unable to check access status.');
  } finally {
    dormitoryAccessChecked.value = true;
    dormitoryAccessLoading.value = false;
  }

  if (messages.value.length > 0) {
    const latestIndex = messages.value.length - 1;
    selectMessage(messages.value[latestIndex], latestIndex);
  }
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
