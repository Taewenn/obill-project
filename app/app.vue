<script setup lang="ts">
// Composables
import { useTheme } from "~/composables/useTheme";

// State
const { theme } = useTheme();
</script>

<template>
    <div class="min-h-screen bg-background">
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>

<style>
@import "~/assets/css/globals.css";
</style>
