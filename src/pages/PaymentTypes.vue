<template>
  <Navigation :title="t('Payment Types')">
    <div class="flex flex-col gap-4">
      <div class="flex justify-end">
        <CButton @click="openCreateModal" data-testid="add-payment-type-button">
          {{ t("Add Payment Type") }}
        </CButton>
      </div>

      <CTable :columns="tableColumns" :data="tableData" :loading="paymentTypesStore.loading">
        <template #cell-frequency="{ row: type }">
          <span class="capitalize">{{ type.frequency }}</span>
        </template>
        <template #cell-calculation_method="{ row: type }">
          <span class="text-sm">{{ formatCalculationMethod(type.calculation_method) }}</span>
        </template>
        <template #cell-fixed_amount="{ row: type }">
          <span v-if="type.fixed_amount !== null">{{ formatCurrency(type.fixed_amount) }}</span>
          <span v-else class="text-gray-400">-</span>
        </template>
        <template #cell-target_role="{ row: type }">
          <span class="capitalize">{{ type.target_role }}</span>
        </template>
        <template #cell-trigger_event="{ row: type }">
          <span v-if="type.trigger_event" class="text-sm">{{
            formatTriggerEvent(type.trigger_event)
          }}</span>
          <span v-else class="text-gray-400">-</span>
        </template>
        <template #cell-actions="{ row: type }">
          <div class="flex justify-end gap-2">
            <CButton @click="openEditModal(type)">
              <PencilSquareIcon class="h-5 w-5" />
            </CButton>
            <CButton variant="danger" @click="confirmDelete(type.id)">
              <TrashIcon class="h-5 w-5" />
            </CButton>
          </div>
        </template>
      </CTable>
    </div>

    <!-- Create/Edit Modal -->
    <CModal
      v-model="showModal"
      :title="editingType ? t('Edit Payment Type') : t('Add Payment Type')"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <CInput
          v-model="formData.name"
          :label="t('Name')"
          :placeholder="t('Enter payment type name')"
          required
        />

        <CSelect
          v-model="formData.frequency"
          :label="t('Frequency')"
          :options="frequencyOptions"
          required
        />

        <CSelect
          v-model="formData.calculation_method"
          :label="t('Calculation Method')"
          :options="calculationMethodOptions"
          required
          @update:model-value="handleCalculationMethodChange"
        />

        <CInput
          v-if="formData.calculation_method === 'fixed'"
          v-model="formData.fixed_amount"
          type="number"
          step="0.01"
          min="0"
          :label="t('Fixed Amount')"
          :placeholder="t('Enter fixed amount')"
          required
        />

        <CSelect
          v-model="formData.target_role"
          :label="t('Target Role')"
          :options="targetRoleOptions"
          required
        />

        <CSelect
          v-model="formData.trigger_event"
          :label="t('Trigger Event')"
          :options="triggerEventOptions"
        />

        <div class="mt-6 flex justify-end gap-2">
          <CButton @click="showModal = false">
            {{ t("Cancel") }}
          </CButton>
          <CButton type="submit" variant="primary" :loading="paymentTypesStore.loading">
            {{ editingType ? t("Update") : t("Create") }}
          </CButton>
        </div>
      </form>
    </CModal>

    <!-- Delete Confirmation -->
    <CConfirmationModal
      v-if="showDeleteModal"
      :title="t('Delete Payment Type')"
      :message="t('Are you sure you want to delete this payment type?')"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
  </Navigation>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CTable from "@/components/CTable.vue";
