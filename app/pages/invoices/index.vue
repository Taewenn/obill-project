<script setup lang="ts">
// Composables
import { AlertDialog } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { useInvoices } from "~/composables/useInvoices";

// State
const { invoices } = useInvoices();
const showDeleteDialog = ref(false);
const selectedInvoiceId = ref<string | null>(null);

// Loading
const isLoading = ref(true);

// Methods
const handleDelete = (id: string) => {
    selectedInvoiceId.value = id;
    showDeleteDialog.value = true;
};

const handleConfirmDelete = async () => {
    if (selectedInvoiceId.value) {
        await useInvoices().deleteInvoice(selectedInvoiceId.value);
        selectedInvoiceId.value = null;
    }
};

// Lifecycle hooks
onMounted(async () => {
    await useInvoices().fetchInvoices();
    isLoading.value = false;
});
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-3xl font-bold">Invoices</h1>
            <NuxtLink to="/invoices/new">
                <Button>New Invoice</Button>
            </NuxtLink>
        </div>

        <!-- Table -->
        <div class="rounded-md border">
            <table class="w-full">
                <thead>
                    <tr
                        class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                        <th
                            class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                        >
                            File Name
                        </th>
                        <th
                            class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                        >
                            Amount
                        </th>
                        <th
                            class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                        >
                            Date
                        </th>
                        <th
                            class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                        >
                            Category
                        </th>
                        <th
                            class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                        >
                            Department
                        </th>
                        <th
                            class="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-if="isLoading"
                        class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                        <td class="p-4" colspan="6">Loading...</td>
                    </tr>
                    <tr
                        v-else-if="invoices.length === 0"
                        class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                        <td class="p-4" colspan="6">No invoices found.</td>
                    </tr>
                    <tr
                        v-for="invoice in invoices"
                        :key="invoice.id"
                        class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                        <td class="p-4">
                            {{ invoice.fileName }}
                        </td>
                        <td class="p-4">
                            €{{ invoice.amount.toLocaleString() }}
                        </td>
                        <td class="p-4">
                            {{ new Date(invoice.date).toLocaleDateString() }}
                        </td>
                        <td class="p-4">
                            {{ invoice.category?.name || "-" }}
                        </td>
                        <td class="p-4">
                            {{ invoice.department?.name || "-" }}
                        </td>
                        <td class="p-4">
                            <Button
                                variant="destructive"
                                @click="handleDelete(invoice.id)"
                            >
                                Delete
                            </Button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Delete Dialog -->
        <AlertDialog
            v-model:open="showDeleteDialog"
            title="Are you sure?"
            description="This action cannot be undone. This will permanently delete the invoice."
            @confirm="handleConfirmDelete"
        />
    </div>
</template>
