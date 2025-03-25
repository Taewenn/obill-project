import { ref } from "vue";

interface Category {
    id: string;
    name: string;
}

export const useCategories = () => {
    const config = useRuntimeConfig();
    const apiBase = config.public.apiBase;

    // State
    const categories = ref<Category[]>([]);

    // Methods
    const fetchCategories = async () => {
        try {
            const response = await fetch(`${apiBase}/categories`);
            categories.value = await response.json();
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const createCategory = async (name: string) => {
        try {
            const response = await fetch(`${apiBase}/categories`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
            });
            const newCategory = await response.json();
            categories.value.push(newCategory);
            return newCategory;
        } catch (error) {
            console.error("Error creating category:", error);
            throw error;
        }
    };

    const deleteCategory = async (id: string) => {
        try {
            await fetch(`${apiBase}/categories/${id}`, {
                method: "DELETE",
            });
            categories.value = categories.value.filter(
                (category) => category.id !== id
            );
        } catch (error) {
            console.error("Error deleting category:", error);
            throw error;
        }
    };

    return {
        categories,
        fetchCategories,
        createCategory,
        deleteCategory,
    };
};
