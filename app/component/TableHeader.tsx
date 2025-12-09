import React, { forwardRef } from 'react'
import { getStatusColor, getStatusLabel } from '@/utils/helper';
import { Filter, Plus, X } from 'lucide-react';
import { TableHeaderProps } from '@/types/timesheet';

const TableHeader = forwardRef<
  HTMLDivElement,
  TableHeaderProps
>(function TableHeader(
  {
    showFilterDropdown,
    setShowFilterDropdown,
    handleStatusFilter,
    setShowCreateModal,
    statusFilter,
    clearFilter,
  },
  filterDropdownRef
) {
    return (
        <div className="px-6 py-5 border-b border-gray-200 bg-linear-to-r from-blue-50 to-indigo-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Timesheets</h2>
                    <p className="text-sm text-gray-600 mt-1">View and manage your submitted timesheets</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative" ref={filterDropdownRef}>
                        <button
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm ${statusFilter !== "ALL" ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}
                        >
                            <Filter className="w-4 h-4" />
                            {statusFilter === "ALL" ? "Filter by Status" : getStatusLabel(statusFilter)}
                            {statusFilter !== "ALL" && (
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        clearFilter();
                                    }}
                                    className="ml-1 text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-3 h-3" />
                                </span>
                            )}
                        </button>

                        {showFilterDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                <div className="py-2">
                                    <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Filter by Status
                                    </div>
                                    <button
                                        onClick={() => handleStatusFilter("ALL")}
                                        className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${statusFilter === "ALL" ? "bg-blue-50 text-blue-700" : "text-gray-700"}`}
                                    >
                                        <span>All Statuses</span>
                                        {statusFilter === "ALL" && (
                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleStatusFilter("COMPLETED")}
                                        className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${statusFilter === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : "text-gray-700"}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                            <span>Completed</span>
                                        </div>
                                        {statusFilter === "COMPLETED" && (
                                            <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleStatusFilter("INCOMPLETE")}
                                        className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${statusFilter === "INCOMPLETE" ? "bg-amber-50 text-amber-700" : "text-gray-700"}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                            <span>Incomplete</span>
                                        </div>
                                        {statusFilter === "INCOMPLETE" && (
                                            <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleStatusFilter("MISSING")}
                                        className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${statusFilter === "MISSING" ? "bg-red-50 text-red-700" : "text-gray-700"}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            <span>Missing</span>
                                        </div>
                                        {statusFilter === "MISSING" && (
                                            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Create New Timesheet
                    </button>
                </div>
            </div>

            {statusFilter !== "ALL" && (
                <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-gray-600">Active filter:</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(statusFilter)}`}>
                        {getStatusLabel(statusFilter)}
                        <button
                            onClick={clearFilter}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                </div>
            )}
        </div>
    )
})

export default TableHeader