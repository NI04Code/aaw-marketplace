import { NewCategory } from "@db/schema/categories";
import { writerDb } from "@src/db";
import * as schema from '@db/schema/categories'

export const createNewCategory = async (data: NewCategory) => {
    const result = await writerDb
        .insert(schema.categories)
        .values(data)
        .returning({
            id: schema.categories.id,
            name: schema.categories.name,
        })
    return result?.[0];
}