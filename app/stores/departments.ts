import { defineStore } from "pinia";

interface Department {
    id: string;
    name: string;
}

export const useDepartmentsStore = defineStore("departments", {
    state: () => ({
        departments: [] as Department[],
    }),

    actions: {
        async fetchDepartments() {
            try {
                const config = useRuntimeConfig();
                const apiBase = config.public.apiBase;
                const response = await fetch(`${apiBase}/departments`);
                this.departments = await response.json();
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        },

        async createDepartment(name: string) {
            try {
                const config = useRuntimeConfig();
                const apiBase = config.public.apiBase;
                const response = await fetch(`${apiBase}/departments`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name }),
                });
                const newDepartment = await response.json();
                this.departments.push(newDepartment);
                return newDepartment;
            } catch (error) {
                console.error("Error creating department:", error);
                throw error;
            }
        },

        async deleteDepartment(id: string) {
            try {
                const config = useRuntimeConfig();
                const apiBase = config.public.apiBase;
                await fetch(`${apiBase}/departments/${id}`, {
                    method: "DELETE",
                });
                this.departments = this.departments.filter(
                    (department: Department) => department.id !== id
                );
            } catch (error) {
                console.error("Error deleting department:", error);
                throw error;
            }
        },
    },
});
