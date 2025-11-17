<template>
  <form class="flex flex-col gap-2" @submit.prevent="handleGuestRegistration">
    <div>
      <CSelect
        id="guest-room-type"
        v-model="guest.roomType"
        :options="roomTypeOptions"
        :label="t('Room Type')"
        required
      />
    </div>
    <div>
      <CInput
        id="guest-name"
        v-model="guest.name"
        type="text"
        :label="t('Fullname')"
        :placeholder="t('Fullname')"
        required
        pattern="^[a-zA-Z\s]+$"
      />
    </div>
    <div>
      <div class="flex flex-col gap-2">
        <div
          v-for="(file, index) in guest.files"
          :key="index"
          id="documents"
        >
          <CFileInput
            :id="`guest-file-${index}`"
            :label="`${t('Document')} ${index + 1}`"
            :allowedExtensions="['jpg', 'jpeg', 'png', 'pdf']"
            :maxFileSize="2 * 1024 * 1024"
            @change="(file) => updateGuestFileInput(index, file)"
          />
        </div>
        <div class="flex justify-end">
          <CButton @click="addGuestFileInput">
            {{ t("Upload more files") }}
          </CButton>
        </div>
      </div>
    </div>

    <CButton type="submit" class="mt-4 w-full" variant="primary">
      {{ t("Book Room") }}
    </CButton>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { roomTypeService } from '@/services/api';
import { RoomType } from '@/models/RoomType';
import i18n from '@/i18n';
import CInput from '@/components/CInput.vue';
import CButton from '@/components/CButton.vue';
import CSelect from '@/components/CSelect.vue';
import CFileInput from '@/components/CFileInput.vue';

const emit = defineEmits<{
  (e: 'registered', message: string): void;
}>();

const { t } = useI18n();
const authStore = useAuthStore();
const { showError } = useToast();

const guest = ref({ roomType: '', name: '', files: [null] as (File | null)[] });
const roomTypeOptions = ref<{ value: string; name: string }[]>([]);

async function fetchRoomTypes() {
  try {
    const response = await roomTypeService.getAll();
    const allowed = ['standard', 'lux'];
    roomTypeOptions.value = (response.data as RoomType[])
      .filter(rt => allowed.includes(rt.name.toLowerCase()))
      .map(rt => ({ value: rt.id, name: t(rt.name.charAt(0).toUpperCase() + rt.name.slice(1)) }));
  } catch (e) {
    roomTypeOptions.value = [];
  }
}

onMounted(fetchRoomTypes);
watch(() => i18n.global.locale, fetchRoomTypes);

const addGuestFileInput = () => guest.value.files.push(null);
const updateGuestFileInput = (index: number, file: File | null) => guest.value.files[index] = file;

const handleGuestRegistration = async () => {
  try {
    const payload = { name: guest.value.name, room_type: guest.value.roomType, user_type: 'guest' };
    const response = await authStore.register(payload);
    emit('registered', response?.message || t('Guest registration successful'));
  } catch (error) {
    showError(t('Registration failed'));
  }
};
</script>