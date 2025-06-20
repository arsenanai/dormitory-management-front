<template>
  <Navigation :title="t('Dormitory Information')">

    <!-- Education Information Settings -->
    <h2 class="mb-4 text-xl font-bold text-gray-800">
      {{ t("EDUCATION INFORMATION SETTINGS") }}
    </h2>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <CInput
        id="faculty"
        v-model="educationSettings.faculty"
        type="text"
        :label="t('Faculty')"
        readonly
      />
      <CInput
        id="specialist"
        v-model="educationSettings.specialist"
        type="text"
        :label="t('Specialist')"
        readonly
      />
      <div class="md:col-span-2">
        <CInput
          id="information-systems"
          v-model="educationSettings.informationSystems"
          type="text"
          :label="t('Information systems')"
          readonly
        />
      </div>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import Navigation from "@/components/CNavigation.vue";
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import CInput from "@/components/CInput.vue";

const { t } = useI18n();

// Education Settings
const educationSettings = ref({
  faculty: "Engineering and natural sciences",
  specialist: "Computer Science",
  informationSystems: "",
});
</script>

<style scoped>
/* Custom styles if needed */
</style>