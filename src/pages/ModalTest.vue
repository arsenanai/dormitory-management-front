<template>
  <div>
    <button data-testid="open-modal" @click="showForm = true">Open Modal</button>
    <div v-if="showForm" data-testid="test-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg max-w-md w-full">
        <h2>Test Modal</h2>
        <button data-testid="close-modal" @click="showForm = false">Close</button>
      </div>
    </div>
    <div id="debug-showform">showForm: {{ showForm }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const showForm = ref(false);
</script> 