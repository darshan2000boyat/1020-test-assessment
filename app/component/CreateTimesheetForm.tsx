import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CreateTimesheetFormProps } from '@/types/timesheet';
import { Loader2, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';


const workStatusOptions = [
    { value: "INCOMPLETE", label: "Pending" },
    { value: "COMPLETED", label: "Approved" },
    { value: "MISSING", label: "Rejected" },
    { value: "SUBMITTED", label: "Submitted" }
];


const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};


const getWeekDateRange = (date: Date): { start: Date; end: Date } => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: monday, end: sunday };
};


const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};


const formatDateRange = (start: Date, end: Date): string => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}, ${end.getFullYear()}`;
};


const validationSchema = Yup.object({
    startDate: Yup.date()
        .required('Start date is required')
        .typeError('Please select a valid start date'),
    endDate: Yup.date()
        .required('End date is required')
        .min(Yup.ref('startDate'), 'End date must be after start date')
        .typeError('Please select a valid end date'),









});

const CreateTimesheetForm = ({ setIsCreating, setShowCreateModal, isCreating }: CreateTimesheetFormProps) => {
    const [tasks, setTasks] = useState<Array<{ id: number; title: string }>>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);

    const formik = useFormik({
        initialValues: {
            startDate: '',
            endDate: '',
            totalHours: 0,
            workStatus: 'MISSING',
            task: []
        },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            await handleCreateNewTimesheet(values);
            resetForm();
        },
    });


    useEffect(() => {
        const fetchTasks = async () => {
            setLoadingTasks(true);
            try {
                const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
                const response = await fetch(`${STRAPI_BASE_URL}/api/tasks`);

                if (response.ok) {
                    const result = await response.json();
                    setTasks(result.data || []);
                }
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoadingTasks(false);
            }
        };

        fetchTasks();
    }, []);


    useEffect(() => {
        const today = new Date();
        const { start, end } = getWeekDateRange(today);
        formik.setFieldValue('startDate', formatDate(start));
        formik.setFieldValue('endDate', formatDate(end));
    }, []);


    useEffect(() => {
        if (formik.values.startDate && formik.values.endDate) {
            const startDate = new Date(formik.values.startDate);
            const endDate = new Date(formik.values.endDate);
        }
    }, [formik.values.startDate, formik.values.endDate]);

    const handleCreateNewTimesheet = async (values: any) => {
        setIsCreating(true);
        try {
            const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

            const startDate = new Date(values.startDate);
            const endDate = new Date(values.endDate);


            const week = getWeekNumber(startDate);
            const year = startDate.getFullYear();
            const month = startDate.getMonth() + 1;
            const dateRange = formatDateRange(startDate, endDate);

            const timesheetData = {
                data: {
                    week,
                    year,
                    month,
                    startDate: values.startDate,
                    endDate: values.endDate,
                    totalHours: 0,
                    workStatus: "MISSING",
                    dateRange,
                    tasks: []
                }
            };

            console.log('Sending timesheet data:', timesheetData);

            const response = await fetch(`${STRAPI_BASE_URL}/api/timesheets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(timesheetData),
            });

            if (response.ok) {
                const result = await response.json();
                toast.success("Timesheet created successfully!");
                setShowCreateModal(false);
                window.location.reload();
            } else {
                const error = await response.json();
                console.error('API Error:', error);
                throw new Error(error?.error?.message || 'Failed to create timesheet');
            }
        } catch (error) {
            console.error("Error creating timesheet:", error);
            alert("Failed to create timesheet. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleCancel = () => {
        formik.resetForm();
        setShowCreateModal(false);
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const startDate = new Date(e.target.value);
        formik.handleChange(e);

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        formik.setFieldValue('endDate', formatDate(endDate));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Add New Timesheet</h3>
                    <p className="text-sm text-gray-600 mt-1">Record your weekly work hours</p>
                </div>

                <form onSubmit={formik.handleSubmit}>
                    <div className="p-6 space-y-6">
                        {/* Date Range Section */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <h4 className="font-semibold text-gray-900">Week Period</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Start Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formik.values.startDate}
                                        onChange={handleStartDateChange}
                                        onBlur={formik.handleBlur}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formik.touched.startDate && formik.errors.startDate
                                                ? "border-red-500"
                                                : "border-gray-300"
                                            }`}
                                    />
                                    {formik.touched.startDate && formik.errors.startDate && (
                                        <p className="mt-1 text-sm text-red-600">{formik.errors.startDate}</p>
                                    )}
                                </div>

                                {/* End Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formik.values.endDate}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formik.touched.endDate && formik.errors.endDate
                                                ? "border-red-500"
                                                : "border-gray-300"
                                            }`}
                                    />
                                    {formik.touched.endDate && formik.errors.endDate && (
                                        <p className="mt-1 text-sm text-red-600">{formik.errors.endDate}</p>
                                    )}
                                </div>
                            </div>

                            {/* Computed Info Display */}
                            {formik.values.startDate && formik.values.endDate && (
                                <div className="mt-3 pt-3 border-t border-blue-200">
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div>
                                            <span className="text-gray-600">Week:</span>
                                            <span className="ml-2 font-semibold text-gray-900">
                                                {getWeekNumber(new Date(formik.values.startDate))}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Month:</span>
                                            <span className="ml-2 font-semibold text-gray-900">
                                                {new Date(formik.values.startDate).getMonth() + 1}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Year:</span>
                                            <span className="ml-2 font-semibold text-gray-900">
                                                {new Date(formik.values.startDate).getFullYear()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-gray-600 text-sm">Range:</span>
                                        <span className="ml-2 font-medium text-gray-900 text-sm">
                                            {formatDateRange(
                                                new Date(formik.values.startDate),
                                                new Date(formik.values.endDate)
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Total Hours */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Total Hours *
                            </label>
                            <input
                                type="number"
                                name="totalHours"
                                min="0.5"
                                max="168"
                                step="0.5"
                                value={formik.values.totalHours}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    formik.touched.totalHours && formik.errors.totalHours 
                                    ? "border-red-500" 
                                    : "border-gray-300"
                                }`}
                                placeholder="0.0"
                            />
                            <p className="mt-1 text-xs text-gray-500">Total hours worked during this week period</p>
                            {formik.touched.totalHours && formik.errors.totalHours && (
                                <p className="mt-1 text-sm text-red-600">{formik.errors.totalHours}</p>
                            )}
                        </div> */}


                    </div>

                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={isCreating}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || !formik.isValid || formik.isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Timesheet"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTimesheetForm;