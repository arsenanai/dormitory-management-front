<template>
    <Navigation :title="t('Payment Types')">
        <div class="flex flex-col gap-4">
            <div class="flex justify-end">
                <CButton @click="openCreateModal" data-testid="add-payment-type-button">
                    {{ t("Add Payment Type") }}
                </CButton>
            </div>

            <CTable :columns="tableColumns" :data="paymentTypesStore.paymentTypes" :loading="paymentTypesStore.loading">
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
        <CModal v-model="showModal" :title="editingType ? t('Edit Payment Type') : t('Add Payment Type')">
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <CInput v-model="formData.name" :label="t('Name')" :placeholder="t('Enter payment type name')"
                    required />
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
        <CConfirmationModal v-if="showDeleteModal" :title="t('Delete Payment Type')"
            :message="t('Are you sure you want to delete this payment type?')" @confirm="handleDelete"
            @cancel="showDeleteModal = false" />
    </Navigation>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import Navigation from "@/components/CNavigation.vue";
import CTable from "@/components/CTable.vue";
import CButton from "@/components/CButton.vue";
import CModal from "@/components/CModal.vue";
import CInput from "@/components/CInput.vue";
import CConfirmationModal from "@/components/CConfirmationModal.vue";
import { PencilSquareIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { usePaymentTypesStore } from "@/stores/paymentTypes";
import { useToast } from "@/composables/useToast";
import type { PaymentType } from "@/models/PaymentType";

const { t } = useI18n();
const { showSuccess, showError } = useToast();
const paymentTypesStore = usePaymentTypesStore();

const showModal = ref(false);
const showDeleteModal = ref(false);
const editingType = ref<PaymentType | null>(null);
const typeToDelete = ref<number | null>(null);
const formData = ref({ name: "" });

const tableColumns = [
    { key: "name", label: t("Name") },
    { key: "actions", label: t("Actions"), class: "text-right" },
];

onMounted(() => {
    paymentTypesStore.fetchPaymentTypes();
});

const openCreateModal = () => {
    editingType.value = null;
    formData.value.name = "";
    showModal.value = true;
};

const openEditModal = (type: PaymentType) => {
    editingType.value = type;
    formData.value.name = type.name;
    showModal.value = true;
};

const confirmDelete = (id: number) => {
    typeToDelete.value = id;
    showDeleteModal.value = true;
};

const handleSubmit = async () => {
    try {
        if (editingType.value) {
            await paymentTypesStore.updatePaymentType(editingType.value.id, formData.value);
            showSuccess(t("Payment type updated successfully"));
        } else {
            await paymentTypesStore.createPaymentType(formData.value);
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
