import * as schema from '@db/schema/users'
import { readerDb } from "@src/db";
import { eq, and } from "drizzle-orm";

export const getUserByUsername = async (username: string, tenant_id: string) => {
    const result = await readerDb
        .select()
        .from(schema.users)
        .where(
            and(
                eq(schema.users.username, username),
                eq(schema.users.tenant_id, tenant_id)
            )
        )
    return result[0];
}