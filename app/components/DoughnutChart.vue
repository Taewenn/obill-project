<script setup lang="ts">
import { Chart } from "chart.js/auto";
import { onMounted, ref, watch } from "vue";

// Props
interface Props {
    data: {
        labels: string[];
        datasets: {
            data: number[];
            backgroundColor: string[];
        }[];
    };
    options?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
    options: () => ({}),
});

// State
const chartRef = ref<HTMLCanvasElement | null>(null);
let chart: any = null;

// Methods
const initChart = () => {
    if (!chartRef.value) return;

    const ctx = chartRef.value.getContext("2d");
    if (!ctx) return;

    chart = new Chart(ctx, {
        type: "doughnut",
        data: props.data,
        options: {
            ...props.options,
            plugins: {
                legend: {
                    position: "bottom",
                },
            },
        },
    });
};

// Lifecycle hooks
onMounted(() => {
    initChart();
});

// Watchers
watch(
    () => props.data,
    () => {
        if (chart) {
            chart.data = props.data;
            chart.update();
        }
    },
    { deep: true }
);
</script>

<template>
    <canvas ref="chartRef" />
</template>
