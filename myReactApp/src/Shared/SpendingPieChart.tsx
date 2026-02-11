import { useEffect, useMemo, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJs, ArcElement, Tooltip, Legend } from "chart.js";
import { apiClient } from "./apiClient";


ChartJs.register(ArcElement, Tooltip, Legend);

type SpendingByCategoryRow = {
  category: string;
  total: number;
};

function formatMoney(amountValue: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountValue);
}

export default function SpendingPieChart() {
  const [dataRows, setDataRows] = useState<SpendingByCategoryRow[]>([]);
  const [errorText, setErrorText] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setErrorText("");
        const rowsValue = await apiClient.get<SpendingByCategoryRow[]>(
          "/api/v1/dashboard/spending-by-category",
        );
        setDataRows(rowsValue);
      } catch (errValue) {
        setErrorText(
          errValue instanceof Error
            ? errValue.message
            : "Failed to load chart data",
        );
      }
    };

    void loadData();
  }, []);

  const chartData = useMemo(() => {
    const labelsValue = dataRows.map((r) => r.category);
    const valuesValue = dataRows.map((r) => r.total);

    const backgroundColors = labelsValue.map((_, indexValue) => {
      const hueValue = (indexValue * 47) % 360; // spreads colors nicely
      return `hsl(${hueValue} 70% 55%)`;
    });

    const borderColors = labelsValue.map((_, indexValue) => {
      const hueValue = (indexValue * 47) % 360;
      return `hsl(${hueValue} 70% 35%)`;
    });

    return {
      labels: labelsValue,
      datasets: [
        {
          label: "Spending",
          data: valuesValue,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  }, [dataRows]);

  const chartOptions = {
    plugins: {
      legend: {
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const value = Number(ctx.raw ?? 0);
              return `${ctx.label}: ${formatMoney(value)}`;
            }
          }
        },
        position: "bottom" as const,
        align: "center" as const,
        labels: {
          usePointStyle: true,
          padding: 16,
          boxWidth: 10
        }
        
      }
    },
    layout: {
      padding: {
        left: 0,
        right: 0
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  if (errorText) {
    return <div style={{ opacity: 0.85 }}>Chart error: {errorText}</div>;
  }

  if (!dataRows.length) {
    return <div style={{ opacity: 0.85 }}>Loading spending breakdown…</div>;
  }

  return (
      <Pie height="420" data={chartData} options={chartOptions} />
  );
}
