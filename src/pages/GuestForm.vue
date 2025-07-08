<template>
  <Navigation :title="t('Guest page')">
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Guest First Name -->
      <div>
        <CInput
          id="guest-first-name"
          v-model="guest.firstName"
          type="text"
          :label="t('Firstname')"
          placeholder="Enter Firstname"
          required
        />
      </div>

      <!-- Guest Last Name -->
      <div>
        <CInput
          id="guest-last-name"
          v-model="guest.lastName"
          type="text"
          :label="t('Surname')"
          placeholder="Enter Surname"
          required
        />
      </div>

      <!-- Phone -->
      <div>
        <CInput
          id="guest-phone"
          v-model="guest.phone"
          type="tel"
          :label="t('Tel no')"
          placeholder="+7(___)_______"
          required
        />
      </div>

      <!-- Enter Date -->
      <div>
        <CInput
          id="guest-enter-date"
          v-model="guest.enterDate"
          type="date"
          :label="t('Enter date')"
          required
        />
      </div>

      <!-- Exit Date -->
      <div>
        <CInput
          id="guest-exit-date"
          v-model="guest.exitDate"
          type="date"
          :label="t('Exit date')"
          required
        />
      </div>

      <!-- Room Selection -->
      <div>
        <CSelect
          id="guest-room"
          v-model="guest.room"
          :options="roomOptions"
          :label="t('Select room')"
          required
        />
      </div>

      <!-- WiFi Username -->
      <div>
        <CInput
          id="guest-wifi-username"
          v-model="guest.wifiUsername"
          type="text"
          :label="t('Wifi Username')"
          placeholder="Enter WiFi Username"
        />
      </div>

      <!-- WiFi Password -->
      <div>
        <CInput
          id="guest-wifi-password"
          v-model="guest.wifiPassword"
          type="text"
          :label="t('Wifi Password')"
          placeholder="Enter WiFi Password"
        />
      </div>

      <!-- Information / Reminder -->
      <div class="col-span-1 lg:col-span-2">
        <label class="block text-sm font-medium text-gray-700">
          {{ t("Information - Reminder") }}
        </label>
        <textarea
          id="guest-reminder"
          v-model="guest.reminder"
          class="w-full rounded border border-gray-300 p-2 focus:outline-none"
          placeholder="Enter Information or Reminder"
          rows="3"
        ></textarea>
      </div>
    </div>

    <hr class="my-4 border-t border-gray-300" />
    <div class="text-lg font-medium">{{ t("Payment info") }}</div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Daily Rate -->
      <div>
        <CInput
          id="guest-daily-rate"
          v-model="guest.dailyRate"
          type="number"
          :label="t('Daily')"
          placeholder="Enter Daily Rate"
        />
      </div>

      <!-- Payment Rows -->
      <template v-for="(payment, index) in guest.payments" :key="index">
        <div>
          <CInput
            :id="`guest-payment-date-${index}`"
            v-model="payment.date"
            type="date"
            :label="t('Payment Date')"
          />
        </div>
        <div>
          <CInput
            :id="`guest-payment-amount-${index}`"
            v-model="payment.amount"
            type="number"
            :label="t('Payment Amount')"
            placeholder="0"
          />
        </div>
      </template>

      <!-- Paid -->
      <div>
        <CInput
          id="guest-paid"
          v-model="guest.paid"
          type="number"
          :label="t('PAID')"
          placeholder="Enter Paid Amount"
        />
      </div>

      <!-- Debt -->
      <div>
        <CInput
          id="guest-debt"
          v-model="guest.debt"
          type="number"
          :label="t('DEBT')"
          placeholder="Enter Debt Amount"
        />
      </div>
    </div>

    <!-- Submit Button -->
    <div class="mt-6 flex justify-end">
      <CButton variant="primary" @click="submitForm" class="w-full lg:w-auto">
        {{ t("Submit") }}
      </CButton>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import Navigation from "@/components/CNavigation.vue";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CButton from "@/components/CButton.vue";
import { useToast } from "@/composables/useToast";

// Define the type for a payment
interface Payment {
  date: string;
  amount: number | null;
}

// Define the type for the guest object
interface Guest {
  firstName: string;
  lastName: string;
  phone: string;
  enterDate: string;
  exitDate: string;
  room: string;
  wifiUsername: string;
  wifiPassword: string;
  reminder: string;
  dailyRate: number;
  payments: Payment[];
  paid: number;
  debt: number;
}

const { t } = useI18n();
const route = useRoute();
const { showError, showSuccess } = useToast();

// Check if we're editing (ID in route params)
const guestId = computed(() => route.params.id ? Number(route.params.id) : null);
const isEditing = computed(() => !!guestId.value);

// Guest Form Data
const guest = ref<Guest>({
  firstName: "",
  lastName: "",
  phone: "",
  enterDate: "",
  exitDate: "",
  room: "",
  wifiUsername: "",
  wifiPassword: "",
  reminder: "",
  dailyRate: 12000,
  payments: [
    { date: "2024-01-11", amount: 12000 },
    { date: "2024-01-13", amount: 10000 },
    { date: "", amount: null },
    { date: "", amount: null },
  ],
  paid: 22000,
  debt: 14000,
});

// Room Options
const roomOptions: { value: string; name: string }[] = [
  { value: "A210", name: "A210" },
  { value: "A211", name: "A211" },
  { value: "A212", name: "A212" },
];

// Submit Form
const submitForm = async (): Promise<void> => {
  try {
    console.log("Guest form submitted:", guest.value);
    
    if (isEditing.value) {
      // await guestService.update(guestId.value!, guest.value);
      showSuccess(t("Guest information updated successfully!"));
    } else {
      // await guestService.create(guest.value);
      showSuccess(t("Guest information created successfully!"));
    }
  } catch (error) {
    showError(t("Failed to save guest information. Please try again."));
  }
};

// Load guest from API if editing
const loadGuest = async (id: number) => {
  try {
    // const response = await guestService.getById(id);
    // const guestData = response.data;
    
    // For now, just show info message since guestService doesn't exist yet
    showError(t("Guest service not implemented yet"));
  } catch (error) {
    showError(t("Failed to load guest data"));
  }
};

onMounted(async () => {
  // If editing, load from API
  if (isEditing.value) {
    await loadGuest(guestId.value!);
  }
});
</script>

<style scoped>
/* Add custom styles if needed */
</style>
