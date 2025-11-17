<template>
    <div v-show="isActive" role="tabpanel" class="flex-1 flex flex-col items-stretch h-full">
        <slot />
    </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, computed, Ref, getCurrentInstance, watch } from 'vue';

const props = defineProps<{
    title: string;
    validator?: () => boolean;
}>();

const instance = getCurrentInstance();
const stepIndex = ref<number | -1>(-1);

const activeStepIndex = inject<Ref<number>>('activeStepIndex');
const registerStep = inject<(step: { uid: number; title: string; validator?: () => boolean; }) => number>('registerStep');
const updateStep = inject<(index: number, newProps: { title: string; validator?: () => boolean; }) => void>('updateStep');

if (!activeStepIndex || !registerStep || !updateStep) {
    throw new Error('CStep must be used within a CStepper component that provides activeStepIndex, registerStep, and updateStep.');
}

onMounted(() => {
    if (instance) {
        stepIndex.value = registerStep({ uid: instance.uid, title: props.title, validator: props.validator });
    }
});

watch(() => props.validator, (newValidator) => {
    if (stepIndex.value !== -1 && updateStep) {
        updateStep(stepIndex.value, { title: props.title, validator: newValidator });
    }
});

const isActive = computed(() => stepIndex.value === activeStepIndex.value);
</script>