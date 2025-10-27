<script setup lang="ts">
defineProps<{
  form: {
    name: string;
    respectEarlySelection: boolean;
    isWeightedSelection: boolean;
    people: { name: string; weight: number; isSelected: boolean }[];
  };
  isEdit?: boolean;
}>();

const emit = defineEmits(['addPerson', 'removePerson', 'submit', 'cancel']);
</script>

<template>
  <form @submit.prevent="emit('submit')">
    <h2>{{ isEdit ? 'Edit Group' : 'Create Group' }}</h2>
    <label>
      Group Name:
      <input v-model="form.name" required />
    </label>
    <label>
      Respect Early Selection:
      <input type="checkbox" v-model="form.respectEarlySelection" />
    </label>
    <label>
      Weighted Selection:
      <input type="checkbox" v-model="form.isWeightedSelection" />
    </label>
    <div>
      <h3>People</h3>
      <div v-for="(person, idx) in form.people" :key="idx" style="margin-bottom: 8px;">
        <input v-model="person.name" placeholder="Name" required />
        <input
          v-model.number="person.weight"
          type="number"
          min="1"
          max="10"
          placeholder="Weight"
          :disabled="!form.isWeightedSelection"
          required
        />
        <button type="button" @click="emit('removePerson', idx)">Remove</button>
      </div>
      <button type="button" @click="emit('addPerson')">Add Person</button>
    </div>
    <div style="margin-top: 16px;">
      <button type="submit">{{ isEdit ? 'Save' : 'Create' }}</button>
      <button type="button" @click="emit('cancel')">Cancel</button>
    </div>
  </form>
</template>

