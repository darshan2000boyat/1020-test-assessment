import React, { useState, useEffect } from "react";
import { TaskEditFormProps, StrapiMedia } from "@/types/timesheet";
import { Briefcase, FileText, Trash2, AlertTriangle, X, Plus } from "lucide-react";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

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
  isCreating = false,
}: TaskEditFormProps & { isCreating?: boolean }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<string | null>(null);

  const workTypes = [
    "FEATURE_DEVELOPMENT",
    "BUG_FIXES",
    "RESEARCH_AND_ANALYSIS",
  ];

  const projects = ["PROJECT_A", "PROJECT_B", "PROJECT_C"];

  // Set preview when selectedTask changes
  useEffect(() => {
      console.log(selectedTask)
    if (selectedTask?.taskDocument?.url) {
      setPreviewAttachment(selectedTask.taskDocument.url);
    } else {
      setPreviewAttachment(null);
    }
  }, [selectedTask]);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(timesheetId, selectedTask?.documentId || "");
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      formik.setFieldValue("taskDocument", file);
      const previewUrl = URL.createObjectURL(file);
      setPreviewAttachment(previewUrl);
    }
  };

  const handleRemoveAttachment = () => {
    formik.setFieldValue("taskDocument", null);
    setPreviewAttachment(null);
  };

  const shouldShowForm = isEditing || isCreating;

  const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  return (
    <>
      {(selectedTask || isCreating) && (
        <form onSubmit={formik.handleSubmit}>
          <div className="space-y-6">
            {/* Title */}
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formik.touched.title && formik.errors.title
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter task title"
                  />
                  {formik.touched.title && formik.errors.title && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.title}
                    </p>
                  )}
                </div>
              ) : (
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedTask?.title}
                </h3>
              )}
            </div>

            {/* Date & Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Date</label>
                {shouldShowForm ? (
                  <input
                    type="date"
                    name="date"
                    value={
                      formik.values.date ? formatDateForInput(formik.values.date) : ""
                    }
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formik.touched.date && formik.errors.date
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3 font-semibold text-gray-900">
                    {selectedTask && formatDate(selectedTask.date)}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Hours</label>
                {shouldShowForm ? (
                  <input
                    type="number"
                    name="hours"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={formik.values.hours || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formik.touched.hours && formik.errors.hours
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="0"
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3 font-semibold text-gray-900">
                    {selectedTask?.hours} hours
                  </div>
                )}
              </div>
            </div>

            {/* Work Type */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Work Type</label>
              {shouldShowForm ? (
                <select
                  name="typeOfWork"
                  value={formik.values.typeOfWork}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formik.touched.typeOfWork && formik.errors.typeOfWork
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select work type</option>
                  {workTypes.map((type) => (
                    <option key={type} value={type}>
                      {getWorkTypeLabel(type)}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${getWorkTypeColor(
                    selectedTask?.typeOfWork || ""
                  )}`}
                >
                  <Briefcase className="w-4 h-4" />
                  {getWorkTypeLabel(selectedTask?.typeOfWork || "")}
                </span>
              )}
            </div>

            {/* Project */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Project</label>
              {shouldShowForm ? (
                <select
                  name="projects"
                  value={formik.values.projects}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formik.touched.projects && formik.errors.projects
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project} value={project}>
                      {project.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700">
                  <FileText className="w-4 h-4" />
                  {selectedTask?.projects.replace(/_/g, " ")}
                </span>
              )}
            </div>

            {/* Task Attachment */}
            <div className="relative">
              <label className="text-sm text-gray-600 mb-2 block">Attachment</label>
              {shouldShowForm && (
                <div className="flex flex-col gap-2">
                  {previewAttachment && (
                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                      <img
                        src={previewAttachment}
                        alt="Attachment preview"
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveAttachment}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    name="taskDocument"
                    accept="image/*,application/pdf"
                    onChange={handleAttachmentChange}
                    className="relative z-50 mt-2 opacity-0 leading-8 cursor-pointer"
                  />
                </div>
              )}
              {shouldShowForm && !selectedTask?.taskDocument && <div className="absolute z-10 flex justify-center items-center py-1 rounded-md bottom-0 left-0 border-2 border-dashed border-blue-600 w-full">
                    <Plus  />
                </div>}
              {!shouldShowForm && selectedTask?.taskDocument && (
                <div>
                  <a
                    href={STRAPI_BASE_URL+selectedTask.taskDocument.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    View Attachment
                  </a>
                </div>
              )}
            </div>

            {/* Delete Task */}
            {!shouldShowForm && selectedTask && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Task
                </button>
              </div>
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
  );
};

export default TaskEditForm;
