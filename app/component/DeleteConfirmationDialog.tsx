import React from 'react'
import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationDialogProps {
    showDeleteConfirm: boolean;
    setShowDeleteConfirm: (confirm: boolean) => void;
    isDeleting: boolean;
    handleDeleteConfirm?: () => Promise<void>;
}

const DeleteConfirmationDialog = ({ 
    showDeleteConfirm,
    setShowDeleteConfirm,
    isDeleting,
    handleDeleteConfirm 
}: DeleteConfirmationDialogProps) => {
    return (
        <Dialog
            open={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            className="relative z-50"
        >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-xl">
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>

                        <div className="flex-1">
                            <DialogTitle className="text-lg font-semibold text-gray-900 mb-2">
                                Delete Task
                            </DialogTitle>
                            <Description className="text-sm text-gray-600 mb-6">
                                Are you sure you want to delete this task? This action cannot be undone.
                            </Description>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    )
}

export default DeleteConfirmationDialog