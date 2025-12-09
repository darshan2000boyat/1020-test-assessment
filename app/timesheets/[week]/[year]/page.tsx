import Navbar from '@/app/component/Navbar';
import TimesheetDetails from '@/app/component/TimesheetDetails';
import { Task, TimesheetData } from '@/types/timesheet';
import { toast } from 'react-toastify';

interface PageProps {
    params: {
        week: string;
        year: string;
    };
}

export default async function TimesheetDetailsPage({ params }: PageProps) {
    const { week, year } = await params;

    let error: string | null = null;
    let data: TimesheetData | null = null;
    const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
    try {
        const url = `${STRAPI_BASE_URL}/api/timesheets?populate[tasks][populate]=taskDocument&populate[timesheet_date]=*&filters[timesheet_date][week][$eq]=${week}&filters[timesheet_date][year][$eq]=${year}&pagination[pageSize]=1`;

        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) {
            toast.error("Failed to fetch timesheet");
        }

        const result = await response.json();

        if (result.data?.length > 0) {
            data = result.data[0];
            console.dir(data, {depth: null})
        } else {
            error = "No timesheet found for this week";
        }
    } catch (err) {
        error = err instanceof Error ? err.message : "An error occurred";
    }


    return (
        <main className='min-h-[calc(100vh - 4rem)] bg-linear-to-br from-blue-50 to-indigo-100 text-black'>
            <TimesheetDetails data={data} week={week} year={year} error={error} />
        </main>
    );
}
