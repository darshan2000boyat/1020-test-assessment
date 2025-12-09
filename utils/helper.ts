import React from "react";
import type { TimesheetData, TimesheetResData } from "@/types/timesheet";


export function transformTimesheetResData(json: { data: TimesheetResData[] }) {
    const transformed: TimesheetData[] = (json.data ?? []).map((item: any) => {
        const tsDate = item.timesheet_date;

        return {
            id: item.id,
            documentId: item.documentId,
            totalHours: item.totalHours,
            workStatus: item.workStatus,
            tasks: item.tasks,
            week: tsDate?.week,
            year: tsDate?.year,
            month: tsDate?.month,
            startDate: tsDate?.startDate,
            endDate: tsDate?.endDate,
            dateRange: tsDate?.dateRange,
        };
    });

    return transformed;
}

export const getStatusColor = (status: string) => {
    switch (status) {
        case "COMPLETED":
            return "bg-emerald-100 text-emerald-700 border-emerald-200";
        case "INCOMPLETE":
            return "bg-amber-100 text-amber-700 border-amber-200";
        case "MISSING":
            return "bg-red-100 text-red-700 border-red-200";
        default:
            return "bg-gray-100 text-gray-700 border-gray-200";
    }
};
export const getStatusLabel = (status: string) => {
    switch (status) {
        case "COMPLETED": return "Completed";
        case "INCOMPLETE": return "Incomplete";
        case "MISSING": return "Missing";
        default: return status;
    }
};