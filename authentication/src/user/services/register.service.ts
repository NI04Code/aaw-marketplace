import bcrypt from 'bcrypt'
import { NewUser } from '@db/schema/users';
import { insertNewUser } from '../dao/insertNewUser.dao';
import { InternalServerErrorResponse } from '@src/commons/patterns';
import { logger } from '@src/utils/logger';

export const registerService = async (
    username: string,
    email: string,
    password: string,
    full_name: string,
    address: string,
    phone_number: string
) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const tenantId = process.env.TENANT_ID;

        if (!tenantId) {
            logger.error('Missing TENANT_ID in environment');
            return new InternalServerErrorResponse("Server tenant ID is missing").generate();
        }

        logger.info('Register attempt', { username, email, tenantId });

        const userData: NewUser = {
            tenant_id: process.env.TENANT_ID,
            username,
            email,
            password: hashedPassword,
            full_name,
            address,
            phone_number
        }
        console.log("userData===>",userData)
        const [newUser] = await insertNewUser(userData)

        logger.info('User registered successfully', { userId: newUser.id, username });

        return {
            data: newUser,
            status: 201
        }
    } catch (err: any) {
        logger.error('Unexpected error during user registration', { error: err.message });
        return new InternalServerErrorResponse(err).generate();
    }
}