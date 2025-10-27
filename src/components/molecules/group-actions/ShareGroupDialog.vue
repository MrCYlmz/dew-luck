<script setup lang="ts">
import { ref, computed } from 'vue';
import type { GroupDetails } from '@/types.ts';
import { encodeGroupToUrl } from '@/utils/urlSharing.ts';

const props = defineProps<{
  group?: GroupDetails;
}>();
const emit = defineEmits(['closed']);

const dialogRef = ref<HTMLDialogElement>();
const copySuccess = ref(false);

const shareUrl = computed(() => {
  if (!props.group) return '';
  return encodeGroupToUrl({
    name: props.group.name,
    respectEarlySelection: props.group.respectEarlySelection,
    people: props.group.people,
  });
});

function openDialog() {
  copySuccess.value = false;
  dialogRef.value?.showModal();
}

function closeDialog() {
  dialogRef.value?.close();
  emit('closed');
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }
}

defineExpose({ openDialog, closeDialog });
</script>

<template>
  <dialog ref="dialogRef">
    <form @submit.prevent="closeDialog">
      <h2>Share Group</h2>
      <p>Share this URL to let others view and import <strong>{{ props.group?.name }}</strong>:</p>

      <div class="share-content">
        <input
          type="text"
          class="share-url-input"
          :value="shareUrl"
          readonly
          @click="($event.target as HTMLInputElement).select()"
        />
        <button type="button" class="copy-button" @click="copyToClipboard">
          {{ copySuccess ? 'Copied!' : 'Copy to Clipboard' }}
        </button>
        <div v-if="copySuccess" class="success-message">
          URL copied successfully!
        </div>
      </div>
      <div class="actions">
        <button type="submit">Close</button>
      </div>
    </form>
  </dialog>
</template>

<style scoped>
.share-content {
  margin-top: 16px;
  margin-bottom: 16px;
}

.share-url-input {
  width: 100%;
  padding: 8px;
  margin-bottom: 12px;
  font-size: 12px;
  font-family: monospace;
  box-sizing: border-box;
}

.copy-button {
  justify-self: center;
  display: block;
  margin-bottom: 8px;
}

.success-message {
  color: green;
  font-size: 14px;
}

.actions {
  margin-top: 16px;
}
</style>
