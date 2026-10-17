import { AnalyzeResponse } from '../types/analysis';

export interface ReportExportOptions {
  faceBlur?: boolean;
}

export function generateForensicPdfReport(
  result: AnalyzeResponse,
  options?: ReportExportOptions
): void {
  const faceBlur = !!options?.faceBlur;

  const verdictTitle =
    result.verdict === 'inconclusive'
      ? 'INCONCLUSIVE / NO FACE DETECTED'
      : result.verdict === 'authentic'
      ? 'AUTHENTIC / LOW RISK'
      : result.verdict === 'suspicious'
      ? 'SUSPICIOUS / INCONCLUSIVE'
      : 'MANIPULATED / AI DEEPFAKE';

  const verdictColor =
    result.verdict === 'inconclusive'
      ? '#94a3b8'
      : result.verdict === 'authentic'
      ? '#10b981'
      : result.verdict === 'suspicious'
      ? '#f59e0b'
      : '#ef4444';

  const now = new Date();
  const dateStr = now.toUTCString();

  // Create an offscreen printable window formatted for forensic reporting
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download and print the forensic PDF report.');
    return;
  }

  const flaggedRows =
    result.flagged_segments.length > 0
      ? result.flagged_segments
          .map(
            (seg, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-family: monospace;">#0${idx + 1}</td>
          <td style="padding: 10px; font-family: monospace;">${seg.start_time.toFixed(1)}s – ${seg.end_time.toFixed(1)}s</td>
          <td style="padding: 10px;">${seg.description}</td>
          <td style="padding: 10px; font-weight: bold; color: ${
            seg.severity === 'high' ? '#ef4444' : seg.severity === 'medium' ? '#f59e0b' : '#10b981'
          }; text-transform: uppercase;">
            ${seg.score}% (${seg.severity})
          </td>
        </tr>
      `
          )
          .join('')
      : `<tr><td colspan="4" style="padding: 15px; text-align: center; color: #10b981; font-weight: bold;">No anomaly segments detected across timeline duration.</td></tr>`;

  const privacyBadge = faceBlur
    ? `<div style="display: inline-block; padding: 4px 10px; border-radius: 9999px; background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: bold; border: 1px solid #bae6fd; margin-bottom: 15px;">
        🛡️ PRIVACY PROTOCOL: FACIAL BLURRING & ANONYMIZATION APPLIED
       </div>`
    : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>TruthLens Forensic Audit Report - ${result.media_name}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          padding: 30px;
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
        }
        @media print {
          body { padding: 10px; }
          .no-print { display: none !important; }
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 18px;
          margin-bottom: 25px;
        }
        .brand {
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.5px;
          color: #0369a1;
        }
        .meta-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
          background: #f8fafc;
          border-radius: 8px;
          overflow: hidden;
        }
        .meta-table td {
          padding: 8px 14px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 12px;
        }
        .verdict-box {
          border: 2px solid ${verdictColor};
          background: ${verdictColor}10;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .verdict-title {
          font-size: 20px;
          font-weight: 800;
          color: ${verdictColor};
          margin: 0 0 5px 0;
        }
        .score-pill {
          font-size: 32px;
          font-weight: 900;
          font-family: monospace;
          color: ${verdictColor};
          text-align: right;
        }
        table.anomaly-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
        }
        table.anomaly-table th {
          background: #0f172a;
          color: #ffffff;
          padding: 10px;
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
        }
        .disclaimer-box {
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 14px;
          border-radius: 6px;
          font-size: 11px;
          color: #92400e;
          margin-bottom: 25px;
        }
        .footer {
          border-top: 1px solid #cbd5e1;
          padding-top: 15px;
          font-size: 11px;
          color: #64748b;
          display: flex;
          justify-content: space-between;
        }
        .btn-print {
          background: #0284c7;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          font-size: 13px;
        }
        ${faceBlur ? `
          .face-sample-box {
            filter: blur(8px);
            opacity: 0.7;
          }
        ` : ''}
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
      </div>

      <div class="header">
        <div>
          <div class="brand">TruthLens Forensics</div>
          <div style="font-size: 12px; color: #64748b;">AI-Powered Forensic Deepfake Verification Audit</div>
        </div>
        <div style="text-align: right; font-size: 11px; color: #64748b; font-family: monospace;">
          Report ID: TL-${result.sha256.substring(0, 10).toUpperCase()}<br>
          Generated: ${dateStr}
        </div>
      </div>

      ${privacyBadge}

      <table class="meta-table">
        <tr>
          <td><strong>Subject Media:</strong> ${result.media_name}</td>
          <td><strong>Input Type:</strong> ${result.input_type.toUpperCase()}</td>
        </tr>
        <tr>
          <td><strong>SHA-256 Checksum:</strong> <code style="font-size: 11px;">${result.sha256}</code></td>
          <td><strong>Model Confidence:</strong> ${result.confidence}%</td>
        </tr>
      </table>

      <div class="verdict-box">
        <div>
          <div class="verdict-title">${verdictTitle}</div>
          <div style="font-size: 12px; color: #475569;">
            Signature Green/Amber/Red Verdict Calibration Spectrum: 
            Authentic (0-25%) • Suspicious (26-69%) • AI Deepfake (70-100%)
          </div>
        </div>
        <div class="score-pill">
          ${result.ai_probability}%
          <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: normal;">AI Probability</div>
        </div>
      </div>

      <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
        Flagged Temporal Timeline Anomalies
      </h3>
      <table class="anomaly-table">
        <thead>
          <tr>
            <th>Index</th>
            <th>Interval</th>
            <th>Forensic Finding</th>
            <th>Severity Score</th>
          </tr>
        </thead>
        <tbody>
          ${flaggedRows}
        </tbody>
      </table>

      <div class="disclaimer-box">
        <strong>LEGAL NOTICE & PROBABILISTIC DISCLAIMER:</strong><br>
        TruthLens analysis outputs and synthetic probabilities are probabilistic estimates generated by algorithmic forensics. They do not constitute judicial certification, legal testimony, or indisputable proof in court proceedings. Independent expert review is strongly recommended.
      </div>

      <div class="footer">
        <span>TruthLens Security Sandbox • Zero-Retention Intake</span>
        <span>Page 1 of 1 • Verifiable Hash: ${result.sha256.substring(0, 16)}</span>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
