import { FormikProps } from 'formik';

export interface Task {
  id: number;
  documentId: string;
  title: string;
  description: any[];
  hours: number;
  date: string;
  typeOfWork: string;
  projects: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface TimesheetResData {
  id: number;
  documentId: string;
  timesheet_date: {
    week: number;
    year: number;
    month: number;
    startDate: string;
    endDate: string;
    dateRange: string;
  },
  totalHours: number;
  workStatus: string;

  tasks: Task[];
}
export interface TimesheetData {
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
  tasks: Task[];
}



export interface TaskFormValues {
  title: string;
  date: string;
  hours: number;
  typeOfWork: string;
  projects: string;
}

export interface TaskEditFormProps {
  formik: FormikProps<TaskFormValues>;
  isEditing: boolean;
  selectedTask: Task | null;
  formatDateForInput: (dateString: string) => string;
  formatDate: (dateString: string) => string;
  getWorkTypeLabel: (type: string) => string;
  getWorkTypeColor: (type: string) => string;
  onDelete: (id: string | number) => void;
  isCreating: boolean;
}



export interface TimesheetFormState {
  title: string;
  description: string;
  hours: string;
  date: string;
  typeOfWork: string;
  projects: string;
}

export interface CreateTimesheetFormProps {
  setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
  isCreating: boolean;
}


export type TimesheetStatus = "ALL" | "COMPLETED" | "INCOMPLETE" | "MISSING";

export interface TableHeaderProps {
  showFilterDropdown: boolean;
  setShowFilterDropdown: React.Dispatch<React.SetStateAction<boolean>>;

  handleStatusFilter: (status: TimesheetStatus) => void;
  clearFilter: () => void;

  statusFilter: TimesheetStatus;
  setShowCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
}