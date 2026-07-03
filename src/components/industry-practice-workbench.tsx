"use client";

import {
  BookOpenCheck,
  Calculator,
  ChartNoAxesCombined,
  Database,
  Settings2,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  industryPracticePack,
  type PracticeYear,
} from "@/data/industry-practice-data";
import type { IndustryId } from "@/data/industries";

type PracticeSection = "data" | "configuration" | "transactions" | "costing";

function money(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function IndustryPracticeWorkbench({ industryId }: { industryId: IndustryId }) {
  const [section, setSection] = useState<PracticeSection>("data");
  const [year, setYear] = useState<PracticeYear>(1);
  const pack = useMemo(() => industryPracticePack(industryId), [industryId]);
  const yearRecords = pack.monthlyRecords.filter((record) => record.year === year);

  const sections: Array<{
    id: PracticeSection;
    label: string;
    icon: typeof Database;
  }> = [
    { id: "data", label: "Three-year data", icon: Database },
    { id: "configuration", label: "SAP configuration", icon: Settings2 },
    { id: "transactions", label: "Specialist transactions", icon: Wrench },
    { id: "costing", label: "Costing and financials", icon: Calculator },
  ];

  return (
    <article className="industry-practice-workbench">
      <div className="journey-section-heading">
        <div>
          <span className="section-kicker">Complete industry practice data</span>
          <h3>Three-year operating and finance workbench</h3>
          <p>{pack.scope}</p>
        </div>
        <BookOpenCheck size={25} />
      </div>

      <div className="practice-coverage-cards">
        <div><strong>36</strong><span>monthly periods</span></div>
        <div><strong>3</strong><span>fiscal years</span></div>
        <div><strong>{pack.configuration.length}</strong><span>configuration workstreams</span></div>
        <div><strong>{pack.specialistTransactions.length}</strong><span>specialist transaction chains</span></div>
      </div>

      <div className="practice-section-tabs" aria-label="Industry practice workbench sections">
        {sections.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={section === item.id ? "active" : ""}
              onClick={() => setSection(item.id)}
              key={item.id}
            >
              <Icon size={16} /> {item.label}
            </button>
          );
        })}
      </div>

      {section === "data" && (
        <div className="practice-data-section">
          <div className="practice-year-selector" aria-label="Practice dataset year">
            {([1, 2, 3] as PracticeYear[]).map((item) => (
              <button
                className={year === item ? "active" : ""}
                onClick={() => setYear(item)}
                key={item}
              >
                Year {item} · {pack.fiscalYears[item - 1]}
              </button>
            ))}
          </div>
          <div className="practice-table-scroll">
            <table className="practice-data-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Operating volume</th>
                  <th>Plan revenue</th>
                  <th>Actual revenue</th>
                  <th>EBITDA</th>
                  <th>Operating profit</th>
                  <th>Inventory/WIP</th>
                  <th>Documents</th>
                  <th>Practice exception</th>
                </tr>
              </thead>
              <tbody>
                {yearRecords.map((record) => (
                  <tr key={record.id}>
                    <td><strong>{record.period}</strong><small>P{String(record.month).padStart(2, "0")}</small></td>
                    <td>{record.operatingVolume.toLocaleString("en-GB")} <small>{record.volumeUnit}</small></td>
                    <td>{money(record.plannedRevenue)}</td>
                    <td>{money(record.revenue)}</td>
                    <td>{money(record.ebitda)}</td>
                    <td>{money(record.operatingProfit)}</td>
                    <td>{money(record.inventory)}</td>
                    <td>{record.transactionDocuments.toLocaleString("en-GB")}</td>
                    <td>{record.exception}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="practice-data-note">
            Each month supplies a stable training baseline for transactions, close,
            costing, exception handling, and management reporting. Values are
            deterministic learning data—not market forecasts.
          </p>
        </div>
      )}

      {section === "configuration" && (
        <div className="practice-configuration-list">
          {pack.configuration.map((workstream) => (
            <article key={workstream.sequence}>
              <span>{workstream.sequence}</span>
              <div>
                <small>{workstream.workspace}</small>
                <h4>{workstream.area}</h4>
                <code>{workstream.transactions}</code>
                <strong>Configuration decisions</strong>
                <ul>{workstream.keyDecisions.map((decision) => <li key={decision}>{decision}</li>)}</ul>
                <p><b>Validation:</b> {workstream.validation}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {section === "transactions" && (
        <div className="practice-specialist-list">
          {pack.specialistTransactions.map((transaction) => (
            <details key={transaction.id}>
              <summary>
                <span>{transaction.id}</span>
                <div><small>{transaction.module} · {transaction.role}</small><strong>{transaction.title}</strong></div>
                <code>{transaction.appOrTransaction}</code>
              </summary>
              <div className="practice-transaction-body">
                <p><b>Business trigger:</b> {transaction.businessTrigger}</p>
                <div>
                  <section><strong>Expected input</strong><ul>{transaction.expectedInput.map((item) => <li key={item}>{item}</li>)}</ul></section>
                  <section><strong>Expected result</strong><ul>{transaction.expectedResult.map((item) => <li key={item}>{item}</li>)}</ul></section>
                </div>
                <ol>{transaction.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                <p><b>Accounting impact:</b> {transaction.accountingImpact}</p>
                <div className="practice-control-strip">{transaction.controls.map((control) => <span key={control}>{control}</span>)}</div>
              </div>
            </details>
          ))}
        </div>
      )}

      {section === "costing" && (
        <div className="practice-costing-section">
          <div className="practice-costing-facts">
            <div><span>Cost object</span><strong>{pack.costing.costObject}</strong></div>
            <div><span>Costing method</span><strong>{pack.costing.method}</strong></div>
            <div><span>Settlement</span><strong>{pack.costing.settlementReceiver}</strong></div>
            <div><span>Profitability dimensions</span><strong>{pack.costing.profitabilityDimensions.join(" · ")}</strong></div>
          </div>
          <div className="practice-cost-components">
            {pack.costing.components.map((component) => (
              <div key={component.name}>
                <span><strong>{component.name}</strong><b>{component.share}%</b></span>
                <div><span style={{ width: `${component.share}%` }} /></div>
                <small>{component.driver}</small>
              </div>
            ))}
          </div>
          <div className="practice-table-scroll">
            <table className="practice-data-table annual">
              <thead>
                <tr><th>Financial statement</th>{pack.annualSummaries.map((summary) => <th key={summary.year}>Year {summary.year}</th>)}</tr>
              </thead>
              <tbody>
                {[
                  ["Revenue", "revenue"],
                  ["Direct cost", "directCost"],
                  ["Labour cost", "labourCost"],
                  ["Overhead", "overheadCost"],
                  ["Logistics", "logisticsCost"],
                  ["Operating expense", "operatingExpense"],
                  ["EBITDA", "ebitda"],
                  ["Depreciation", "depreciation"],
                  ["Operating profit", "operatingProfit"],
                  ["Closing inventory/WIP", "closingInventory"],
                  ["Closing receivables", "closingReceivables"],
                  ["Closing payables", "closingPayables"],
                  ["Closing cash", "closingCash"],
                ].map(([label, field]) => (
                  <tr key={field}>
                    <td><strong>{label}</strong></td>
                    {pack.annualSummaries.map((summary) => (
                      <td key={summary.year}>{money(summary[field as keyof typeof summary] as number)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="practice-financial-check">
            <ChartNoAxesCombined size={18} />
            <p>Reconcile each yearly total to the 12 monthly records, then explain price, volume, mix, usage, efficiency, overhead, working-capital, and exception drivers.</p>
          </div>
        </div>
      )}
    </article>
  );
}
