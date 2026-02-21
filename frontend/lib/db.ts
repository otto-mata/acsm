import sqlite3 from "sqlite3";
import path from "path";

// Path to the database created by the Python backend
const DB_PATH = path.resolve(process.env.ROOT_PATH ?? "", "../backend/acsm.db");

export class Database {
  private db: sqlite3.Database;
  private static _instance: Database | null = null;
  /**
   * Open a connection to the database
   */
  public static get instance() {
    if (Database._instance === null) Database._instance = new Database();
    return Database._instance;
  }
  private constructor() {
    this.db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY);
  }
  /**
   * Execute a query that returns multiple rows
   */
  async all<T = any>(query: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows: T[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Execute a query that returns a single row
   */
  async get<T = any>(
    query: string,
    params: any[] = [],
  ): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row: T) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Execute a query that doesn't return rows (INSERT, UPDATE, DELETE)
   */
  async run(query: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
            
          resolve();
        }
      });
    });
  }

  /**
   * Helper method to execute a query within a connection lifecycle
   * Opens connection, runs callback, and ensures connection is closed
   */
}
