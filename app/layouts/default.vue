<script setup lang="ts">
// Composables
import { useTheme } from "~/composables/useTheme";

// State
const { theme, toggleTheme } = useTheme();

// Lifecycle hooks
onMounted(() => {
    useTheme().initTheme();
    useTheme().watchSystemTheme();
});
</script>

<template>
    <div class="relative flex min-h-screen flex-col">
        <!-- Header -->
        <header
            class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
            <div class="container flex h-14 items-center">
                <div class="mr-4 flex">
                    <NuxtLink to="/" class="mr-6 flex items-center space-x-2">
                        <span class="font-bold">OBill</span>
                    </NuxtLink>
                    <nav
                        class="flex items-center space-x-6 text-sm font-medium"
                    >
                        <NuxtLink
                            to="/invoices"
                            class="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Invoices
                        </NuxtLink>
                        <NuxtLink
                            to="/categories"
                            class="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Categories
                        </NuxtLink>
                        <NuxtLink
                            to="/departments"
                            class="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Departments
                        </NuxtLink>
                        <NuxtLink
                            to="/analytics"
                            class="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Analytics
                        </NuxtLink>
                    </nav>
                </div>
                <div class="flex flex-1 items-center justify-end space-x-2">
                    <button
                        class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                        @click="toggleTheme"
                    >
                        <Icon
                            :name="
                                theme === 'light' ? 'lucide:moon' : 'lucide:sun'
                            "
                            class="h-5 w-5"
                        />
                    </button>
                </div>
            </div>
        </header>

        <!-- Main content -->
        <main class="flex-1">
            <div class="container py-6">
                <slot />
            </div>
        </main>
    </div>
</template>
