/**
 * @description This code renders the job cards in the dashboard
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Card, message, Dropdown, Menu, Button, Empty, Spin } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, MoreOutlined, SettingOutlined } from '@ant-design/icons';
import { ApiResponse, apiService } from '@/libs/request/apiservice';
import styles from "./styles/dashboard.module.css"
import URL from '@/constants/url/url';
import EditJobDrawer from './editJob';

interface Job {
    _id: string;
    title: string;
    description: string;
    minPay: number;
    maxPay: number;
    requirements: string[];
}

type JobResponse = {
    jobs: Job[]
}

interface JobsDisplayComponentProps {
    shouldFetchJobs: boolean;
    jobId?: string;
}

const GetJobsComponent: React.FC<JobsDisplayComponentProps> = ({ shouldFetchJobs, jobId }) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [openEditDrawer, setOpenEditDrawer] = useState(false)
    const [jobToEdit, setJobToEdit] = useState<Job | null>(null);

    const fetchJobs = async () => {
        try {
            setLoading(true)
            const url = jobId ? `/job/fetch?jobId=${jobId}` : `/job/fetch`;
            const response: any = await apiService.get<ApiResponse<JobResponse>>(url);
            const { jobs: job } = response;
            let updatedJob: any = []
            if (Array.isArray(job)) {
                updatedJob = [...jobs, ...job]
            } else {
                updatedJob = [...jobs, job]
            }
            setJobs(updatedJob);
        } catch (error) {
            message.error('Failed to fetch jobs');
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [shouldFetchJobs, jobId]);

    const handleMenuClick = useCallback((jobId: string, action: string, jobDetails?: Job) => {
        console.log(`Action: ${action} on jobId: ${jobId}`);

        if (action === "edit") {
            // open modal to edit
            setJobToEdit(jobDetails || null)
            setOpenEditDrawer(true)
        } else if (action === "expired") {
            // call api to set expired
        }

    }, []);

    const jobActionsMenu = (jobId: string, jobDetail?: Job) => (
        <Menu onClick={({ key }) => handleMenuClick(jobId, key, jobDetail)}>
            <Menu.Item key="edit"> Edit Job <EditOutlined /></Menu.Item>
            <Menu.Item key="expired"> Mark Expired <DeleteOutlined /></Menu.Item>
        </Menu>
    );

    const JobListingCard = () => {
        return (
            <>
                {


                    jobs.length > 0 ? jobs.map((job) => (
                        <Card
                            key={job._id}
                            title={job.title}
                            style={{ marginBottom: 16 }}
                            extra={
                                <Dropdown overlay={jobActionsMenu(job._id, job)} trigger={['click']}>
                                    <a onClick={(e) => e.preventDefault()}>
                                        <MoreOutlined />
                                    </a>
                                </Dropdown>
                            }
                        >
                            <p>{job.description}</p>
                            <div className={styles.buttonSeperator}>
                                <Button type='primary' icon={<EyeOutlined />}>
                                    <a href={`${URL.dashboard.viewJob}/${job._id}`}>View Job</a>
                                </Button>
                                <Button type='primary' icon={<SettingOutlined />}>
                                    <a href={`${URL.dashboard.manageApplication}/${job._id}`}>Manage Applications</a>
                                </Button>
                            </div>
                        </Card>
                    )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />

                }
            </>
        )
    }

    return (
        <>
            <EditJobDrawer openDrawer={openEditDrawer} jobDetails={jobToEdit} />
            {
                !loading ? <JobListingCard /> : <div className='absolute-middle'><Spin size='large' /></div>
            }
            {
                !loading && error ? <Empty description={"Oops!"} /> : <></>
            }
        </>
    );
};

export default GetJobsComponent;
