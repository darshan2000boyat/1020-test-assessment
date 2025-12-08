
import React from 'react'
import TimesheetsTable from '../component/TimesheetsTable'
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Timesheets | Tuesday",
    description: "Timesheets | Tuesday",
};

const Timesheets = async () => {
  const jwt = (await cookies()).get("jwt")?.value;
  if(!jwt) return redirect("/auth/login");

  return (
    <div className='max-w-[1920px] mx-auto min-h-[calc(100vh-4rem)] justify-center'>
        <TimesheetsTable />
    </div>
  )
}

export default Timesheets