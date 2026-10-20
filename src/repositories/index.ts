/**
 * repositories/index.ts — Primary Entry Point for Data Access Layer
 *
 * Clean Architecture repository layer providing domain types, interfaces,
 * and concrete storage adapters for LocalStorage/In-Memory and PostgreSQL/Prisma.
 */

export * from "./types.js";
export * from "./interfaces/index.js";
export * from "./local/index.js";

import type { IRepositoryContainer } from "./interfaces/IRepositoryContainer.js";
import { localRepositories } from "./local/index.js";

/**
 * Get active client repository container.
 * In the Vite browser bundle, localRepositories (backed by LocalStorage) is used.
 */
export function getRepositories(): IRepositoryContainer {
  return localRepositories;
}

export const repositories = localRepositories;
