import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getTableColumns, runQuery } from "./db.js";

dotenv.config();

const app = express();
const portValue = Number(process.env.PORT || 5000);

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

function getRangeWhereClause(rangeValue) {
  if (rangeValue === "month") {
    return `
      datetime_posted >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
      AND datetime_posted < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
    `;
  }

  if (rangeValue === "all") {
    return `datetime_posted IS NOT NULL`;
  }

  // default = last 30 days
  return `datetime_posted >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
}


/**
 * GET /api/v1/dashboard/summary
 * Month-to-date income / spending / net
 */
app.get("/api/v1/dashboard/summary", async (req, res) => {
  try {
    const rangeValue = String(req.query.range || "30d");
    const whereRangeValue = getRangeWhereClause(rangeValue);

    const sqlValue = `
      SELECT
        COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0) AS incomeTotal,
        COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS spendingTotal
      FROM plaid_transactions
      WHERE pending = 0
        AND ${whereRangeValue};
    `;

    const rowsValue = await runQuery(sqlValue);
    const incomeTotal = Number(rowsValue[0].incomeTotal);
    const spendingTotal = Number(rowsValue[0].spendingTotal);

    const labelValue =
      rangeValue === "month"
        ? new Date().toLocaleString("en-US", { month: "long", year: "numeric" })
        : rangeValue === "all"
        ? "All time"
        : "Last 30 days";

    res.json({
      range: rangeValue,
      monthLabel: labelValue,
      incomeTotal,
      spendingTotal,
      netTotal: incomeTotal - spendingTotal,
      dataAsOf: new Date().toLocaleString()
    });
  } catch (errValue) {
    res.status(500).json({ error: String(errValue) });
  }
});



/**
 * GET /api/v1/dashboard/recent-transactions?limit=8
 */
app.get("/api/v1/dashboard/recent-transactions", async (req, res) => {
  try {
    const limitValue = Math.min(Number(req.query.limit || 8), 25);

    const sqlValue = `
      SELECT
        t.id AS transactionId,
        DATE(t.datetime_posted) AS date,
        COALESCE(t.merchant_name, t.name_legacy) AS name,
        COALESCE(pfc.primary_category, 'Uncategorized') AS category,
        t.amount AS amount
      FROM plaid_transactions t
      LEFT JOIN plaid_transaction_pfc pfc
        ON pfc.transaction_id = t.id
      WHERE t.pending = 0
      ORDER BY t.datetime_posted DESC
      LIMIT ?;
    `;

    const rowsValue = await runQuery(sqlValue, [limitValue]);

    res.json(
      rowsValue.map((rowValue) => ({
        transactionId: String(rowValue.transactionId),
        date: String(rowValue.date),
        name: String(rowValue.name ?? ""),
        category: String(rowValue.category ?? "Uncategorized"),
        amount: Number(rowValue.amount)
      }))
    );
  } catch (errValue) {
    res.status(500).json({ error: String(errValue) });
  }
});


/**
 * GET /api/v1/dashboard/spending-by-category
 * Returns: [{ category: "Food", total: 123.45 }]
 */
app.get("/api/v1/dashboard/spending-by-category", async (req, res) => {
  try {
    const rangeValue = String(req.query.range || "30d");
    const whereRangeValue = getRangeWhereClause(rangeValue);

    const sqlValue = `
      SELECT
        COALESCE(pfc.primary_category, 'Uncategorized') AS category,
        COALESCE(SUM(t.amount), 0) AS total
      FROM plaid_transactions t
      LEFT JOIN plaid_transaction_pfc pfc
        ON pfc.transaction_id = t.id
      WHERE t.pending = 0
        AND t.amount > 0
        AND ${whereRangeValue}
      GROUP BY category
      ORDER BY total DESC;
    `;

    const rowsValue = await runQuery(sqlValue);

    res.json(
      rowsValue.map((rowValue) => ({
        category: String(rowValue.category),
        total: Number(rowValue.total)
      }))
    );
  } catch (errValue) {
    res.status(500).json({ error: String(errValue) });
  }
});


app.listen(portValue, () => {
  console.log(`✅ Dev API running on http://localhost:${portValue}`);
});
