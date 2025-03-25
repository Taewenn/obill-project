import { ref } from "vue";

interface Department {
    id: string;
    name: string;
}

export const useDepartments = () => {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBase;

    // State
    const departments = ref<Department[]>([]);

    // Methods
    const fetchDepartments = async () => {
        try {
            const response = await fetch(`${apiBase}/departments`);
            departments.value = await response.json();
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    const createDepartment = async (name: string) => {
        try {
            const response = await fetch(`${apiBase}/departments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
            });
            const newDepartment = await response.json();
            departments.value.push(newDepartment);
            return newDepartment;
        } catch (error) {
            console.error("Error creating department:", error);
            throw error;
        }
    };

    const deleteDepartment = async (id: string) => {
        try {
            await fetch(`${apiBase}/departments/${id}`, {
                method: "DELETE",
            });
            departments.value = departments.value.filter(
                (department) => department.id !== id
            );
        } catch (error) {
            console.error("Error deleting department:", error);
            throw error;
        }
    };

    return {
        departments,
        fetchDepartments,
        createDepartment,
        deleteDepartment,
    };
};
