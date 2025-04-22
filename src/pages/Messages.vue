<template>
  <Navigation :title="t('My messages')">
    <!-- Filters -->
    <div class="mb-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
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
        <PaperAirplaneIcon class="w-5 h-5" /> {{ t("Send") }}
      </CButton>
    </div>

    <!-- Message History -->
    <h2 class="mb-4 text-lg font-bold text-gray-800">{{ t("Message History") }}</h2>
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
        rows="5"
        readonly
      />
    </div>
  </Navigation>
</template>

<script setup>
import { ref } from "vue";
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

const { t } = useI18n();

// Filters
const filters = ref({
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
const message = ref("");

// Message History
const messageHistory = ref([
  { from: "Admin", to: "All", subject: "Welcome", dateTime: "01-09-2024 11:34", content: "Welcome to the dormitory management system!" },
  { from: "Admin", to: "Faculty", subject: "Meeting Reminder", dateTime: "02-09-2024 09:00", content: "Don't forget about the faculty meeting tomorrow at 10 AM." },
]);

// Selected Message
const selectedMessage = ref("");
const selectedMessageIndex = ref(null);

// Send Message
const sendMessage = () => {
  console.log("Message sent:", message.value);
  // Add logic to send the message
};

// Select Message
const selectMessage = (message, index) => {
  selectedMessage.value = message.content;
  selectedMessageIndex.value = index;
};
</script>

<style scoped>
/* Add custom styles if needed */
</style>