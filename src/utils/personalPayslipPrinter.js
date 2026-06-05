/**
 * Vynora Payslip Printing Utility
 * Renders and prints a clean, print-friendly HTML payslip window.
 */
export function printPersonalPayslip({ slip, profileForm }) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const lateness = Number(slip.latenessDeduction) || 0;
  const customDeductionsList = (slip.customDeductions || [])
    .filter(d => d.name && Number(d.amount) > 0)
    .map(d => ({ name: d.name, amount: Number(d.amount) || 0 }));
  const customDeductionsSum = customDeductionsList.reduce((sum, d) => sum + d.amount, 0);
  const computedTotalDeductions = lateness + customDeductionsSum;

  const customAdditionsList = (slip.customAdditions || [])
    .filter(a => a.name && Number(a.amount) > 0)
    .map(a => ({ name: a.name, amount: Number(a.amount) || 0 }));
  const computedTotalAdditions = customAdditionsList.reduce((sum, a) => sum + a.amount, 0);

  const computedNetPay = Math.max(
    0,
    (slip.totalGrossEarnings || 0) + computedTotalAdditions - computedTotalDeductions
  );

  const deductionsListHTML = [
    ...(lateness > 0
      ? [
          `
        <tr style="border-bottom: 1px solid #E2E8F0; font-size: 13px;">
          <td style="padding: 10px; color: #475569;">Lateness Deductions</td>
          <td style="padding: 10px; text-align: right; color: #E11D48; font-weight: 500;">PHP ${lateness.toLocaleString(
            undefined,
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}</td>
        </tr>
      `,
        ]
      : []),
    ...customDeductionsList.map(
      d => `
        <tr style="border-bottom: 1px solid #E2E8F0; font-size: 13px;">
          <td style="padding: 10px; color: #475569;">${d.name}</td>
          <td style="padding: 10px; text-align: right; color: #E11D48; font-weight: 500;">PHP ${d.amount.toLocaleString(
            undefined,
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}</td>
        </tr>
      `
    ),
  ].join("");

  const additionsListHTML = customAdditionsList
    .map(
      a => `
      <tr style="border-bottom: 1px solid #E2E8F0; font-size: 13px;">
        <td style="padding: 10px; color: #475569;">${a.name}</td>
        <td style="padding: 10px; text-align: right; color: #10B981; font-weight: 500;">PHP ${a.amount.toLocaleString(
          undefined,
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )}</td>
      </tr>
    `
    )
    .join("");

  const hasDeductions = lateness > 0 || customDeductionsList.length > 0;
  const hasAdditions = customAdditionsList.length > 0;

  printWindow.document.write(`
    <html>
      <head>
        <title>Payslip - ${profileForm.fullName || "Personal Member"}</title>
        <style>
          body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1E293B; margin: 40px; background-color: #FFFFFF; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .container { max-width: 800px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 16px; padding: 30px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; border-bottom: 2px solid #10B981; padding-bottom: 15px; }
          .logo-text { font-size: 22px; font-weight: 900; color: #10B981; letter-spacing: 0.05em; }
          .slip-title { font-size: 14px; font-weight: 800; color: #64748B; uppercase; letter-spacing: 0.1em; text-align: right; }
          .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; background-color: #F8FAFC; border-radius: 12px; padding: 20px; font-size: 13px; }
          .info-col p { margin: 6px 0; color: #475569; }
          .info-col strong { color: #0F172A; }
          .table-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; background-color: #F8FAFC; padding: 12px 10px; border-bottom: 2px solid #CBD5E1; font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
          .th-right { text-align: right; }
          .td-right { text-align: right; }
          .summary-card { background: linear-gradient(135deg, #059669 0%, #10B981 100%); border-radius: 12px; padding: 20px; color: #FFFFFF; display: flex; justify-content: space-between; align-items: center; margin-top: 20px; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2); }
          .summary-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.9; }
          .summary-value { font-size: 24px; font-weight: 900; }
          .sign-section { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; margin-top: 50px; padding-top: 30px; border-top: 1px dashed #E2E8F0; text-align: center; font-size: 12px; color: #64748B; }
          .signature-line { border-top: 1px solid #94A3B8; margin-top: 40px; padding-top: 8px; }
          @media print {
            body { margin: 0; }
            .container { border: none; box-shadow: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <div class="logo-text">VYNORA</div>
              <div style="font-size: 10px; color: #10B981; font-weight: bold; letter-spacing: 0.1em;">PERSONAL PAYROLL RECORD</div>
            </div>
            <div>
              <div class="slip-title">OFFICIAL PAYSLIP</div>
              <div style="font-size: 12px; color: #64748B; margin-top: 4px;">Cutoff: <strong>${
                slip.payrollStart
              }</strong> to <strong>${slip.payrollEnd}</strong></div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-col">
              <p><strong>Employee Name:</strong> ${profileForm.fullName || "Personal Member"}</p>
              <p><strong>Job Title:</strong> ${profileForm.position || "Not Specified"}</p>
              <p><strong>Department:</strong> ${profileForm.department || "Not Specified"}</p>
              <p><strong>Employee ID:</strong> ${profileForm.employeeId || "Not Specified"}</p>
            </div>
            <div class="info-col">
              <p><strong>SSS No.:</strong> ${profileForm.sss || "-"}</p>
              <p><strong>PhilHealth No.:</strong> ${profileForm.philhealth || "-"}</p>
              <p><strong>Pag-IBIG MID:</strong> ${profileForm.pagibig || "-"}</p>
              <p><strong>TIN:</strong> ${profileForm.tin || "-"}</p>
            </div>
          </div>

          <div class="table-container">
            <div>
              <h4 style="margin: 0 0 10px 0; color: #0F172A; font-weight: 800; font-size: 14px;">Earnings Breakdown</h4>
              <table style="margin-bottom: 20px;">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th class="th-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #E2E8F0; font-size: 13px;">
                    <td style="padding: 10px; color: #475569;">Basic Salary</td>
                    <td style="padding: 10px; text-align: right; color: #0F172A; font-weight: 500;">PHP ${Number(
                      slip.basicEarnings || 0
                    ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                  ${
                    Number(slip.overtimeEarnings) > 0
                      ? `
                    <tr style="border-bottom: 1px solid #E2E8F0; font-size: 13px;">
                      <td style="padding: 10px; color: #475569;">Overtime Pay</td>
                      <td style="padding: 10px; text-align: right; color: #0F172A; font-weight: 500;">PHP ${Number(
                        slip.overtimeEarnings
                      ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  `
                      : ""
                  }
                  ${
                    Number(slip.nightDiffEarnings) > 0
                      ? `
                    <tr style="border-bottom: 1px solid #E2E8F0; font-size: 13px;">
                      <td style="padding: 10px; color: #475569;">Night Differential Pay</td>
                      <td style="padding: 10px; text-align: right; color: #0F172A; font-weight: 500;">PHP ${Number(
                        slip.nightDiffEarnings
                      ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  `
                      : ""
                  }
                  <tr style="background-color: #F8FAFC; font-weight: bold; font-size: 13px;">
                    <td style="padding: 10px; color: #0F172A;">Gross Earnings</td>
                    <td style="padding: 10px; text-align: right; color: #059669;">PHP ${Number(
                      slip.totalGrossEarnings || 0
                    ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>

              <h4 style="margin: 0 0 10px 0; color: #0F172A; font-weight: 800; font-size: 14px;">Additions & Allowances</h4>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th class="th-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    hasAdditions
                      ? additionsListHTML
                      : `
                    <tr style="border-bottom: 1px solid #E2E8F0; font-size: 13px;">
                      <td style="padding: 10px; color: #94A3B8; italic; text-align: center;" colspan="2">No Additions Recorded</td>
                    </tr>
                  `
                  }
                  <tr style="background-color: #F8FAFC; font-weight: bold; font-size: 13px;">
                    <td style="padding: 10px; color: #0F172A;">Total Additions</td>
                    <td style="padding: 10px; text-align: right; color: #059669;">PHP ${computedTotalAdditions.toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 style="margin: 0 0 10px 0; color: #0F172A; font-weight: 800; font-size: 14px;">Deductions & Adjustments</h4>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th class="th-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    hasDeductions
                      ? deductionsListHTML
                      : `
                    <tr style="border-bottom: 1px solid #E2E8F0; font-size: 13px;">
                      <td style="padding: 10px; color: #94A3B8; italic; text-align: center;" colspan="2">No Deductions Recorded</td>
                    </tr>
                  `
                  }
                  <tr style="background-color: #F8FAFC; font-weight: bold; font-size: 13px;">
                    <td style="padding: 10px; color: #0F172A;">Total Deductions</td>
                    <td style="padding: 10px; text-align: right; color: #E11D48;">PHP ${computedTotalDeductions.toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="summary-card">
            <div>
              <div class="summary-title">Net Take-Home Pay</div>
              <div style="font-size: 10px; opacity: 0.8; margin-top: 2px;">Gross Pay + Additions minus Total Deductions</div>
            </div>
            <div class="summary-value">PHP ${computedNetPay.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}</div>
          </div>

          <div class="sign-section">
            <div>
              <div class="signature-line">Prepared By</div>
            </div>
            <div>
              <div class="signature-line">Employee Signature / Acknowledged Date</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}
