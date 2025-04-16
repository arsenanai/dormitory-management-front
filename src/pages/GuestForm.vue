<template>
  <Navigation :title="t('Add-edit guest page')">
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Guest First Name -->
      <FwbInput v-model="guest.firstName" :label="t('Firstname')" required />

      <!-- Guest Last Name -->
      <FwbInput v-model="guest.lastName" :label="t('Surname')" required />

      <!-- Phone -->
      <FwbInput
        v-model="guest.phone"
        :label="t('Tel no')"
        type="tel"
        placeholder="+7(___)_______"
      />

      <!-- Enter Date -->
      <FwbInput
        v-model="guest.enterDate"
        :label="t('Enter date')"
        type="date"
      />

      <!-- Exit Date -->
      <FwbInput v-model="guest.exitDate" :label="t('Exit date')" type="date" />

      <!-- Room Selection -->
      <FwbSelect
        v-model="guest.room"
        :options="roomOptions"
        :label="t('Select room')"
        class="focus:outline-none"
      />

      <!-- WiFi Username -->
      <FwbInput v-model="guest.wifiUsername" :label="t('Wifi Username')" />

      <!-- WiFi Password -->
      <FwbInput v-model="guest.wifiPassword" :label="t('Wifi Password')" />

      <!-- Information / Reminder -->
      <div class="col-span-1 lg:col-span-2">
        <textarea
          v-model="guest.reminder"
          class="w-full rounded border border-gray-300 p-2 focus:outline-none"
          placeholder="Information - Reminder"
          rows="3"
        ></textarea>
      </div>
    </div>

    <hr class="my-4 border-t" />
    <div class="text-lg font-medium">{{ t("Payment info") }}</div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Daily Rate -->
      <FwbInput v-model="guest.dailyRate" :label="t('Daily')" />

      <!-- Payment Rows -->
      <template v-for="(payment, index) in guest.payments" :key="index">
        <div class="flex flex-col gap-2">
          <FwbInput v-model="payment.date" type="date" class="w-full" />
        </div>
        <FwbInput v-model="payment.amount" placeholder="0T" class="w-full" />
      </template>

      <!-- Paid -->
      <FwbInput v-model="guest.paid" :label="t('PAID')" />

      <!-- Debt -->
      <FwbInput v-model="guest.debt" :label="t('DEBT')" />
    </div>

    <!-- Submit Button -->
    <div class="mt-6 flex justify-end">
      <FwbButton
        outline
        type="button"
        @click="submitForm"
        class="w-full sm:w-40"
      >
        {{ t("SUBMIT") }}
      </FwbButton>
    </div>
  </Navigation>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import { FwbInput, FwbSelect, FwbButton } from "flowbite-vue";

const { t } = useI18n();

const guest = ref({
  firstName: "",
  lastName: "",
  phone: "",
  enterDate: "",
  exitDate: "",
  room: "",
  wifiUsername: "",
  wifiPassword: "",
  reminder: "",
  dailyRate: "12000 T",
  payments: [
    { date: "2024-01-11", amount: "12000T" },
    { date: "2024-01-13", amount: "10000T" },
    { date: "", amount: "" },
    { date: "", amount: "" },
  ],
  paid: "22000T",
  debt: "14000T",
});

const roomOptions = [
  { value: "A210", name: "A210" },
  { value: "A211", name: "A211" },
  { value: "A212", name: "A212" },
];

const submitForm = () => {
  console.log("Form submitted:", guest.value);
};
</script>
