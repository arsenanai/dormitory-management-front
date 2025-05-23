<template>
  <Navigation :title="t('My messages')">
    <!-- Filters -->
    <div
      class="mb-4 flex flex-col items-stretch gap-4 lg:flex-row lg:items-center"
    >
      <CSelect
        id="faculty-filter"
        v-model="filters.faculty"
        :options="facultyOptions"
        :label="t('Faculty')"
        :placeholder="t('Select Faculty')"
        class="lg:w-40"
      />
      <CSelect
        id="room-filter"
        v-model="filters.room"
        :options="roomOptions"
        :label="t('Room')"
        :placeholder="t('Select Room')"
        class="lg:w-40"
      />
      <CSelect
        id="dormitory-filter"
        v-model="filters.dormitory"
        :options="dormitoryOptions"
        :label="t('Dormitory')"
        :placeholder="t('Select Dormitory')"
        class="lg:w-40"
      />
    </div>

    <!-- Message Input -->
    <div class="mb-4">
      <CTextarea
        id="message-input"
        v-model="message"
        :label="t('Message')"
        :placeholder="t('Enter your message here')"
        :validationMessage="t('This field cannot be empty.')"
      />
    </div>

    <!-- Send Button -->
    <div class="mb-6 flex justify-end">
      <CButton variant="primary" @click="sendMessage">
        <PaperAirplaneIcon class="h-5 w-5" /> {{ t("Send") }}
      </CButton>
    </div>

    <!-- Message History -->
    <h2 class="mb-4 text-lg font-bold text-gray-800">
      {{ t("Message History") }}
    </h2>
    <CTable>
      <CTableHead>
        <CTableHeadCell>{{ t("FROM") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("TO") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("SUBJECT") }}</CTableHeadCell>
        <CTableHeadCell>{{ t("DATE-TIME") }}</CTableHeadCell>
      </CTableHead>
      <CTableBody>
        <CTableRow
          v-for="(history, index) in messageHistory"
          :key="index"
          @click="selectMessage(history, index)"
          :class="{
            'bg-gray-100 text-gray-900': selectedMessageIndex === index,
            'cursor-pointer hover:bg-gray-50': selectedMessageIndex !== index,
          }"
          tabindex="0"
          class="focus:ring-primary-300 dark:focus:ring-primary-600 focus:ring-4 focus:ring-offset-0 dark:ring-offset-gray-800"
        >
          <CTableCell>{{ history.from }}</CTableCell>
          <CTableCell>{{ history.to }}</CTableCell>
          <CTableCell>{{ history.subject }}</CTableCell>
          <CTableCell>{{ history.dateTime }}</CTableCell>
        </CTableRow>
      </CTableBody>
    </CTable>

    <!-- Selected Message -->
    <div class="mt-6">
      <CTextarea
        id="selected-message"
        v-model="selectedMessage"
        :label="t('Selected Message')"
        :placeholder="t('No message selected')"
        :rows="5"
        readonly
      />
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CSelect from "@/components/CSelect.vue";
import CButton from "@/components/CButton.vue";
import CTextarea from "@/components/CTextarea.vue";
import CTable from "@/components/CTable.vue";
import CTableHead from "@/components/CTableHead.vue";
import CTableHeadCell from "@/components/CTableHeadCell.vue";
import CTableBody from "@/components/CTableBody.vue";
import CTableRow from "@/components/CTableRow.vue";
import CTableCell from "@/components/CTableCell.vue";
import { PaperAirplaneIcon } from "@heroicons/vue/24/outline";
import { Message } from "@/models/Message"; // Import the Message class

const { t } = useI18n();

// Define types for filters
interface Filter {
  faculty: string;
  room: string;
  dormitory: string;
}

// Filters
const filters = ref<Filter>({
  faculty: "",
  room: "",
  dormitory: "",
});

// Options for filters
const facultyOptions = [
  { value: "engineering", name: t("Engineering") },
  { value: "business", name: t("Business") },
  { value: "law", name: t("Law") },
];

const roomOptions = [
  { value: "a101", name: "A101" },
  { value: "b202", name: "B202" },
  { value: "c303", name: "C303" },
];

const dormitoryOptions = [
  { value: "a-block", name: "A-Block" },
  { value: "b-block", name: "B-Block" },
  { value: "c-block", name: "C-Block" },
];

// Message Input
const message = ref<string>("");

// Message History
const messageHistory = ref<Message[]>([
  new Message(
    "Admin",
    "All",
    "Welcome",
    "01-09-2024 11:34",
    "Welcome to the dormitory management system!",
  ),
  new Message(
    "Admin",
    "Faculty",
    "Meeting Reminder",
    "02-09-2024 09:00",
    "Don't forget about the faculty meeting tomorrow at 10 AM.",
  ),
]);

// Selected Message
const selectedMessage = ref<string>("");
const selectedMessageIndex = ref<number | null>(null);

// Send Message
const sendMessage = (): void => {
  console.log("Message sent:", message.value);
  // Add logic to send the message
};

// Select Message
const selectMessage = (message: Message, index: number): void => {
  selectedMessage.value = message.content;
  selectedMessageIndex.value = index;
};

// Set the first message as active on component mount
onMounted(() => {
  if (messageHistory.value.length > 0) {
    selectMessage(messageHistory.value[0], 0);
  }
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
