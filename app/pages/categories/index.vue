<script setup lang="ts">
// Composables
import { AlertDialog } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { useCategories } from "~/composables/useCategories";

// State
const { categories } = useCategories();
const showDeleteDialog = ref(false);
const selectedCategoryId = ref<string | null>(null);
const showCreateDialog = ref(false);
const newCategoryName = ref("");

// Loading
const isLoading = ref(true);

// Methods
const handleDelete = (id: string) => {
    selectedCategoryId.value = id;
    showDeleteDialog.value = true;
};

const handleConfirmDelete = async () => {
    if (selectedCategoryId.value) {
        await useCategories().deleteCategory(selectedCategoryId.value);
        selectedCategoryId.value = null;
    }
};

const handleCreate = async () => {
    if (newCategoryName.value) {
        await useCategories().createCategory(newCategoryName.value);
        newCategoryName.value = "";
        showCreateDialog.value = false;
    }
};

// Lifecycle hooks
onMounted(async () => {
    await useCategories().fetchCategories();
    isLoading.value = false;
});
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-3xl font-bold">Categories</h1>
            <Button @click="showCreateDialog = true"> New Category </Button>
        </div>

        <pre>{{ categories }}</pre>

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
                            Name
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
                        <td class="p-4" colspan="2">Loading...</td>
                    </tr>
                    <tr
                        v-else-if="categories.length === 0"
                        class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                        <td class="p-4" colspan="2">No categories found.</td>
                    </tr>
                    <tr
                        v-for="category in categories"
                        :key="category.id"
                        class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                        <td class="p-4">
                            {{ category.name }}
                        </td>
                        <td class="p-4">
                            <Button
                                variant="destructive"
                                @click="handleDelete(category.id)"
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
            description="This action cannot be undone. This will permanently delete the category."
            @confirm="handleConfirmDelete"
        />

        <!-- Create Dialog -->
        <AlertDialog
            v-model:open="showCreateDialog"
            title="Create Category"
            description="Enter the name of the new category."
        >
            <div class="mt-4">
                <input
                    v-model="newCategoryName"
                    type="text"
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Category name"
                />
            </div>
            <div class="mt-4 flex justify-end space-x-2">
                <Button variant="outline" @click="showCreateDialog = false">
                    Cancel
                </Button>
                <Button :disabled="!newCategoryName" @click="handleCreate">
                    Create
                </Button>
            </div>
        </AlertDialog>
    </div>
</template>
