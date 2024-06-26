import { apiService } from "@/app/libs/request/apiservice";
import URL from "@/app/utils/constants/url/url";
import { ArrowRightOutlined, DeleteOutlined, EditOutlined, LoadingOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Col, Row, Space, Table, message } from "antd"
import Link from "next/link";
import { useRouter } from "next/navigation";
import EditJobDrawer from "../job/editJob";
import { useState } from "react";



interface DetailedJobProps {
    openJobs: any[],
    allJobsData: any[],
    onEditJobSuccess: (status: boolean) => void;
}

const DetailedJob: React.FC<DetailedJobProps> = ({ openJobs, allJobsData, onEditJobSuccess }) => {

    const router = useRouter();
    const onManageJobClick = (jobId: string) => {
        router.push(URL.dashboard.manageApplication + "/" + jobId)
    }

    const [loading, setLoading] = useState(false)

    const onDeleteJob = async (jobId: string) => {
        try {
            setLoading(true)
            const response = await apiService.put(URL.api.private.jobs.update + "?jobId=" + jobId, {
                status: 'expired'
            })

            if (response.message) {
                message.success(
                    "Job successfully deleted!"
                )
            }
            onEditJobSuccess(true)
        } catch (error) {
            message.error("Could not process request!")
        } finally {
            setLoading(false)
        }
    }

    const columns = [
        {
            title: 'Job Title',
            dataIndex: 'jobTitle',
            key: 'jobTitle',
        },
        {
            title: 'Applicants',
            dataIndex: 'numOfApplicants',
            key: 'numOfApplicants',
        },
        {
            title: 'Date Posted',
            dataIndex: 'dateOfPosition',
            key: 'dateOfPosition',
        },
        {
            title: 'Manage',
            key: 'manage',
            render: (text: any, record: any) => (
                <>
                    <Space>
                        <Button
                            onClick={() => onManageJobClick(record.key)}
                            icon={<SettingOutlined />}
                            className="text-blue-500 hover:text-blue-700">Manage Applicants</Button>
                        <Button
                            onClick={() => handleJobEdit(record)}
                            icon={<EditOutlined />}
                            className="text-orange-500 hover:text-blue-700">Edit Job</Button>

                    </Space>
                </>
            ),
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            key: 'actions',
            render: (text: any, record: any) => (
                <>
                    <Space>
                        <Link href={URL.dashboard.viewJob + "/" + record.key} target="_blank">
                            <Button
                                icon={<ArrowRightOutlined />}
                                className="text-blue-500 hover:text-blue-700">View</Button>
                        </Link>
                        <Button
                            onClick={() => onDeleteJob(record.key)}
                            icon={loading ? <LoadingOutlined /> : <DeleteOutlined />} className="text-red-500 hover:text-red-700">Close Job</Button>
                    </Space>
                </>
            )
        }
    ];

    const [openEditDrawer, setOpenEditDrawer] = useState(false)
    const [jobToEdit, setJobToEdit] = useState<Job | any>(null);

    const handleJobEdit = (jobDetails: any) => {
        const jobkey = jobDetails.key;
        const jobToEdit = allJobsData.find((job: { _id: any; }) => job._id === jobkey);
        setJobToEdit(jobToEdit || null)
        setOpenEditDrawer(true)
    }

    const onJobEditedSuccessful = () => {
        setOpenEditDrawer(false);
        onEditJobSuccess(true);
    }

    return (
        <>
            <EditJobDrawer jobUpdatedEvt={onJobEditedSuccessful} openDrawer={openEditDrawer} jobDetails={jobToEdit} onDrawerClose={() => {
                setOpenEditDrawer(false)
                setJobToEdit(null)
            }} />
            <Row className="mt-4 mb-4">
                <Col lg={24} md={24} xs={24} className="mt-4 mb-4 overflow-x-auto">
                    <Table dataSource={openJobs} columns={columns} pagination={false} />
                </Col>
            </Row>
        </>
    )
}

export default DetailedJob

interface Job {
    status: 'active' | 'expired';
    _id: string;
    title: string;
    description: string;
    minPay: number;
    maxPay: number;
    requirements: string[];
}