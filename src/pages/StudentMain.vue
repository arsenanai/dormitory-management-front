<template>
  <Navigation :title="t('Student\'s page')">
    <!-- Dormitory Access Status (NEW) -->
    <div v-if="dormitoryAccessLoading" class="mb-4">
      <div class="bg-gray-100 text-gray-800 p-3 rounded animate-pulse">
        {{ t('Checking dormitory access...') }}
      </div>
    </div>
    <div v-else-if="dormitoryAccessChecked" class="mb-4">
      <div v-if="!canAccessDormitory" class="bg-red-100 text-red-800 p-3 rounded">
        {{ t('You cannot access the dormitory. Please check your payment status.') }}
        <div class="text-xs mt-1">{{ dormitoryAccessReason }}</div>
      </div>
      <div v-else class="bg-green-100 text-green-800 p-3 rounded">
        {{ t('You have access to the dormitory.') }}
      </div>
    </div>
    <!-- Registration Status -->
    <div class="mb-6">
      <h2 class="text-lg font-bold text-gray-800">
        {{ t("REGISTRATION STATUS") }}:
        <span class="font-normal">{{ t("Enrolled or pending") }}</span>
      </h2>
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
      <CTable>
        <CTableHead>
          <CTableHeadCell>{{ t("FROM") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("SUBJECT") }}</CTableHeadCell>
          <CTableHeadCell>{{ t("DATE-TIME") }}</CTableHeadCell>
        </CTableHead>
        <CTableBody>
          <CTableRow
            v-for="(message, index) in messages"
            :key="index"
            @click="selectMessage(message, index)"
            :class="{
              'bg-gray-100 text-gray-900': selectedMessageIndex === index,
              'cursor-pointer hover:bg-gray-50': selectedMessageIndex !== index,
            }"
          >
            <CTableCell>{{ message.from }}</CTableCell>
            <CTableCell>{{ message.subject }}</CTableCell>
            <CTableCell>{{ message.dateTime }}</CTableCell>
          </CTableRow>
        </CTableBody>
      </CTable>
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
import CTableHead from "@/components/CTableHead.vue";
import CTableHeadCell from "@/components/CTableHeadCell.vue";
import CTableBody from "@/components/CTableBody.vue";
import CTableRow from "@/components/CTableRow.vue";
import CTableCell from "@/components/CTableCell.vue";
import CTextarea from "@/components/CTextarea.vue";
import { Message } from "@/models/Message"; // Import the Message class
import { dormitoryAccessService } from '@/services/api';

const { t } = useI18n();

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
