<template>
  <Navigation :title="t('Dashboard')">
    <!-- Main Content -->
    <main class="flex-1 bg-white p-6 shadow flex flex-col">
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Cards -->
        <FwbCard
          v-for="(card, index) in cards"
          :key="index"
          :class="card.bgClass + ' text-center rounded-lg shadow p-6 flex flex-col justify-between h-full'"
        >
          <div class="flex items-center justify-center mb-4">
            <div
              :class="card.iconBgClass + ' p-4 rounded-full flex items-center justify-center'"
            >
              <component
                :is="card.icon"
                class="h-8 w-8"
                :class="card.iconTextClass"
              />
            </div>
          </div>
          <div>
            <h3 :class="card.textClass" class="text-5xl font-extrabold">
              {{ card.value }}
            </h3>
            <p class="text-gray-700 mt-2 text-lg font-medium">
              {{ card.description }}
            </p>
          </div>
        </FwbCard>
      </div>
    </main>
  </Navigation>
</template>

<script setup>
import Navigation from "@/components/Navigation.vue";
import { useI18n } from "vue-i18n";
import {
  HomeIcon,
  BuildingOfficeIcon,
  UserIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  NoSymbolIcon,
  AcademicCapIcon,
} from "@heroicons/vue/24/outline";

// Import the `t` function from vue-i18n
const { t } = useI18n();

// Card data array
const cards = [
  {
    value: 4,
    description: t("Number of dormitories"),
    bgClass: "bg-yellow-50",
    textClass: "text-yellow-600",
    icon: HomeIcon,
    iconBgClass: "bg-yellow-100",
    iconTextClass: "text-yellow-600",
  },
  {
    value: 268,
    description: t("Number of rooms"),
    bgClass: "bg-orange-50",
    textClass: "text-orange-600",
    icon: BuildingOfficeIcon,
    iconBgClass: "bg-orange-100",
    iconTextClass: "text-orange-600",
  },
  {
    value: 1200,
    description: t("Total number of beds"),
    bgClass: "bg-green-50",
    textClass: "text-green-600",
    icon: UsersIcon,
    iconBgClass: "bg-green-100",
    iconTextClass: "text-green-600",
  },
  {
    value: 112,
    description: t("Vacant beds"),
    bgClass: "bg-red-50",
    textClass: "text-red-600",
    icon: UserIcon,
    iconBgClass: "bg-red-100",
    iconTextClass: "text-red-600",
  },
  {
    value: 1088,
    description: t("Registered students"),
    bgClass: "bg-blue-50",
    textClass: "text-blue-600",
    icon: ClipboardDocumentListIcon,
    iconBgClass: "bg-blue-100",
    iconTextClass: "text-blue-600",
  },
  {
    value: 758,
    description: t("Current presence in dormitory"),
    bgClass: "bg-purple-50",
    textClass: "text-purple-600",
    icon: ChartPieIcon,
    iconBgClass: "bg-purple-100",
    iconTextClass: "text-purple-600",
  },
  {
    value: 1088,
    description: t("Meal paying students"),
    bgClass: "bg-yellow-100",
    textClass: "text-yellow-700",
    icon: CurrencyDollarIcon,
    iconBgClass: "bg-yellow-200",
    iconTextClass: "text-yellow-700",
  },
  {
    value: 0,
    description: t("Students without meal"),
    bgClass: "bg-pink-50",
    textClass: "text-pink-600",
    icon: NoSymbolIcon,
    iconBgClass: "bg-pink-100",
    iconTextClass: "text-pink-600",
  },
  {
    value: 32,
    description: t("Number of quota students"),
    bgClass: "bg-green-50",
    textClass: "text-green-800",
    icon: AcademicCapIcon,
    iconBgClass: "bg-green-100",
    iconTextClass: "text-green-800",
  },
];
</script>

<style scoped>
/* Add custom styles if needed */
</style>