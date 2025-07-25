<template>
  <Navigation :title="t('Guest page')">
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Guest First Name -->
      <div>
        <CInput
          id="guest-first-name"
          v-model="user.name"
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
          v-model="user.name"
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
          v-model="user.phone_numbers"
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
          v-model="guestProfile.enterDate"
          type="date"
          :label="t('Enter date')"
          required
        />
      </div>

      <!-- Exit Date -->
      <div>
        <CInput
          id="guest-exit-date"
          v-model="guestProfile.exitDate"
          type="date"
          :label="t('Exit date')"
          required
        />
      </div>

      <!-- Room Selection -->
      <div>
        <CSelect
          id="guest-room"
          v-model="guestProfile.room"
          :options="roomOptions"
          :label="t('Select room')"
          required
        />
      </div>

      <!-- WiFi Username -->
      <div>
        <CInput
          id="guest-wifi-username"
          v-model="guestProfile.wifiUsername"
          type="text"
          :label="t('Wifi Username')"
          placeholder="Enter WiFi Username"
        />
      </div>

      <!-- WiFi Password -->
      <div>
        <CInput
          id="guest-wifi-password"
          v-model="guestProfile.wifiPassword"
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
          v-model="guestProfile.reminder"
          class="w-full rounded border border-gray-300 p-2 focus:outline-none"
          placeholder="Enter Information or Reminder"
          rows="3"
        ></textarea>
      </div>
    </div>

    <hr class="my-4 border-t border-gray-300" />
    <div class="text-lg font-medium mb-2">{{ t('Guest Payments') }}</div>
    <div v-if="loadingPayments" class="text-gray-500">{{ t('Loading payments...') }}</div>
    <div v-else-if="paymentsError" class="text-red-600">{{ paymentsError }}</div>
    <CTable v-else :class="'mb-6'" v-if="guestPayments.length">
      <CTableHead>
        <CTableHeadCell>{{ t('Guest Name') }}</CTableHeadCell>
        <CTableHeadCell>{{ t('Room') }}</CTableHeadCell>
        <CTableHeadCell>{{ t('Dormitory') }}</CTableHeadCell>
        <CTableHeadCell>{{ t('Amount') }}</CTableHeadCell>
        <CTableHeadCell>{{ t('Status') }}</CTableHeadCell>
        <CTableHeadCell>{{ t('Check-in') }}</CTableHeadCell>
        <CTableHeadCell>{{ t('Check-out') }}</CTableHeadCell>
      </CTableHead>
      <CTableBody>
        <CTableRow v-for="(payment, idx) in guestPayments" :key="idx">
          <CTableCell>{{ payment.guest_name }}</CTableCell>
          <CTableCell>{{ payment.room }}</CTableCell>
          <CTableCell>{{ payment.dormitory }}</CTableCell>
          <CTableCell>{{ payment.amount }}</CTableCell>
          <CTableCell>{{ payment.status }}</CTableCell>
          <CTableCell>{{ payment.check_in_date }}</CTableCell>
          <CTableCell>{{ payment.check_out_date }}</CTableCell>
        </CTableRow>
      </CTableBody>
    </CTable>
    <div class="text-lg font-medium">{{ t("Payment info") }}</div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Daily Rate -->
      <div>
        <CInput
          id="guest-daily-rate"
          v-model="guestProfile.dailyRate"
          type="number"
          :label="t('Daily')"
          placeholder="Enter Daily Rate"
        />
      </div>

      <!-- Payment Rows -->
      <template v-for="(payment, index) in guestProfile.payments" :key="index">
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
          v-model="guestProfile.paid"
          type="number"
          :label="t('PAID')"
          placeholder="Enter Paid Amount"
        />
      </div>

      <!-- Debt -->
      <div>
        <CInput
          id="guest-debt"
          v-model="guestProfile.debt"
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
import { guestService } from '@/services/api';
import CTable from "@/components/CTable.vue";
import CTableHead from "@/components/CTableHead.vue";
import CTableHeadCell from "@/components/CTableHeadCell.vue";
import CTableBody from "@/components/CTableBody.vue";
import CTableRow from "@/components/CTableRow.vue";
import CTableCell from "@/components/CTableCell.vue";
import type { User } from "@/models/User";
import type { GuestProfile } from "@/models/GuestProfile";

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

// Guest Form Data (split into user and guestProfile)
const user = ref<Partial<User>>({
  name: "",
  email: "",
  phone_numbers: [""],
  password: "",
  confirmPassword: "",
});
const guestProfile = ref<Partial<GuestProfile>>({
  room_type: "",
  files: [],
  // ... add all other fields as needed
});

// Room Options
const roomOptions: { value: string; name: string }[] = [
  { value: "A210", name: "A210" },
  { value: "A211", name: "A211" },
  { value: "A212", name: "A212" },
];

const guestPayments = ref([]);
const loadingPayments = ref(false);
const paymentsError = ref("");

// Submit Form
const submitForm = async (): Promise<void> => {
  try {
    // Construct payload
    const payload = {
      user: {
        name: user.value.name,
        email: user.value.email,
        phone_numbers: user.value.phone_numbers,
        password: user.value.password,
        password_confirmation: user.value.confirmPassword,
      },
      profile: {
        ...guestProfile.value,
      },
    };
    if (isEditing.value) {
      await guestService.update(guestId.value, payload);
      showSuccess(t("Guest information updated successfully!"));
    } else {
      await guestService.create(payload);
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
  // Fetch guest payments
  loadingPayments.value = true;
  try {
    const response = await guestService.getPayments();
    guestPayments.value = response.data || [];
  } catch (e) {
    paymentsError.value = t('Failed to load guest payments');
    guestPayments.value = [];
  } finally {
    loadingPayments.value = false;
  }
});

// Populate the form if editing an existing guest
watch(
  () => guestId.value,
  async (id) => {
    if (id) {
      try {
        const response = await guestService.getById(id);
        const guestData = response.data;
        // Populate user fields
        user.value = {
          name: guestData.first_name || guestData.name || "",
          email: guestData.email || "",
          phone_numbers: guestData.phone_numbers?.length ? [...guestData.phone_numbers] : guestData.phone ? [guestData.phone] : [""]
        };
        // Populate guestProfile fields
        guestProfile.value = {
          room_type: guestData.guest_profile?.room_type || "",
          files: guestData.guest_profile?.files || [],
          // ... add all other fields as needed
        };
      } catch (error) {
        showError(t("Failed to load guest data"));
      }
    }
  },
  { immediate: true }
);
</script>

<style scoped>
/* Add custom styles if needed */
</style>
