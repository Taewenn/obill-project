<script setup lang="ts">
// Composables
import { Button } from "~/components/ui/button";
import { useInvoicesStore } from "~/stores/invoices";

// State
const file = ref<File | null>(null);
const isUploading = ref(false);

// Methods
const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        file.value = target.files[0];
    }
};

const handleSubmit = async () => {
    if (!file.value) return;

    isUploading.value = true;
    try {
        const formData = new FormData();
        formData.append("file", file.value);
        const invoicesStore = useInvoicesStore();
        await invoicesStore.createInvoice(formData);
        navigateTo("/invoices");
    } catch (error) {
        console.error("Error uploading invoice:", error);
    } finally {
        isUploading.value = false;
    }
};
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-3xl font-bold">New Invoice</h1>
        </div>

        <form @submit.prevent="handleSubmit">
            <div class="space-y-4">
                <div class="grid w-full max-w-sm items-center gap-1.5">
                    <label
                        for="invoice"
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Invoice
                    </label>
                    <input
                        id="invoice"
                        type="file"
                        accept="application/pdf,image/*"
                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        :disabled="isUploading"
                        @change="handleFileChange"
                    />
                </div>

                <Button type="submit" :disabled="!file || isUploading">
                    {{ isUploading ? "Uploading..." : "Upload" }}
                </Button>
            </div>
        </form>
    </div>
</template>
