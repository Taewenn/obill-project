<script setup lang="ts">
// Composables
import { AlertDialog } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { useDepartments } from "~/composables/useDepartments";

// State
const { departments } = useDepartments();
const showDeleteDialog = ref(false);
const selectedDepartmentId = ref<string | null>(null);
const showCreateDialog = ref(false);
const newDepartmentName = ref("");

// Loading
const isLoading = ref(true);

// Methods
const handleDelete = (id: string) => {
    selectedDepartmentId.value = id;
    showDeleteDialog.value = true;
};

const handleConfirmDelete = async () => {
    if (selectedDepartmentId.value) {
        await useDepartments().deleteDepartment(selectedDepartmentId.value);
        selectedDepartmentId.value = null;
    }
};

const handleCreate = async () => {
    if (newDepartmentName.value) {
        await useDepartments().createDepartment(newDepartmentName.value);
        newDepartmentName.value = "";
        showCreateDialog.value = false;
    }
};

// Lifecycle hooks
onMounted(async () => {
    await useDepartments().fetchDepartments();
    isLoading.value = false;
});
</script>

<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-3xl font-bold">Departments</h1>
            <Button @click="showCreateDialog = true"> New Department </Button>
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
                        v-else-if="departments.length === 0"
                        class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                        <td class="p-4" colspan="2">No departments found.</td>
                    </tr>
                    <tr
                        v-for="department in departments"
                        :key="department.id"
                        class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                        <td class="p-4">
                            {{ department.name }}
                        </td>
                        <td class="p-4">
                            <Button
                                variant="destructive"
                                @click="handleDelete(department.id)"
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
            description="This action cannot be undone. This will permanently delete the department."
            @confirm="handleConfirmDelete"
        />

        <!-- Create Dialog -->
        <AlertDialog
            v-model:open="showCreateDialog"
            title="Create Department"
            description="Enter the name of the new department."
        >
            <div class="mt-4">
                <input
                    v-model="newDepartmentName"
                    type="text"
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Department name"
                />
            </div>
            <div class="mt-4 flex justify-end space-x-2">
                <Button variant="outline" @click="showCreateDialog = false">
                    Cancel
                </Button>
                <Button :disabled="!newDepartmentName" @click="handleCreate">
                    Create
                </Button>
            </div>
        </AlertDialog>
    </div>
</template>
