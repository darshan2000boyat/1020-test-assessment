"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
    flexRender,
} from "@tanstack/react-table";
import { Clock, Calendar, ChevronLeft, ChevronRight, Ellipsis, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import CreateTimesheetForm from "./CreateTimesheetForm";
import { toast } from "react-toastify";
import axios from "axios";
import { getStatusColor, getStatusLabel, transformTimesheetResData } from "@/utils/helper";
import TableHeader from "./TableHeader";
import { TimesheetStatus } from "@/types/timesheet";
import Link from "next/link";

interface Timesheet {
    id: number;
    documentId: string;
    week: number;
    year: number;
    month: number;
    startDate: string;
    endDate: string;
    totalHours: number;
    workStatus: string;
    dateRange: string;
}

export default function TimesheetsTable() {
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const columnHelper = createColumnHelper<Timesheet>();

    const [data, setData] = useState<Timesheet[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSync, setIsSync] = useState(true);
    const [pageIndex, setPageIndex] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize] = useState(5);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const filterDropdownRef = useRef<HTMLDivElement>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const STRAPI_BASE_URL =
        process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

    // SSE Connection for real-time updates
    useEffect(() => {
        const eventSource = new EventSource('/api/webhooks/timesheet');

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'connected') {
                    console.log('Connected to timesheet updates');
                } else if (data.type === 'timesheet-update') {
                    console.log('Timesheet updated:', data.event);

                    setRefreshTrigger(prev => prev + 1);
                    setIsSync(false)
                    // toast.info('Timesheet synchronized!');
                }
            } catch (error) {
                console.error('SSE parse error:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
                setShowFilterDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchTimesheets = async () => {
            setLoading(true);
            setIsSync(true);

            let url = `${STRAPI_BASE_URL}/api/timesheets?fields=totalHours,workStatus&populate[timesheet_date][fields]=startDate,endDate,week,month,year,dateRange&sort=timesheet_date.week:desc&pagination[page]=${pageIndex + 1}&pagination[pageSize]=${pageSize}`;

            if (statusFilter !== "ALL") {
                url += `&filters[workStatus][$eq]=${statusFilter}`;
            }

            try {
                const res = await fetch(url, { cache: "no-store" });
                const json = await res.json();
                console.log(transformTimesheetResData(json), json.data);
                setData(transformTimesheetResData(json ?? []));
                setTotalCount(json.meta?.pagination?.total || 0);
            } catch (error) {
                toast.error("Failed to fetch timesheets!!");
            } finally {
                setLoading(false);
                setIsSync(false)
            }
        };
        fetchTimesheets();
    }, [STRAPI_BASE_URL, pageIndex, statusFilter, isCreating, refreshTrigger]);

    const handleAction = (action: string, timesheet: Timesheet) => {
        setOpenDropdownId(null);

        if (action === "View") router.push(`/timesheets/${timesheet?.week}/${timesheet?.year}`);
        else if (action === "Delete") handleDelete(timesheet.documentId);
    };


    const handleDelete = async (timesheetId: string | number | null) => {
        if (!confirm("Are you sure you want to delete this timesheet?") || timesheetId === null) {
            return;
        }

        try {
            const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
            await axios.delete(`${STRAPI_BASE_URL}/api/timesheets/${timesheetId}`);

            setData(prev => prev.filter(item => item.documentId !== timesheetId));
            setTotalCount(prev => prev - 1);

            toast.success("Timesheet deleted successfully!");
        } catch (error) {
            console.error("Error deleting timesheet:", error);
            toast.error("Failed to delete timesheet. Please try again.");
        }
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        setPageIndex(0);
        setShowFilterDropdown(false);
    };

    const clearFilter = () => {
        setStatusFilter("ALL");
        setPageIndex(0);
    };

    const columns = useMemo(
        () => [
            columnHelper.accessor("dateRange", {
                header: "Date Range",
                cell: (info) => (
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{info.getValue()}</span>
                    </div>
                ),
            }),
            columnHelper.accessor("week", {
                header: "Week",
                cell: (info) => <span className="text-gray-600">{info.getValue()}</span>,
            }),
            columnHelper.accessor("year", {
                header: "Year",
                cell: (info) => <span className="text-gray-600">{info.getValue()}</span>,
            }),
            columnHelper.accessor("totalHours", {
                header: "Hours",
                cell: (info) => (
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">{info.getValue()}h</span>
                    </div>
                ),
            }),
            columnHelper.accessor("workStatus", {
                header: "Status",
                cell: (info) => (
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(info.getValue())}`}>
                        {getStatusLabel(info.getValue())}
                    </span>
                ),
            }),
            columnHelper.display({
                id: "actions",
                header: "Actions",
                cell: (info) => {
                    const timesheet = info.row.original;
                    const { week, year } = timesheet;
                    const isOpen = openDropdownId === timesheet.id;

                    return (
                        <div className="relative" ref={isOpen ? dropdownRef : null}>

                            <button
                                onClick={() => { setOpenDropdownId(isOpen ? null : timesheet.id); }}
                                className="cursor-pointer inline-flex items-center justify-center px-3 py-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <Ellipsis className="w-4 h-4 text-gray-600" />
                            </button>


                            {isOpen && (
                                <div className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200">
                                    <div className="py-1">
                                        <Link href={`/timesheets/${week}/${year}`}>
                                            <button
                                                onClick={() => handleAction("View", timesheet)}
                                                className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Details
                                            </button>
                                        </Link>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button
                                            onClick={() => handleAction("Delete", timesheet)}
                                            className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                },
            }),
        ],
        [columnHelper, openDropdownId]
    );

    const table = useReactTable({
        data: data.sort((a, b) => a.week - b.week),
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const totalPages = Math.ceil(totalCount / pageSize);
    const startItem = pageIndex * pageSize + 1;
    const endItem = Math.min((pageIndex + 1) * pageSize, totalCount);

    return (
        <>
            <div className="w-full max-w-9xl mx-auto p-6 debug-screens">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <TableHeader showFilterDropdown={showFilterDropdown}
                        setShowFilterDropdown={setShowFilterDropdown}
                        handleStatusFilter={handleStatusFilter}
                        setShowCreateModal={setShowCreateModal}
                        statusFilter={statusFilter as TimesheetStatus}
                        clearFilter={clearFilter} isSync={isSync} ref={filterDropdownRef} />

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                            <p className="mt-2 text-gray-600">Loading timesheets...</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full h-auto">
                                    <thead>
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            <tr key={headerGroup.id} className="border-b border-gray-200 bg-gray-50">
                                                {headerGroup.headers.map((header) => (
                                                    <th
                                                        key={header.id}
                                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                                    >
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                                    </th>
                                                ))}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {table.getRowModel().rows.length > 0 ? (
                                            table.getRowModel().rows.map((row) => (
                                                <tr
                                                    key={row.id}
                                                    className="hover:bg-gray-50 transition-colors duration-150"
                                                >
                                                    {row.getVisibleCells().map((cell) => (
                                                        <td
                                                            key={cell.id}
                                                            className="px-6 py-4"
                                                        >
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={columns.length} className="px-6 py-12 text-center">
                                                    <div className="text-gray-400">
                                                        <Calendar className="w-12 h-12 mx-auto mb-3" />
                                                        <p className="text-gray-600 font-medium">No timesheets found</p>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {statusFilter !== "ALL"
                                                                ? `No timesheets with status "${getStatusLabel(statusFilter)}"`
                                                                : "No timesheets available. Create your first timesheet!"}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing <span className="font-medium">{startItem}</span> to{" "}
                                    <span className="font-medium">{endItem}</span>{" "}
                                    of <span className="font-medium">{totalCount}</span> entries
                                    {statusFilter !== "ALL" && (
                                        <span className="ml-2 text-blue-600">
                                            (Filtered by: {getStatusLabel(statusFilter)})
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                        onClick={() => setPageIndex((old) => Math.max(old - 1, 0))}
                                        disabled={pageIndex === 0}
                                    >
                                        <ChevronLeft /> Previous
                                    </button>

                                    <div className="px-4 py-2 text-sm font-medium text-gray-700">
                                        Page {pageIndex + 1} of {totalPages || 1}
                                    </div>

                                    <button
                                        className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                        onClick={() => setPageIndex((old) => old + 1)}
                                        disabled={pageIndex + 1 >= totalPages}
                                    >
                                        Next <ChevronRight />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {showCreateModal && (
                <CreateTimesheetForm
                    setIsCreating={setIsCreating}
                    setShowCreateModal={setShowCreateModal}
                    isCreating={isCreating}
                />
            )}
        </>
    );
}