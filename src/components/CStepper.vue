<template>
    <div class="w-full flex-1 flex flex-col items-stretch justify-between gap-4">
        <!-- Progress Bar -->
        <div class="relative pt-1">
            <div class="flex mb-2 items-center justify-center">
                <span class="text-lg font-semibold text-primary-700">
                    {{ currentStepTitle }}
                </span>
            </div>
            <div class="overflow-hidden h-2 text-xs flex rounded bg-primary-200">
                <div :style="{ width: progressPercentage + '%' }"
                    class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500">
                </div>
            </div>
        </div>

        <!-- Step Content -->
        <div class="step-content flex-auto flex flex-col items-stretch justify-items-between">
            <slot />
        </div>

        <!-- Navigation -->
        <div class="flex justify-between">
            <CButton v-if="!isFirstStep" @click="prevStep">
                {{ t('Previous') }}
            </CButton>
            <div v-else></div> <!-- Spacer -->

            <CButton v-if="!isLastStep" @click="nextStep" variant="primary" :disabled="!isCurrentStepValid">
                {{ t('Next') }}
            </CButton>
            <CButton v-else @click="finish" variant="primary" :disabled="!isCurrentStepValid">
                {{ t('Finish') }}
            </CButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, readonly } from 'vue';
import { useI18n } from 'vue-i18n';
import CButton from './CButton.vue';

interface Step {
    title: string;
    uid: number;
    validator?: () => boolean;
}

const props = defineProps<{
    modelValue: number; // The index of the current active step
}>();

const emit = defineEmits<{
    (event: 'update:modelValue', value: number): void;
    (event: 'finish'): void;
}>();

const { t } = useI18n();

const steps = ref<Step[]>([]);
const currentStepIndex = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
});

const registerStep = (step: Omit<Step, 'uid'> & { uid: number }): number => {
    steps.value.push(step);
    return steps.value.length - 1;
};

const updateStep = (index: number, newProps: Partial<Step>) => {
    if (steps.value[index]) {
        Object.assign(steps.value[index], newProps);
    }
};

provide('activeStepIndex', readonly(currentStepIndex));
provide('registerStep', registerStep);
provide('updateStep', updateStep);

const currentStepTitle = computed(() => {
    return steps.value[currentStepIndex.value]?.title || '';
});

const progressPercentage = computed(() => {
    const totalSteps = steps.value.length;
    if (totalSteps === 0) return 0;
    if (totalSteps === 1) return 100;
    // Calculate progress based on the number of completed steps, including the current one.
    return ((currentStepIndex.value + 1) / totalSteps) * 100;
});

const isFirstStep = computed(() => currentStepIndex.value === 0);
const isLastStep = computed(() => currentStepIndex.value === steps.value.length - 1);

const isCurrentStepValid = computed(() => {
    const currentStep = steps.value[currentStepIndex.value];
    if (!currentStep) {
        return false; // No step registered for the current index, so it's not valid.
    }
    // If a validator is provided, execute it. Otherwise, consider it valid.
    return typeof currentStep.validator === 'function' ? currentStep.validator() : true;
});

const nextStep = () => {
    // Only proceed if the current step is valid and it's not the last step.
    if (isCurrentStepValid.value && !isLastStep.value) {
        currentStepIndex.value++;
    }
};

const prevStep = () => {
    if (!isFirstStep.value) {
        currentStepIndex.value--;
    }
};

const finish = () => {
    emit('finish');
};
</script>