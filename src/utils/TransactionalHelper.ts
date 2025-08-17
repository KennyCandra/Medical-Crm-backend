import { AppDataSource } from "../../ormconfig";
import { EntityManager } from "typeorm";

export async function runInTransaction<T>(
  operation: (manager: EntityManager) => Promise<T>
): Promise<T> {
  return AppDataSource.manager.transaction(async (transactionManager) => {
    return operation(transactionManager);
  });
}
