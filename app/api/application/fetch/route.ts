import { NextRequest, NextResponse } from "next/server";
import ApplicationsController from "@/controllers/applications/applications.controller";
import { ISessionInformation, getSessionInformation } from "@/utils/auth/getUserSessionData";
import JobController from "@/controllers/jobs/jobs.controller";

export async function GET(request: NextRequest) {

    const jobId = request.nextUrl.searchParams.get("jobId") as string;

    try {
        const userDetails: ISessionInformation = await getSessionInformation(request);

        const userIdFromSession = userDetails?.userId;

        const getJobDetails = await JobController.getJobsById(jobId);

        if (getJobDetails?.createdBy.id !== userIdFromSession) {
            NextResponse.json({ applicants: null, error: "Unauthorized" }, { status: 401, statusText: "Unauthorized" })
        }

        const allApplicationsRelatedtoJobId = await ApplicationsController.getAllApplicationsByJobId(jobId);

        return NextResponse.json({ applicants: allApplicationsRelatedtoJobId }, { status: 200, statusText: "OK" });
    } catch (error) {
        NextResponse.json({ applicants: null, error: error }, { status: 500, statusText: "FAIL" })
    }

}