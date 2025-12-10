// types/timesheet.ts - Add these interfaces to your types file

// export interface TaskGroup {
//   date: string;
//   tasks: Task[];
//   totalHours: number;
// }

// TimesheetDetails.tsx - Updated component with TypeScript

"use client";

import React, { useState, useEffect, useMemo, JSX } from "react";
import { Calendar, Clock, ArrowLeft, Briefcase, FileText, CheckCircle2, AlertCircle, Loader2, Edit2, Save, X, Plus } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import TaskEditForm from "./TaskEditForm";
import { StrapiMedia, Task, TimesheetData, TaskGroup } from "@/types/timesheet";
import axios from "axios";
import { toast } from "react-toastify";

interface TimesheetDetailsProps {
    data: TimesheetData | null;
    week: string;
    year: string;
    error: string | null;
}

interface TaskFormValues {
    title: string;
    date: string;
    hours: number;
    typeOfWork: string;
    projects: string;
    taskDocument: File | StrapiMedia | null;
}

const taskValidationSchema = Yup.object({
    title: Yup.string()
        .required("Title is required")
        .min(3, "Title must be at least 3 characters")
        .max(200, "Title must be less than 200 characters"),
    date: Yup.date()
        .required("Date is required")
        .max(new Date(), "Date cannot be in the future"),
    hours: Yup.number()
        .required("Hours are required")
        .min(0.5, "Hours must be at least 0.5")
        .max(24, "Hours cannot exceed 24"),
    typeOfWork: Yup.string()
        .required("Work type is required"),
    projects: Yup.string()
        .required("Project is required"),
});

