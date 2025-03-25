<script setup lang="ts">
import { Toaster } from "vue-sonner";
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
