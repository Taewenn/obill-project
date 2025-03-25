<script setup lang="ts">
// Composables
import { useRouter } from "vue-router";

// Components
import InvoiceUpload from "@/components/InvoiceUpload.vue";

// State
const router = useRouter();

// Methods
function handleSuccess() {
    router.push("/invoices");
}

function handleCancel() {
    router.push("/invoices");
}
</script>

<template>
    <div class="container mx-auto py-8">
        <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border p-6">
            <div class="mb-6">
                <h3 class="text-2xl font-semibold mb-2">Add New Invoice</h3>
                <p class="text-sm text-gray-500">
                    Upload an invoice image or PDF file. The system will
                    automatically extract information.
                </p>
            </div>

            <div class="mb-6">
                <InvoiceUpload :onSuccess="handleSuccess" />
            </div>

            <div class="flex justify-between">
                <button
                    type="button"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                    @click="handleCancel"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
</template>
