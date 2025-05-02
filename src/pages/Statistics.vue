<template>
  <Navigation :title="t('Dashboard')">
    <!-- Main Content -->
    <div
      class="grid h-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
    >
      <!-- Cards -->
      <div
        v-for="(card, index) in cards"
        :key="index"
        :class="
          card.bgClass +
          ' flex flex-row justify-between gap-2 rounded-lg p-2 text-center shadow lg:flex-col lg:justify-center lg:gap-4 lg:p-6'
        "
      >
        <div class="flex flex-col items-center justify-center">
          <div
            :class="
              card.iconBgClass +
              ' flex items-center justify-center rounded-full p-2 lg:p-4'
            "
          >
            <component
              :is="card.icon"
              class="h-4 w-4 lg:h-8 lg:w-8 xl:h-12 xl:w-12"
              :class="card.iconTextClass"
            />
          </div>
        </div>
        <div
          class="flex flex-1 flex-row items-center justify-between gap-2 lg:flex-none lg:flex-col lg:gap-4"
        >
          <h3
            :class="card.textClass"
            class="order-2 text-base font-semibold lg:order-1 lg:text-5xl lg:font-extrabold xl:text-6xl"
          >
            {{ card.value }}
          </h3>
          <p
            class="order-1 truncate text-sm font-medium text-blue-950 lg:order-2 lg:text-lg xl:text-xl"
          >
            {{ card.description }}
          </p>
        </div>
      </div>
    </div>
  </Navigation>
</template>

<script setup lang="ts">
import Navigation from "@/components/CNavigation.vue";
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
import { Card } from "@/models/Card"; // Import the Card interface

// Import the `t` function from vue-i18n
const { t } = useI18n();

// Card data array
const cards: Card[] = [
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
    value: 1758,
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
