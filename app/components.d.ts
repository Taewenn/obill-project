declare module "@vue/runtime-core" {
    export interface GlobalComponents {
        Button: typeof import("./components/ui/button")["Button"];
        AlertDialog: typeof import("./components/ui/alert-dialog")["AlertDialog"];
        DoughnutChart: typeof import("vue-chartjs")["Doughnut"];
    }
}
