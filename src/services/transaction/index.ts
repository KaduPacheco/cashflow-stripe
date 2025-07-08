
import { TransactionOperations } from './operations'
import { TransactionStats } from './stats'
import { TransactionArchive } from './archive'

// Re-export types
export type {
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
  TransactionFilters,
  TransactionStats as TransactionStatsType
} from './types'

// Main TransactionService class that combines all operations
export class TransactionService {
  // CRUD Operations
  static createTransaction = TransactionOperations.create
  static updateTransaction = TransactionOperations.update
  static deleteTransaction = TransactionOperations.delete
  static getTransactions = TransactionOperations.getAll

  // Statistics
  static getTransactionStats = TransactionStats.calculate

  // Archive Operations
  static archiveTransaction = TransactionArchive.archive
  static unarchiveTransaction = TransactionArchive.unarchive
}

// Individual exports for more granular imports
export { TransactionOperations } from './operations'
export { TransactionStats } from './stats'
export { TransactionArchive } from './archive'
export { TransactionValidation } from './validation'