export default function TimesheetDetails({ data, week, year, error }: TimesheetDetailsProps): JSX.Element {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [tasks, setTasks] = useState<Task[]>(data?.tasks || []);
    const [totalHours, setTotalHours] = useState<number>(data?.totalHours || 0);
    const [workStatus, setWorkStatus] = useState<string>(data?.workStatus || "INCOMPLETE");

    useEffect(() => {
        if (data) {
            setTasks(data.tasks || []);
            setTotalHours(data.totalHours || 0);
            setWorkStatus(data.workStatus || "INCOMPLETE");
        }
    }, [data]);

    // Group tasks by date with proper TypeScript typing
    const groupedTasks = useMemo<TaskGroup[]>(() => {
        const groups: Record<string, TaskGroup> = {};

        tasks.forEach((task: Task) => {
            const dateKey: string = task.date;
            if (!groups[dateKey]) {
                groups[dateKey] = {
                    date: dateKey,
                    tasks: [],
                    totalHours: 0
                };
            }
            groups[dateKey].tasks.push(task);
            groups[dateKey].totalHours += task.hours;
        });

        // Sort by date (newest first)
        return Object.values(groups).sort((a: TaskGroup, b: TaskGroup) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [tasks]);

    const formik = useFormik<TaskFormValues>({
        initialValues: {
            title: "",
            date: "",
            hours: 0,
            typeOfWork: "",
            projects: "",
            taskDocument: null,
        },
        validationSchema: taskValidationSchema,
        enableReinitialize: false,
        onSubmit: async (values: TaskFormValues) => {
            if (isCreating) {
                await handleCreateTask(values);
            } else if (selectedTask) {
                await handleUpdateTask(values);
            }
        },
    });
 
    const handleCreateTask = async (values: any) => {
        try {


            const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

            let uploadedFileId = null;


            if (values.taskDocument && values.taskDocument instanceof File) {
                const formData = new FormData();
                formData.append('files', values.taskDocument);

                try {
                    const uploadResponse = await axios.post(
                        `${STRAPI_BASE_URL}/api/upload`,
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    );

                    if (uploadResponse.data && uploadResponse.data[0]) {
                        uploadedFileId = uploadResponse.data[0].id;
                    }
                } catch (uploadError) {
                    console.error("Error uploading file:", uploadError);
                    toast.error("Failed to upload attachment. Please try again.");
                    return;
                }
            }


            const taskData = {
                data: {
                    title: values.title,
                    date: values.date,
                    hours: values.hours,
                    typeOfWork: values.typeOfWork,
                    projects: values.projects,
                    ...(uploadedFileId && { taskDocument: uploadedFileId }),
                }
            };

            const taskResponse = await axios.post(`${STRAPI_BASE_URL}/api/tasks`, taskData);

            if (taskResponse.data && taskResponse.data.data && data && data.documentId) {
                const newTask = taskResponse.data.data;
                const taskId = newTask.documentId;
                const newTotalHours = totalHours + values.hours;
                const newWorkStatus = newTotalHours >= 40 ? "COMPLETED" : "INCOMPLETE";


                try {
                    const currentTaskIds = tasks.map(task => task.documentId);
                    const updatedTaskIds = [...currentTaskIds, taskId];

                    await axios.put(`${STRAPI_BASE_URL}/api/timesheets/${data.documentId}`, {
                        data: {
                            tasks: updatedTaskIds,
                            totalHours: newTotalHours,
                            workStatus: newWorkStatus
                        }
                    });
                } catch (updateError) {
                    console.error("Error updating timesheet relation:", updateError);
                }

                const updatedTasks = [{ ...newTask, documentId: taskId }, ...tasks];
                setTasks(updatedTasks);
                setTotalHours(newTotalHours);
                setWorkStatus(newWorkStatus);

                setIsCreating(false);
                setSelectedTask({ ...newTask, documentId: taskId });
                formik.resetForm();

                toast.success("Task created successfully!");
            }
        } catch (error) {
            console.error("Error creating task:", error);
            toast.error("Failed to create task. Please try again.");
        }
    };

    const handleUpdateTask = async (values: TaskFormValues): Promise<void> => {
        if (!selectedTask) return;

        try {
            const STRAPI_BASE_URL: string = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

            let uploadedFileId: number | null = null;

            if (values.taskDocument && values.taskDocument instanceof File) {
                const formData = new FormData();
                formData.append('files', values.taskDocument);

                try {
                    const uploadResponse = await axios.post<Array<{ id: number }>>(
                        `${STRAPI_BASE_URL}/api/upload`,
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    );

                    if (uploadResponse.data && uploadResponse.data[0]) {
                        uploadedFileId = uploadResponse.data[0].id;
                    }
                } catch (uploadError) {
                    console.error("Error uploading file:", uploadError);
                    toast.error("Failed to upload attachment. Please try again.");
                    return;
                }
            }

            const oldHours: number = selectedTask.hours || 0;
            const hourDifference: number = values.hours - oldHours;
            const newTotalHours: number = totalHours + hourDifference;
            const newWorkStatus: string = newTotalHours >= 40 ? "COMPLETED" : "INCOMPLETE";

            const updateData = {
                data: {
                    title: values.title,
                    date: values.date,
                    hours: values.hours,
                    typeOfWork: values.typeOfWork,
                    projects: values.projects,
                    ...(uploadedFileId && { taskDocument: uploadedFileId }),
                    ...(values.taskDocument === null && !uploadedFileId && { taskDocument: null }),
                }
            };

            const response = await axios.put<{ data: Task }>(
                `${STRAPI_BASE_URL}/api/tasks/${selectedTask?.documentId}`,
                updateData
            );

            if (response.data && response.data.data) {
                const updatedTask: Task = response.data.data;

                await axios.put(`${STRAPI_BASE_URL}/api/timesheets/${data?.documentId}`, {
                    data: {
                        totalHours: newTotalHours,
                        workStatus: newWorkStatus
                    }
                });

                const updatedTasks: Task[] = tasks.map((task: Task) =>
                    task.documentId === selectedTask.documentId
                        ? { ...updatedTask, documentId: updatedTask.documentId }
                        : task
                );
                setTasks(updatedTasks);

                setSelectedTask({ ...updatedTask, documentId: updatedTask.documentId });
                setTotalHours(newTotalHours);
                setWorkStatus(newWorkStatus);

                setIsEditing(false);
                formik.resetForm();

                toast.success("Task updated successfully!");
            }
        } catch (error) {
            console.error("Error updating task:", error);
            toast.error("Failed to update task. Please try again.");
        }
    };

    const handleEdit = (): void => {
        if (selectedTask) {
            formik.setValues({
                title: selectedTask.title,
                date: selectedTask.date,
                hours: selectedTask.hours,
                typeOfWork: selectedTask.typeOfWork,
                projects: selectedTask.projects,
                taskDocument: selectedTask.taskDocument as StrapiMedia
            });
            setIsEditing(true);
            setIsCreating(false);
        }
    };

    const handleCreateNew = (): void => {
        setIsCreating(true);
        setIsEditing(false);
        setSelectedTask(null);
        formik.setValues({
            title: "",
            date: getDefaultDate(),
            hours: 8,
            typeOfWork: "",
            projects: "",
            taskDocument: null
        });
    };

    const handleCancel = (): void => {
        formik.resetForm();
        setIsEditing(false);
        setIsCreating(false);
        if (isCreating) {
            setSelectedTask(null);
        }
    };

    const handleTaskSelect = (task: Task): void => {
        setSelectedTask(task);
        setIsEditing(false);
        setIsCreating(false);
        formik.resetForm();
    };

    const handleDelete = async (timesheetId: string | number | null, taskId: string | number | null): Promise<void> => {
        try {
            const STRAPI_BASE_URL: string = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
            await axios.delete(`${STRAPI_BASE_URL}/api/tasks/${taskId}`);

            const taskToDelete: Task | undefined = tasks.find((task: Task) => task.documentId === taskId);
            const updatedTasks: Task[] = tasks.filter((task: Task) => task.documentId !== taskId);
            setTasks(updatedTasks);

            if (taskToDelete) {
                const newTotalHours: number = totalHours - (taskToDelete.hours || 0);
                setTotalHours(newTotalHours);

                const newWorkStatus: string = newTotalHours === 0 ? "MISSING" : newTotalHours >= 40 ? "COMPLETED" : "INCOMPLETE";
                setWorkStatus(newWorkStatus);

                try {
                    await axios.put(`${STRAPI_BASE_URL}/api/timesheets/${timesheetId}`, {
                        data: {
                            totalHours: newTotalHours,
                            workStatus: newWorkStatus
                        }
                    });
                } catch (updateError) {
                    console.error("Error updating timesheet relation:", updateError);
                }
            }

            if (selectedTask?.documentId === taskId) {
                setSelectedTask(null);
                setIsEditing(false);
            }

            toast.success("Task deleted successfully!");
        } catch (error) {
            console.error("Error deleting task:", error);
            toast.error("Failed to delete task. Please try again.");
        }
    };

    const getDefaultDate = (): string => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getStatusColor = (status: string): string => {
        switch (status.toUpperCase()) {
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

    const getWorkTypeLabel = (type: string): string => {
        return type.split('_').map((word: string) =>
            word.charAt(0) + word.slice(1).toLowerCase()
        ).join(' ');
    };

    const getWorkTypeColor = (type: string): string => {
        switch (type) {
            case "FEATURE_DEVELOPMENT":
                return "bg-blue-100 text-blue-700";
            case "BUG_FIX":
                return "bg-red-100 text-red-700";
            case "OPTIMIZATION":
                return "bg-purple-100 text-purple-700";
            case "MEETING":
                return "bg-green-100 text-green-700";
            case "CODE_REVIEW":
                return "bg-indigo-100 text-indigo-700";
            case "DOCUMENTATION":
                return "bg-yellow-100 text-yellow-700";
            case "TESTING":
                return "bg-pink-100 text-pink-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatDateHeader = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateForInput = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const handleBack = (): void => {
        if (typeof window !== 'undefined') {
            window.history.back();
        }
    };

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No Timesheet Found</h2>
                    <p className="text-gray-600">No timesheet found for Week {week}, {year}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <button onClick={handleBack} className="cursor-pointer flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Timesheets</span>
                    </button>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl lg:text-3xl font-bold text-gray-900 mb-2">
                                    Week {week}, {year}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3 lg:gap-4 text-xs lg:text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
                                        <span className="truncate">{data.dateRange}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
                                        <span className="font-semibold text-gray-900">{totalHours} hours</span>
                                    </div>
                                    <div className="text-gray-500">
                                        {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>

                            <div className="shrink-0">
                                <span className={`inline-flex px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium border ${getStatusColor(workStatus)}`}>
                                    {workStatus === "INCOMPLETE" ? (
                                        <div className="flex items-center gap-1.5 lg:gap-2">
                                            <AlertCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                                            <span>Incomplete</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 lg:gap-2">
                                            <CheckCircle2 className="w-3 h-3 lg:w-4 lg:h-4" />
                                            <span className="whitespace-nowrap">{getWorkTypeLabel(workStatus)}</span>
                                        </div>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`grid grid-cols-1 ${selectedTask || isCreating ? "lg:grid-cols-3" : ""} gap-6`}>
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Tasks ({tasks.length})
                            </h2>
                            <button
                                onClick={handleCreateNew}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add New Task
                            </button>
                        </div>

                        {groupedTasks.length > 0 ? (
                            groupedTasks.map((group: TaskGroup) => (
                                <div key={group.date} className="space-y-3">
                                    
                                    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-gray-900">
                                                {formatDateHeader(group.date)}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <span className="text-sm font-semibold text-blue-600">
                                            {group.totalHours}h total
                                        </span>
                                    </div>

                                    
                                    <div className="space-y-3 pl-2">
                                        {group.tasks.map((task: Task) => (
                                            <div
                                                key={task.id || task.documentId}
                                                onClick={() => handleTaskSelect(task)}
                                                className={`bg-white rounded-lg border-2 p-5 cursor-pointer transition-all hover:shadow-md ${selectedTask?.documentId === task.documentId
                                                    ? "border-blue-500 shadow-md"
                                                    : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="font-semibold text-gray-900 text-lg flex-1 pr-2">
                                                        {task.title}
                                                    </h3>
                                                    <span className="flex items-center gap-1 text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full whitespace-nowrap">
                                                        <Clock className="w-3 h-3" />
                                                        {task.hours}h
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getWorkTypeColor(task.typeOfWork)}`}>
                                                        <Briefcase className="w-3 h-3" />
                                                        {getWorkTypeLabel(task.typeOfWork)}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                                        <FileText className="w-3 h-3" />
                                                        {task.projects.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600">No tasks found for this week</p>
                                <button
                                    onClick={handleCreateNew}
                                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Your First Task
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="lg:sticky lg:top-6 h-fit">
                        {(selectedTask || isCreating) && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {isCreating ? "Create New Task" : "Task Details"}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        {isEditing || isCreating ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={handleCancel}
                                                    disabled={formik.isSubmitting}
                                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => formik.handleSubmit()}
                                                    disabled={formik.isSubmitting || !formik.isValid}
                                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {formik.isSubmitting ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            {isCreating ? "Creating..." : "Saving..."}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="w-4 h-4" />
                                                            {isCreating ? "Create Task" : "Save"}
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={handleEdit}
                                                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setSelectedTask(null)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <TaskEditForm
                                    formik={formik}
                                    isEditing={isEditing || isCreating}
                                    selectedTask={selectedTask}
                                    formatDateForInput={formatDateForInput}
                                    formatDate={formatDate}
                                    getWorkTypeColor={getWorkTypeColor}
                                    getWorkTypeLabel={getWorkTypeLabel}
                                    onDelete={handleDelete}
                                    timesheetId={data?.documentId}
                                    isCreating={isCreating}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}