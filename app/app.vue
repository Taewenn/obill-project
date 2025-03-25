<script setup lang="ts">
import { Toaster } from "vue-sonner";
import { useTheme } from "~/composables/useTheme";

// State
const { theme } = useTheme();
</script>

<template>
    <div class="min-h-screen bg-background">
        <NuxtLayout>
            <NuxtPage />

            <ClientOnly>
                <Toaster />
            </ClientOnly>
        </NuxtLayout>
    </div>
</template>
