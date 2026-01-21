<template>
  <div>
    <h1>Library System</h1>
    <ul>
      <li><NuxtLink to="/readers">Readers</NuxtLink></li>
      <li><NuxtLink to="/books">Books</NuxtLink></li>
    </ul>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "main" });

console.log("Home page loaded");
</script>
