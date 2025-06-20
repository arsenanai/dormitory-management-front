<!-- filepath: /Users/rsa/lab/dormitory-management-front/src/pages/PaymentForm.vue -->
<template>
  <Navigation :title="t('Payment Form')">
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Fee -->
      <div>
        <CInput
          id="fee"
          v-model="form.fee"
          type="number"
          :label="t('Fee')"
          placeholder="0"
          required
        />
      </div>
      <!-- Discount -->
      <div>
        <CInput
          id="discount"
          v-model="form.discount"
          type="number"
          :label="t('Discount (%)')"
          placeholder="0"
        />
      </div>
    </div>

    <!-- Calculated Amount -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 mt-4">
      <div>
        <CInput
          id="calculated-amount"
          :model-value="calculatedAmount"
          :label="t('Calculated Amount')"
          readonly
        />
      </div>
    </div>

    <!-- Payment Details -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 mt-4">
      <div>
        <CInput
          id="payment-date"
          v-model="form.paymentDate"
          type="date"
          :label="t('Payment Date')"
          required
        />
      </div>
      <div>
        <CSelect
          id="payment-type"
          v-model="form.paymentType"
          :options="paymentTypeOptions"
          :label="t('Payment Type')"
          required
        />
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 mt-4">
      <div>
        <CInput
          id="payment-amount"
          v-model="form.paymentAmount"
          type="number"
          :label="t('Payment Amount')"
          required
        />
      </div>
    </div>

    <!-- Totals -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 mt-6">
      <div>
        <CInput
          id="remaining-payment"
          :model-value="remainingPayment"
          :label="t('Remaining Payment')"
          readonly
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
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CInput from "@/components/CInput.vue";
import CSelect from "@/components/CSelect.vue";
import CButton from "@/components/CButton.vue";

// Payment type options
const paymentTypeOptions = [
  { value: "qr", name: "QR CODE" },
  { value: "cash", name: "Cash" },
  { value: "bank", name: "Bank Transfer" },
];

const { t } = useI18n();
const form = ref({
  fee: 480000,
  discount: 0,
  paymentDate: "",
  paymentType: "",
  paymentAmount: 0,
});

const calculatedAmount = computed(() => {
  const fee = Number(form.value.fee) || 0;
  const discount = Number(form.value.discount) || 0;
  return Math.round(fee * (1 - discount / 100));
});

const remainingPayment = computed(() =>
  calculatedAmount.value - (Number(form.value.paymentAmount) || 0)
);

function submitForm() {
  // You can send form.value to your API here
  alert(
    t("Submitted") +
      ":\n" +
      JSON.stringify(
        {
          ...form.value,
          calculatedAmount: calculatedAmount.value,
          remainingPayment: remainingPayment.value,
        },
        null,
        2
      )
  );
}
</script>