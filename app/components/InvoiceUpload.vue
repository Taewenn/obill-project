<script setup lang="ts">
// Composables
import { useToast } from "@/composables/useToast";

// Types
import type { CreateInvoiceDto } from "@/types/dto";

// Props
const props = defineProps<{
    onSuccess?: () => void;
}>();

// State
const fileInputRef = ref<HTMLInputElement | null>(null);
const file = ref<File | null>(null);
const filePreview = ref<string | null>(null);
const isUploading = ref(false);
const invoiceData = ref<Partial<CreateInvoiceDto>>({});

// Loading
const isLoading = ref(false);

// Computed
const canSubmit = computed(() => file.value !== null);

// Methods
function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        file.value = input.files[0];

        // Create preview for image files
        if (file.value.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                filePreview.value = e.target?.result as string;
            };
            reader.readAsDataURL(file.value);
        } else {
            filePreview.value = null;
        }
    }
}

function resetForm() {
    file.value = null;
    filePreview.value = null;
    invoiceData.value = {};
    if (fileInputRef.value) {
        fileInputRef.value.value = "";
    }
}

async function uploadInvoice() {
    if (!file.value) return;

    isLoading.value = true;

    try {
        const formData = new FormData();
        formData.append("file", file.value);

        // Add any additional invoice data
        Object.entries(invoiceData.value).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });

        const response = await fetch("/api/invoices", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to upload invoice");
        }

        const toast = useToast();
        toast.success("Invoice uploaded successfully");
        resetForm();

        if (props.onSuccess) {
            props.onSuccess();
        }
    } catch (error) {
        const toast = useToast();
        toast.error("Failed to upload invoice");
        console.error("Upload error:", error);
    } finally {
        isLoading.value = false;
    }
}

function triggerFileInput() {
    fileInputRef.value?.click();
}
</script>

<template>
    <div class="space-y-4">
        <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            @click="triggerFileInput"
            :class="{ 'bg-gray-50': filePreview }"
        >
            <input
                ref="fileInputRef"
                type="file"
                accept="image/*,.pdf"
                class="hidden"
                @change="handleFileChange"
            />

            <div v-if="!filePreview" class="text-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-12 w-12 text-gray-400 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                </svg>
                <p class="text-sm font-medium text-gray-900">
                    Click to upload or drag and drop
                </p>
                <p class="text-xs text-gray-500 mt-1">
                    PDF, PNG, JPG (max. 10MB)
                </p>
            </div>

            <div v-else class="w-full">
                <img
                    v-if="filePreview"
                    :src="filePreview"
                    class="max-h-40 mx-auto rounded"
                />
                <div class="mt-3 text-center">
                    <p class="text-sm font-medium text-gray-900 truncate">
                        {{ file?.name }}
                    </p>
                    <p class="text-xs text-gray-500">
                        {{ Math.round((file?.size || 0) / 1024) }} KB
                    </p>
                </div>
            </div>
        </div>

        <div class="flex justify-end space-x-2">
            <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                @click="resetForm"
                :disabled="!file || isLoading"
            >
                Reset
            </button>
            <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                @click="uploadInvoice"
                :disabled="!canSubmit || isLoading"
            >
                <span v-if="isLoading">
                    <svg
                        class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                        ></circle>
                        <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    Uploading...
                </span>
                <span v-else>Upload Invoice</span>
            </button>
        </div>
    </div>
</template>
