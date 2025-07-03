import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
});

export const contactRequests = pgTable("contact_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  serviceType: text("service_type").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone"),
  clientEmail: text("client_email"),
  projectType: text("project_type").notNull(),
  status: text("status").notNull().default("planned"), // planned, in_progress, completed, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const currentAccounts = pgTable("current_accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  accountType: text("account_type").notNull(), // customer, supplier, other
  totalDebt: decimal("total_debt", { precision: 12, scale: 2 }).default("0"),
  totalCredit: decimal("total_credit", { precision: 12, scale: 2 }).default("0"),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0"), // positive = they owe us, negative = we owe them
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accountTransactions = pgTable("account_transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => currentAccounts.id).notNull(),
  projectId: integer("project_id").references(() => projects.id),
  type: text("type").notNull(), // debt, credit, payment_received, payment_made
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertContactRequestSchema = createInsertSchema(contactRequests).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCurrentAccountSchema = createInsertSchema(currentAccounts).omit({
  id: true,
  totalDebt: true,
  totalCredit: true,
  balance: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(accountTransactions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertContactRequest = z.infer<typeof insertContactRequestSchema>;
export type ContactRequest = typeof contactRequests.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertCurrentAccount = z.infer<typeof insertCurrentAccountSchema>;
export type CurrentAccount = typeof currentAccounts.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type AccountTransaction = typeof accountTransactions.$inferSelect;
