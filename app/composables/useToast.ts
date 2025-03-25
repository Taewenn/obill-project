// Define the toast interface
interface Toast {
    id: number;
    message: string;
    type: "success" | "error" | "info" | "warning";
    duration: number;
}

// Create a simple global state for toasts
const toasts: Toast[] = [];
let nextId = 0;

export function useToast() {
    const addToast = (toast: Omit<Toast, "id">) => {
        const id = nextId++;
        const newToast = { ...toast, id };
        toasts.push(newToast);

        setTimeout(() => {
            removeToast(id);
        }, toast.duration);

        return id;
    };

    const removeToast = (id: number) => {
        const index = toasts.findIndex((toast: Toast) => toast.id === id);
        if (index !== -1) {
            toasts.splice(index, 1);
        }
    };

    const success = (message: string, duration = 3000) => {
        return addToast({ message, type: "success", duration });
    };

    const error = (message: string, duration = 5000) => {
        return addToast({ message, type: "error", duration });
    };

    const info = (message: string, duration = 3000) => {
        return addToast({ message, type: "info", duration });
    };

    const warning = (message: string, duration = 4000) => {
        return addToast({ message, type: "warning", duration });
    };

    return {
        toasts,
        success,
        error,
        info,
        warning,
        remove: removeToast,
    };
}
