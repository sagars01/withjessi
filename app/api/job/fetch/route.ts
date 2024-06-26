/**
 * @description This route is only for LOGGED IN USER
 * 
 */

export const dynamic = 'force-dynamic';

import dbConnect from "@/app/libs/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getSessionInformation } from "@/app/utils/auth/getUserSessionData";
import JobController from "@/app/libs/controllers/jobs/jobs.controller";

export async function GET(request: NextRequest) {

    await dbConnect();

    try {
        if (request.method !== 'GET') {
            NextResponse.json({ error: 'Method Not Allowed' }, { status: 409 });
        }

        const userData = await getSessionInformation(request);
        if (!userData || !userData.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const jobId = request.nextUrl.searchParams.get("jobId") as string;

        // Use JobController to fetch jobs using userId from session
        const jobsOrJob = await JobController.getJobsByUser(userData.userId, jobId);

        if (!jobsOrJob || (Array.isArray(jobsOrJob) && jobsOrJob.length === 0)) {
            return NextResponse.json({ message: 'No jobs found', jobs: [] }, { status: 200 });
        }

        return NextResponse.json({
            jobs: jobsOrJob
        }, { status: 200, statusText: "OK" });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
};