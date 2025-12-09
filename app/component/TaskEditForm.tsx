import React, { useState } from 'react'
import { TaskEditFormProps } from '@/types/timesheet';
import { Briefcase, FileText, Trash2, AlertTriangle } from 'lucide-react'
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

const TaskEditForm = ({ 
  formik, 
  isEditing, 
  selectedTask, 
  formatDateForInput,
  formatDate,
  getWorkTypeColor,
  getWorkTypeLabel,
  onDelete,
  timesheetId,
  isCreating = false 
}: TaskEditFormProps & { isCreating?: boolean }) => {

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const workTypes = [
        "FEATURE_DEVELOPMENT",
        "BUG_FIXES",
        "RESEARCH_AND_ANALYSIS"
    ];

    const projects = [
        "PROJECT_A",
        "PROJECT_B",
        "PROJECT_C"
    ];

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await onDelete(timesheetId, selectedTask?.documentId || "");
            setShowDeleteConfirm(false);
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Always render the form if we're in editing mode OR creating mode
    const shouldShowForm = isEditing || isCreating;

    return (
        <>
            {(selectedTask || isCreating) && (
                <form onSubmit={formik.handleSubmit}>
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm text-gray-600 mb-2 block">Title</label>
                            {shouldShowForm ? (
                                <div>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formik.values.title}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formik.touched.title && formik.errors.title
                                            ? "border-red-500"
                                            : "border-gray-300"
                                            }`}
                                        placeholder="Enter task title"
                                    />
                                    {formik.touched.title && formik.errors.title && (
                                        <p className="text-red-500 text-xs mt-1">{formik.errors.title}</p>
                                    )}
                                </div>
                            ) : (
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {selectedTask?.title}
                                </h3>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block">Date</label>
                                {shouldShowForm ? (
                                    <div>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formik.values.date ? formatDateForInput(formik.values.date) : ""}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formik.touched.date && formik.errors.date
                                                ? "border-red-500"
                                                : "border-gray-300"
                                                }`}
                                        />
                                        {formik.touched.date && formik.errors.date && (
                                            <p className="text-red-500 text-xs mt-1">{formik.errors.date}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-lg p-3 font-semibold text-gray-900">
                                        {selectedTask && formatDate(selectedTask.date)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block">Hours</label>
                                {shouldShowForm ? (
                                    <div>
                                        <input
                                            type="number"
                                            name="hours"
                                            min="0.5"
                                            max="24"
                                            step="0.5"
                                            value={formik.values.hours || ""}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formik.touched.hours && formik.errors.hours
                                                ? "border-red-500"
                                                : "border-gray-300"
                                                }`}
                                            placeholder="0"
                                        />
                                        {formik.touched.hours && formik.errors.hours && (
                                            <p className="text-red-500 text-xs mt-1">{formik.errors.hours}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-lg p-3 font-semibold text-gray-900">
                                        {selectedTask?.hours} hours
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-600 mb-2 block">Work Type</label>
                            {shouldShowForm ? (
                                <div>
                                    <select
                                        name="typeOfWork"
                                        value={formik.values.typeOfWork}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formik.touched.typeOfWork && formik.errors.typeOfWork
                                            ? "border-red-500"
                                            : "border-gray-300"
                                            }`}
                                    >
                                        <option value="">Select work type</option>
                                        {workTypes.map(type => (
                                            <option key={type} value={type}>{getWorkTypeLabel(type)}</option>
                                        ))}
                                    </select>
                                    {formik.touched.typeOfWork && formik.errors.typeOfWork && (
                                        <p className="text-red-500 text-xs mt-1">{formik.errors.typeOfWork}</p>
                                    )}
                                </div>
                            ) : (
                                selectedTask && (
                                    <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${getWorkTypeColor(selectedTask.typeOfWork)}`}>
                                        <Briefcase className="w-4 h-4" />
                                        {getWorkTypeLabel(selectedTask.typeOfWork)}
                                    </span>
                                )
                            )}
                        </div>

                        <div>
                            <label className="text-sm text-gray-600 mb-2 block">Project</label>
                            {shouldShowForm ? (
                                <div>
                                    <select
                                        name="projects"
                                        value={formik.values.projects}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formik.touched.projects && formik.errors.projects
                                            ? "border-red-500"
                                            : "border-gray-300"
                                            }`}
                                    >
                                        <option value="">Select project</option>
                                        {projects.map(project => (
                                            <option key={project} value={project}>{project.replace(/_/g, ' ')}</option>
                                        ))}
                                    </select>
                                    {formik.touched.projects && formik.errors.projects && (
                                        <p className="text-red-500 text-xs mt-1">{formik.errors.projects}</p>
                                    )}
                                </div>
                            ) : (
                                selectedTask && (
                                    <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700">
                                        <FileText className="w-4 h-4" />
                                        {selectedTask.projects.replace(/_/g, ' ')}
                                    </span>
                                )
                            )}
                        </div>

                       
                        {!shouldShowForm && selectedTask && (
                            <>
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="text-xs text-gray-500 space-y-1">
                                        <div>Created: {formatDate(selectedTask.createdAt)}</div>
                                        <div>Updated: {formatDate(selectedTask.updatedAt)}</div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Task
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </form>
            )}
            <DeleteConfirmationDialog 
                showDeleteConfirm={showDeleteConfirm}
                setShowDeleteConfirm={setShowDeleteConfirm}
                isDeleting={isDeleting}
                handleDeleteConfirm={handleDeleteConfirm} 
            />
        </>
    )
}

export default TaskEditForm