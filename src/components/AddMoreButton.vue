<template>
    <FwbButton
        type="button"
        outline
        class="border-orange-500 focus:ring-orange-300 hover:border-orange-600 hover:bg-orange-500 text-orange-500 hover:text-white rounded-full p-3"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
    >
        <PlusIcon class="h-6 w-6" />
    </FwbButton>
</template>

<script setup>
import { FwbButton } from 'flowbite-vue';
import { PlusIcon } from '@heroicons/vue/24/outline';
</script>