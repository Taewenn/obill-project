<script setup lang="ts">
// Composables
import { storeToRefs } from "pinia";
import { useInvoicesStore } from "~/stores/invoices";

// State
const invoicesStore = useInvoicesStore();
const { totalAmount, amountByCategory, amountByDepartment } =
    storeToRefs(invoicesStore);

// Loading
const isLoading = ref(true);

// Lifecycle hooks
onMounted(async () => {
    await Promise.all([
        invoicesStore.fetchTotalAmount(),
        invoicesStore.fetchAmountByCategory(),
        invoicesStore.fetchAmountByDepartment(),
    ]);
    isLoading.value = false;
});
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-3xl font-bold">Analytics</h1>
        </div>

        <!-- Stats -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div
                class="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
            >
                <div
                    class="flex flex-row items-center justify-between space-y-0 pb-2"
                >
                    <h3 class="text-sm font-medium">Total Amount</h3>
                    <Icon
                        name="lucide:euro"
                        class="h-4 w-4 text-muted-foreground"
                    />
                </div>
                <div class="text-2xl font-bold">
                    {{ isLoading ? "..." : `€${totalAmount.toLocaleString()}` }}
                </div>
            </div>
        </div>

        <!-- Charts -->
        <div class="grid gap-4 md:grid-cols-2">
            <div
                class="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
            >
                <h3 class="text-sm font-medium mb-4">Amount by Category</h3>
                <div class="h-[300px]">
                    <DoughnutChart
                        v-if="!isLoading"
                        :data="amountByCategory"
                        :options="{
                            responsive: true,
                            maintainAspectRatio: false,
                        }"
                    />
                </div>
            </div>

            <div
                class="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
            >
                <h3 class="text-sm font-medium mb-4">Amount by Department</h3>
                <div class="h-[300px]">
                    <DoughnutChart
                        v-if="!isLoading"
                        :data="amountByDepartment"
                        :options="{
                            responsive: true,
                            maintainAspectRatio: false,
                        }"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
