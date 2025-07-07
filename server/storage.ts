
import { 
  users, 
  projects, 
  currentAccounts, 
  accountTransactions,
  portfolioProjects,
  type User, 
  type InsertUser,
  type Project,
  type InsertProject,
  type CurrentAccount,
  type InsertCurrentAccount,
  type AccountTransaction,
  type InsertTransaction,
  type PortfolioProject,
  type InsertPortfolioProject
} from "@shared/schema";
import { db, withDatabaseRetry } from "./db";
import { eq, desc, sql, and, or } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  
  // Current Account operations
  getCurrentAccounts(): Promise<CurrentAccount[]>;
  getCurrentAccount(id: number): Promise<CurrentAccount | undefined>;
  createCurrentAccount(account: InsertCurrentAccount): Promise<CurrentAccount>;
  updateCurrentAccount(id: number, account: Partial<InsertCurrentAccount>): Promise<CurrentAccount>;
  deleteCurrentAccount(id: number): Promise<void>;
  
  // Transaction operations
  getAccountTransactions(accountId?: number): Promise<AccountTransaction[]>;
  getRecentTransactions(limit?: number, period?: string): Promise<AccountTransaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<AccountTransaction>;
  deleteTransaction(id: number): Promise<void>;
  updateAccountBalance(accountId: number): Promise<void>;
  
  // Portfolio Project operations
  getPortfolioProjects(activeOnly?: boolean): Promise<PortfolioProject[]>;
  getPortfolioProject(id: number): Promise<PortfolioProject | undefined>;
  createPortfolioProject(project: InsertPortfolioProject): Promise<PortfolioProject>;
  updatePortfolioProject(id: number, project: Partial<InsertPortfolioProject>): Promise<PortfolioProject>;
  deletePortfolioProject(id: number): Promise<void>;
  updatePortfolioProjectOrder(projectIds: number[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return withDatabaseRetry(async () => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return withDatabaseRetry(async () => {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return withDatabaseRetry(async () => {
      const [user] = await db
        .insert(users)
        .values({ ...insertUser, isAdmin: false })
        .returning();
      return user;
    });
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return withDatabaseRetry(async () => {
      return await db.select().from(projects).orderBy(desc(projects.createdAt));
    });
  }

  async getProject(id: number): Promise<Project | undefined> {
    return withDatabaseRetry(async () => {
      const [project] = await db.select().from(projects).where(eq(projects.id, id));
      return project || undefined;
    });
  }

  async createProject(project: InsertProject): Promise<Project> {
    return withDatabaseRetry(async () => {
      const [newProject] = await db
        .insert(projects)
        .values({
          ...project,
          updatedAt: new Date()
        })
        .returning();
      return newProject;
    });
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project> {
    return withDatabaseRetry(async () => {
      const [updatedProject] = await db
        .update(projects)
        .set({
          ...project,
          updatedAt: new Date()
        })
        .where(eq(projects.id, id))
        .returning();
      return updatedProject;
    });
  }

  async deleteProject(id: number): Promise<void> {
    return withDatabaseRetry(async () => {
      await db.delete(projects).where(eq(projects.id, id));
    });
  }

  // Current Account operations
  async getCurrentAccounts(): Promise<CurrentAccount[]> {
    return withDatabaseRetry(async () => {
      return await db.select().from(currentAccounts).orderBy(currentAccounts.name);
    });
  }

  async getCurrentAccount(id: number): Promise<CurrentAccount | undefined> {
    return withDatabaseRetry(async () => {
      const [account] = await db.select().from(currentAccounts).where(eq(currentAccounts.id, id));
      return account || undefined;
    });
  }

  async createCurrentAccount(account: InsertCurrentAccount): Promise<CurrentAccount> {
    return withDatabaseRetry(async () => {
      const [newAccount] = await db
        .insert(currentAccounts)
        .values({
          ...account,
          updatedAt: new Date()
        })
        .returning();
      return newAccount;
    });
  }

  async updateCurrentAccount(id: number, account: Partial<InsertCurrentAccount>): Promise<CurrentAccount> {
    return withDatabaseRetry(async () => {
      const [updatedAccount] = await db
        .update(currentAccounts)
        .set({
          ...account,
          updatedAt: new Date()
        })
        .where(eq(currentAccounts.id, id))
        .returning();
      return updatedAccount;
    });
  }

  async deleteCurrentAccount(id: number): Promise<void> {
    return withDatabaseRetry(async () => {
      await db.delete(currentAccounts).where(eq(currentAccounts.id, id));
    });
  }

  // Transaction operations
  async getAccountTransactions(accountId?: number): Promise<AccountTransaction[]> {
    return withDatabaseRetry(async () => {
      if (accountId) {
        return await db
          .select()
          .from(accountTransactions)
          .where(eq(accountTransactions.accountId, accountId))
          .orderBy(desc(accountTransactions.transactionDate));
      }
      return await db
        .select()
        .from(accountTransactions)
        .orderBy(desc(accountTransactions.transactionDate));
    });
  }

  async getRecentTransactions(limit: number = 20, period: string = 'all'): Promise<AccountTransaction[]> {
    return withDatabaseRetry(async () => {
      if (period === 'all') {
        return await db
          .select()
          .from(accountTransactions)
          .orderBy(desc(accountTransactions.transactionDate))
          .limit(limit);
      }

      const now = new Date();
      let startDate: Date;
      let endDate: Date | undefined;
      
      if (period === 'week') {
        startDate = new Date(now.setDate(now.getDate() - 7));
      } else if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1);
      } else {
        // Custom period format: YYYY-MM
        const [year, month] = period.split('-').map(Number);
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0, 23, 59, 59);
      }
      
      if (endDate) {
        return await db
          .select()
          .from(accountTransactions)
          .where(
            and(
              sql`"transaction_date" >= ${startDate}`,
              sql`"transaction_date" <= ${endDate}`
            )
          )
          .orderBy(desc(accountTransactions.transactionDate))
          .limit(limit);
      } else {
        return await db
          .select()
          .from(accountTransactions)
          .where(sql`"transaction_date" >= ${startDate}`)
          .orderBy(desc(accountTransactions.transactionDate))
          .limit(limit);
      }
    });
  }

  async createTransaction(transaction: InsertTransaction): Promise<AccountTransaction> {
    return withDatabaseRetry(async () => {
      console.log("Storage createTransaction called with:", transaction);
      const [newTransaction] = await db
        .insert(accountTransactions)
        .values(transaction)
        .returning();
      
      console.log("Transaction created:", newTransaction);
      
      // Update account balance if accountId exists
      if (transaction.accountId) {
        await this.updateAccountBalance(transaction.accountId);
      }
      
      return newTransaction;
    });
  }

  async settleTransaction(id: number): Promise<AccountTransaction | undefined> {
    return withDatabaseRetry(async () => {
      const [transaction] = await db
        .select()
        .from(accountTransactions)
        .where(eq(accountTransactions.id, id));
      if (!transaction) return undefined;

      // Determine new type
      let newType = transaction.type;
      if (transaction.type === 'debt') newType = 'payment_made';
      if (transaction.type === 'credit') newType = 'payment_received';
      if (newType === transaction.type) return transaction; // already settled

      const [updated] = await db
        .update(accountTransactions)
        .set({ type: newType })
        .where(eq(accountTransactions.id, id))
        .returning();

      // Only update balance if accountId exists
      if (transaction.accountId) {
        await this.updateAccountBalance(transaction.accountId);
      }
      return updated;
    });
  }

  async deleteTransaction(id: number): Promise<void> {
    return withDatabaseRetry(async () => {
      const [transaction] = await db
        .select()
        .from(accountTransactions)
        .where(eq(accountTransactions.id, id));
      
      if (transaction) {
        await db.delete(accountTransactions).where(eq(accountTransactions.id, id));
        // Only update balance if accountId exists
        if (transaction.accountId) {
          await this.updateAccountBalance(transaction.accountId);
        }
      }
    });
  }

  async getPendingTransactions(): Promise<{
    id: number;
    type: 'debt' | 'credit';
    amount: string;
    paidAmount: string;
    remainingAmount: string;
    description: string;
    transactionDate: Date;
    accountId: number | null;
  }[]> {
    return withDatabaseRetry(async () => {
      // Get all pending transactions (debt/credit) with their payments
      const transactions = await db.transaction(async (tx) => {
        // Get all parent transactions (debt/credit)
        const parents = await tx
          .select()
          .from(accountTransactions)
          .where(
            and(
              or(
                eq(accountTransactions.type, 'debt'),
                eq(accountTransactions.type, 'credit')
              )
            )
          );

        // Get all payment transactions (payment_made/payment_received)
        const payments = await tx
          .select()
          .from(accountTransactions)
          .where(
            or(
              eq(accountTransactions.type, 'payment_made'),
              eq(accountTransactions.type, 'payment_received')
            )
          );

        return parents.map(parent => {
          const relatedPayments = payments.filter(p => p.parentId === parent.id);
          const paidAmount = relatedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
          const remainingAmount = Math.max(0, Number(parent.amount) - paidAmount);
          
          return {
            id: parent.id,
            type: parent.type as 'debt' | 'credit',
            amount: parent.amount,
            paidAmount: paidAmount.toString(),
            remainingAmount: remainingAmount.toString(),
            description: parent.description,
            transactionDate: parent.transactionDate,
            accountId: parent.accountId
          };
        }).filter(t => Number(t.remainingAmount) > 0); // Only return unpaid/partially paid
      });

      return transactions;
    });
  }

  async getTransactionWithPayments(id: number) {
    return withDatabaseRetry(async () => {
      const [transaction] = await db
        .select()
        .from(accountTransactions)
        .where(eq(accountTransactions.id, id));

      if (!transaction) return null;

      const payments = await db
        .select()
        .from(accountTransactions)
        .where(eq(accountTransactions.parentId, id));

      return { transaction, payments };
    });
  }

  async partialSettle(
    parentId: number,
    amount: number,
    description: string,
    transactionDate: Date
  ): Promise<AccountTransaction> {
    return withDatabaseRetry(async () => {
      const parent = await this.getTransactionWithPayments(parentId);
      if (!parent) {
        throw new Error('Parent transaction not found');
      }

      const { transaction: parentTx, payments } = parent;
      const paidAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const remaining = Number(parentTx.amount) - paidAmount;

      if (amount > remaining) {
        throw new Error('Payment amount exceeds remaining balance');
      }

      // Create payment record
      const paymentType = parentTx.type === 'debt' ? 'payment_made' : 'payment_received';
      const [payment] = await db
        .insert(accountTransactions)
        .values({
          type: paymentType,
          amount: amount.toString(),
          description,
          transactionDate,
          parentId: parentTx.id,
          accountId: parentTx.accountId,
          projectId: parentTx.projectId,
          createdAt: new Date(),
        })
        .returning();

      // Update parent's account balance if it exists
      if (parentTx.accountId) {
        await this.updateAccountBalance(parentTx.accountId);
      }

      return payment;
    });
  }

  async getMonthlySummary(year: number): Promise<{ month: string; income: string; expense: string; net: string; }[]> {
    return withDatabaseRetry(async () => {
      const result = await db.execute(sql`SELECT to_char(date_trunc('month', "transaction_date"), 'YYYY-MM') AS month,
        SUM(CASE WHEN type IN ('credit','payment_received') THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type IN ('debt','payment_made') THEN amount ELSE 0 END) AS expense
        FROM ${accountTransactions}
        WHERE EXTRACT(YEAR FROM "transaction_date") = ${year}
        GROUP BY month
        ORDER BY month;`);

      return result.rows.map((r: any) => ({
        month: r.month,
        income: r.income as string,
        expense: r.expense as string,
        net: (Number(r.income) - Number(r.expense)).toString()
      }));
    });
  }

  async updateAccountBalance(accountId: number): Promise<void> {
    return withDatabaseRetry(async () => {
      // Calculate totals for this account
      const result = await db
        .select({
          totalDebt: sql`SUM(CASE WHEN type IN ('debt', 'payment_made') THEN amount ELSE 0 END)`,
          totalCredit: sql`SUM(CASE WHEN type IN ('credit', 'payment_received') THEN amount ELSE 0 END)`
        })
        .from(accountTransactions)
        .where(eq(accountTransactions.accountId, accountId));

      const totals = result[0];
      const totalDebt = Number(totals?.totalDebt || 0);
      const totalCredit = Number(totals?.totalCredit || 0);
      const balance = totalDebt - totalCredit; // positive = they owe us, negative = we owe them

      await db
        .update(currentAccounts)
        .set({
          totalDebt: totalDebt.toString(),
          totalCredit: totalCredit.toString(),
          balance: balance.toString(),
          updatedAt: new Date()
        })
        .where(eq(currentAccounts.id, accountId));
    });
  }

  // Portfolio Project operations
  async getPortfolioProjects(activeOnly: boolean = false): Promise<PortfolioProject[]> {
    return withDatabaseRetry(async () => {
      if (activeOnly) {
        return await db
          .select()
          .from(portfolioProjects)
          .where(eq(portfolioProjects.isActive, true))
          .orderBy(portfolioProjects.orderIndex);
      }
      return await db.select().from(portfolioProjects).orderBy(portfolioProjects.orderIndex);
    });
  }

  async getPortfolioProject(id: number): Promise<PortfolioProject | undefined> {
    return withDatabaseRetry(async () => {
      const [project] = await db.select().from(portfolioProjects).where(eq(portfolioProjects.id, id));
      return project || undefined;
    });
  }

  async createPortfolioProject(project: InsertPortfolioProject): Promise<PortfolioProject> {
    return withDatabaseRetry(async () => {
      const [newProject] = await db
        .insert(portfolioProjects)
        .values({
          ...project,
          updatedAt: new Date()
        })
        .returning();
      return newProject;
    });
  }

  async updatePortfolioProject(id: number, project: Partial<InsertPortfolioProject>): Promise<PortfolioProject> {
    return withDatabaseRetry(async () => {
      const [updatedProject] = await db
        .update(portfolioProjects)
        .set({
          ...project,
          updatedAt: new Date()
        })
        .where(eq(portfolioProjects.id, id))
        .returning();
      return updatedProject;
    });
  }

  async deletePortfolioProject(id: number): Promise<void> {
    return withDatabaseRetry(async () => {
      await db.delete(portfolioProjects).where(eq(portfolioProjects.id, id));
    });
  }

  async updatePortfolioProjectOrder(projectIds: number[]): Promise<void> {
    return withDatabaseRetry(async () => {
      // Update order index for each project
      for (let i = 0; i < projectIds.length; i++) {
        await db
          .update(portfolioProjects)
          .set({ orderIndex: i, updatedAt: new Date() })
          .where(eq(portfolioProjects.id, projectIds[i]));
      }
    });
  }
}

export const storage = new DatabaseStorage();