import CButton from "@/components/CButton.vue";
import CModal from "@/components/CModal.vue";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CConfirmationModal from "@/components/CConfirmationModal.vue";
import { PencilSquareIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { usePaymentTypesStore } from "@/stores/paymentTypes";
import { useToast } from "@/composables/useToast";
import { useSettingsStore } from "@/stores/settings";
import { getCurrencySymbol } from "@/utils/formatters";
import type { PaymentType } from "@/models/PaymentType";

const { t } = useI18n();
const { showSuccess, showError } = useToast();
const paymentTypesStore = usePaymentTypesStore();
const settingsStore = useSettingsStore();

const showModal = ref(false);
const showDeleteModal = ref(false);
const editingType = ref<PaymentType | null>(null);
const typeToDelete = ref<number | null>(null);
const formData = ref({
  name: "",
  frequency: "monthly" as PaymentType["frequency"],
  calculation_method: "fixed" as PaymentType["calculation_method"],
  fixed_amount: null as number | null,
  target_role: "student" as PaymentType["target_role"],
  trigger_event: "" as PaymentType["trigger_event"] | "",
});

const frequencyOptions = [
  { value: "monthly", name: t("Monthly") },
  { value: "semesterly", name: t("Semesterly") },
  { value: "once", name: t("Once") },
];

const calculationMethodOptions = [
  { value: "room_semester_rate", name: t("Room Semester Rate") },
  { value: "room_daily_rate", name: t("Room Daily Rate") },
  { value: "fixed", name: t("Fixed Amount") },
];

const targetRoleOptions = [
  { value: "student", name: t("Student") },
  { value: "guest", name: t("Guest") },
];

const triggerEventOptions = [
  { value: "", name: "—" },
  { value: "registration", name: t("Registration") },
  { value: "new_semester", name: t("New Semester") },
  { value: "new_month", name: t("New Month") },
  { value: "new_booking", name: t("New Booking") },
  { value: "room_type_change", name: t("Room Type Change") },
];

const tableColumns = [
  { key: "name", label: t("Name") },
  { key: "frequency", label: t("Frequency") },
  { key: "calculation_method", label: t("Calculation Method") },
  { key: "fixed_amount", label: t("Fixed Amount") },
  { key: "target_role", label: t("Target Role") },
  { key: "trigger_event", label: t("Trigger Event") },
  { key: "actions", label: t("Actions"), class: "text-right" },
];

const currencySymbol = computed(() =>
  getCurrencySymbol(settingsStore.publicSettings?.currency_symbol)
);

const tableData = computed(() => {
  const p = paymentTypesStore.paymentTypes;
  return Array.isArray(p) ? p : [];
});

const formatCalculationMethod = (method: string): string => {
  const methods: Record<string, string> = {
    room_semester_rate: t("Room Semester Rate"),
    room_daily_rate: t("Room Daily Rate"),
    fixed: t("Fixed Amount"),
  };
  return methods[method] || method;
};

const formatTriggerEvent = (event: string): string => {
  const events: Record<string, string> = {
    registration: t("Registration"),
    new_semester: t("New Semester"),
    new_month: t("New Month"),
    new_booking: t("New Booking"),
    room_type_change: t("Room Type Change"),
  };
  return events[event] || event;
};

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null || typeof amount !== "number" || Number.isNaN(amount)) return "—";
  return `${Number(amount).toFixed(2)} ${currencySymbol.value}`;
};

const handleCalculationMethodChange = () => {
  // Clear fixed_amount if calculation method is not 'fixed'
  if (formData.value.calculation_method !== "fixed") {
    formData.value.fixed_amount = null;
  }
};

onMounted(async () => {
  await settingsStore.fetchPublicSettings();
  await paymentTypesStore.fetchPaymentTypes();
});

const openCreateModal = () => {
  editingType.value = null;
  formData.value = {
    name: "",
    frequency: "monthly",
    calculation_method: "fixed",
    fixed_amount: null,
    target_role: "student",
    trigger_event: "",
  };
  showModal.value = true;
};

const openEditModal = (type: PaymentType) => {
  editingType.value = type;
  formData.value = {
    name: type.name,
    frequency: type.frequency,
    calculation_method: type.calculation_method,
    fixed_amount: type.fixed_amount,
    target_role: type.target_role,
    trigger_event: type.trigger_event ?? "",
  };
  showModal.value = true;
};

const confirmDelete = (id: number) => {
  typeToDelete.value = id;
  showDeleteModal.value = true;
};

const payload = (): Partial<PaymentType> => {
  const data = { ...formData.value };
  if (data.trigger_event === "" || data.trigger_event === null) {
    data.trigger_event = null;
  }
  if (data.calculation_method !== "fixed") {
    data.fixed_amount = null;
  }
  return data as Partial<PaymentType>;
};

const handleSubmit = async () => {
  try {
    if (editingType.value) {
      await paymentTypesStore.updatePaymentType(editingType.value.id, payload());
      showSuccess(t("Payment type updated successfully"));
    } else {
      await paymentTypesStore.createPaymentType(payload());
      showSuccess(t("Payment type created successfully"));
    }
    showModal.value = false;
  } catch (err) {
    showError(t("Failed to save payment type"));
  }
};

const handleDelete = async () => {
  if (typeToDelete.value === null) return;
  try {
    await paymentTypesStore.deletePaymentType(typeToDelete.value);
    showSuccess(t("Payment type deleted successfully"));
    showDeleteModal.value = false;
  } catch (err) {
    showError(t("Failed to delete payment type"));
  }
};
</script>
