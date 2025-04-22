<template>
  <Navigation :title="t('Student\'s page')">
    <!-- Registration Status -->
    <div class="mb-6">
      <h2 class="text-lg font-bold text-gray-800">
        {{ t("REGISTRATION STATUS") }}: 
        <span class="font-normal">{{ t("Enrolled or pending") }}</span>
      </h2>
    </div>

    <!-- Messages Section -->
    <div class="mb-6">
      <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
        {{ t("MESSAGES") }}
        <span class="inline-flex items-center justify-center w-6 h-6 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">
          2
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
          <CTableRow v-for="(message, index) in messages" :key="index">
            <CTableCell>{{ message.from }}</CTableCell>
            <CTableCell>{{ message.subject }}</CTableCell>
            <CTableCell>{{ message.dateTime }}</CTableCell>
          </CTableRow>
        </CTableBody>
      </CTable>
    </div>

    <!-- Selected Message -->
    <div class="mb-6">
      <h3 class="text-sm font-medium text-gray-700">
        {{ t("From") }}: {{ selectedMessage.from }} 
        <span class="ml-4">{{ selectedMessage.dateTime }}</span>
      </h3>
      <textarea
        class="w-full mt-2 rounded border border-gray-300 p-2 focus:outline-none"
        rows="5"
        readonly
      >
        {{ selectedMessage.content }}
      </textarea>
    </div>

    <!-- Payment Information -->
    <hr class="my-6 border-gray-300" />
    <div>
      <h2 class="text-lg font-bold text-gray-800 mb-4">
        {{ t("информация об оплате") }}
      </h2>
      <div class="bg-yellow-100 border border-yellow-300 rounded p-4">
        {{ t("Здесь информация об оплате студентов, и если будет произведена полная интеграция с KASPI, будет генерация QR-кода.") }}
      </div>
    </div>
  </Navigation>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CTable from "@/components/CTable.vue";
import CTableHead from "@/components/CTableHead.vue";
import CTableHeadCell from "@/components/CTableHeadCell.vue";
import CTableBody from "@/components/CTableBody.vue";
import CTableRow from "@/components/CTableRow.vue";
import CTableCell from "@/components/CTableCell.vue";

const { t } = useI18n();

// Messages Data
const messages = ref([
  { from: "Admin", subject: "Welcome", dateTime: "01-09-2024 11:34" },
  { from: "Admin", subject: "Reminder", dateTime: "02-09-2024 10:00" },
]);

// Selected Message
const selectedMessage = ref({
  from: "Admin",
  dateTime: "01-09-2024 11:34",
  content: t(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor mauris molestie elit, et lacinia ipsum quam nec dui. Quisque nec mauris sit amet elit iaculis pretium sit amet quis magna. Aenean velit odio, elementum in tempus ut, vehicula eu diam. Pellentesque rhoncus aliquam mattis. Ut vulputate eros sed felis sodales nec vulputate justo hendrerit. Vivamus varius pretium ligula, a aliquam odio euismod sit amet. Quisque laoreet sem sit amet orci ullamcorper at ultricies metus viverra. Pellentesque arcu mauris, malesuada quis ornare accumsan, blandit sed diam."
  ),
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>