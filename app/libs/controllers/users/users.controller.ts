import userModel, { IUserModel } from "@/app/libs/models/user/user.model";
import jobsModel from "@/app/libs/models/job/jobs.model";
import dbConnect from "@/app/libs/mongodb";
import mongoose from "mongoose";
import { ErrorHandler, handleError } from "@/app/utils/logging/errorHandler";
import logger, { LogLevel } from "@/app/utils/logging/logger";

type WebhookUserPayload = {
    id: string;
    email_addresses: Array<{
        email_address: string;
        id: string;
        linked_to: string[];
        object: string;
        verification: {
            status: string;
            strategy: string;
        };
    }>;
    first_name: string;
    last_name: string;
    created_at: number;
};

class UserController {

    static async getUserDetails(email?: string, userId?: string, lean?: boolean): Promise<any> {
        await dbConnect();
        try {
            let query = {};
            if (email) query = { ...query, email: email };
            if (userId) query = { ...query, _id: new mongoose.Types.ObjectId(userId) };

            let user;
            if (lean) {
                user = await userModel.findOne(query).lean();
            } else {
                user = await userModel.findOne(query);
            }
            if (!user) {
                throw new ErrorHandler(404, "User not found", user, "Not Found");
            }
            logger.log(LogLevel.INFO, 'User details retrieved successfully');
            return user;
        } catch (error: any) {
            logger.log(LogLevel.ERROR, 'GetUserDetails: Failed to get user details : ' + error);
            throw handleError(error)
        }
    }

    static async getUserDetailsPublic(userId?: string): Promise<any> {
        await dbConnect();
        try {
            let query = {};
            if (userId) query = { _id: new mongoose.Types.ObjectId(userId) };

            const user: any = await userModel.findOne(query).select('-authProviderIdentifier').lean();
            if (!user) {
                throw new ErrorHandler(404, "User not found", user, "Not Found");
            }
            const userImageUrl = user?.authProviderMetaData.image_url;
            delete user?.authProviderMetaData;
            const leanUpdatedUser = {
                ...user,
                image_url: userImageUrl
            }


            // Fetch all jobs created by this user
            const jobs = await jobsModel.find({ "createdBy.id": userId }).lean();

            const jobDetails = {
                active: jobs.filter(job => job.status === 'active'),
                expired: jobs.filter(job => job.status === 'expired')
            };

            logger.log(LogLevel.INFO, 'User details and job details retrieved successfully');

            return { userDetails: leanUpdatedUser, jobDetails: jobDetails };
        } catch (error: any) {
            logger.log(LogLevel.ERROR, 'GetUserDetails: Failed to get user details : ' + error);
            throw handleError(error)
        }
    }

    static async handleUserCreated(payload: WebhookUserPayload): Promise<void> {
        await dbConnect();
        try {
            const userDoc = {
                authProviderIdentifier: payload.id,
                name: `${payload.first_name} ${payload.last_name}`,
                email: payload.email_addresses[0]?.email_address || '',
                createdAt: new Date(payload.created_at),
                authProviderMetaData: payload,
            };
            const newUser = new userModel(userDoc);
            await newUser.save();
            // console.log('User created successfully');
        } catch (error) {
            // console.error('Error creating user:', error);
            throw new Error('Failed to create user');
        }
    }

    /**
     * 
     * @param id 
     * @param userProfileData 
     * @description handles updating the user profile that is done from the user profile UI
     * @returns 
     */
    static async handleUserProfileUpdateFromUI(id: string, userProfileData: IUserModel) {
        await dbConnect();
        try {

            const updatedJob = await userModel.findOneAndUpdate(
                { _id: id },
                { $set: userProfileData },
                { new: true, runValidators: true }
            );

            logger.log(LogLevel.INFO, 'handleUserProfileUpdateFromUI: User details and job details updated successfully');
            return updatedJob;
        } catch (error: any) {
            logger.log(LogLevel.ERROR, 'handleUserProfileUpdateFromUI: User Details update failed');
            handleError(error)
        }
    }

    /**
     * 
     * @param payload sent by Clerk via Webhook
     * @returns updatedModel
     */

    static async handleUserUpdated(payload: WebhookUserPayload): Promise<IUserModel> {
        await dbConnect();
        try {
            const updateDoc = {
                name: `${payload.first_name} ${payload.last_name}`,
                email: payload.email_addresses[0]?.email_address || '',
                authProviderMetaData: payload,
            };
            const updateModel = await userModel.findOneAndUpdate({ authProviderIdentifier: payload.id }, updateDoc, { new: true });
            logger.log(LogLevel.INFO, 'handleUserUpdate : User updated successfully');
            return updateModel;
        } catch (error) {
            logger.log(LogLevel.ERROR, 'handleUserUpdate: Failed to update user details : ' + error);
            throw new Error('Failed to update user');
        }
    }

    static async handleUserDeleted(id: string): Promise<void> {
        await dbConnect();
        try {
            await userModel.findOneAndDelete({ authProviderIdentifier: id });
            // console.log('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new Error('Failed to delete user');
        }
    }
}

export default UserController;
