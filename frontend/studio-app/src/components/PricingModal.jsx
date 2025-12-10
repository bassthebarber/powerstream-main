// frontend/studio-app/src/components/PricingModal.jsx
// Pricing and Contract Summary Modal for Artists
// POWERSTREAM AI STUDIO – LIVE ROOM & ENGINEER CONTRACT MODE

import React, { useState, useEffect } from "react";
import {
  getJobPricingBreakdown,
  createStudioJob,
  generateContract,
  getContractText,
  signContract,
} from "../lib/studioApi.js";

/**
 * PricingModal - Shows pricing breakdown and contract before booking a service
 * 
 * Props:
 * - jobType: string (mix, master, beat, etc.)
 * - onClose: function
 * - onComplete: function (called after successful job creation)
 * - sessionId: optional live room session ID
 * - customPrice: optional custom price override
 */
export default function PricingModal({ 
  jobType, 
  onClose, 
  onComplete, 
  sessionId = null,
  customPrice = null,
  title = "",
  description = "",
}) {
  // State
  const [step, setStep] = useState("pricing"); // pricing | contract | complete
  const [pricing, setPricing] = useState(null);
  const [job, setJob] = useState(null);
  const [contract, setContract] = useState(null);
  const [contractText, setContractText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agreed, setAgreed] = useState(false);

  // Load pricing on mount
  useEffect(() => {
    loadPricing();
  }, [jobType, customPrice]);

  const loadPricing = async () => {
    try {
      setLoading(true);
      const res = await getJobPricingBreakdown(jobType, customPrice);
      setPricing(res.breakdown);
    } catch (err) {
      setError("Failed to load pricing: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create job and generate contract
  const handleProceed = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create the job
      const jobRes = await createStudioJob({
        type: jobType,
        title: title || `${jobType} Service`,
        description,
        sessionId,
        basePrice: customPrice || pricing?.basePrice,
      });

      setJob(jobRes.job);

      // Generate contract
      const contractRes = await generateContract(jobRes.job.id, {
        title: `${jobType.toUpperCase()} Service Agreement`,
        serviceDescription: description || `Professional ${jobType} services.`,
      });

      setContract(contractRes.contract);

      // Get full contract text
      const textRes = await getContractText(contractRes.contract.id);
      setContractText(textRes.text);

      setStep("contract");
    } catch (err) {
      setError("Failed to create job: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sign contract and complete
  const handleSign = async () => {
    if (!agreed) {
      setError("You must agree to the terms before signing.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await signContract(contract.id);
      
      setStep("complete");
      
      if (onComplete) {
        onComplete({ job, contract });
      }
    } catch (err) {
      setError("Failed to sign contract: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format job type for display
  const formatJobType = (type) => {
    return type?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "Service";
  };

  return (
    <div className="pricing-modal-overlay" onClick={onClose}>
      <style>{`
        .pricing-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .pricing-modal {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #333;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          font-size: 1.25rem;
          color: #d4af37;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          color: #888;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          line-height: 1;
        }

        .close-btn:hover {
          color: #fff;
        }

        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }

        .step-indicator {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          font-size: 0.875rem;
        }

        .step.active {
          color: #d4af37;
        }

        .step.completed {
          color: #22c55e;
        }

        .step-number {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
        }

        .step.active .step-number {
          background: #d4af37;
          color: #000;
        }

        .step.completed .step-number {
          background: #22c55e;
          color: #000;
        }

        .pricing-breakdown {
          background: #0a0a0a;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .pricing-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid #222;
          font-size: 0.875rem;
        }

        .pricing-row:last-child {
          border-bottom: none;
        }

        .pricing-row.total {
          border-top: 2px solid #333;
          padding-top: 1rem;
          margin-top: 0.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: #d4af37;
        }

        .pricing-label {
          color: #888;
        }

        .pricing-value {
          color: #fff;
        }

        .pricing-value.highlight {
          color: #d4af37;
        }

        .contract-text {
          background: #0a0a0a;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 1rem;
          max-height: 300px;
          overflow-y: auto;
          font-size: 0.75rem;
          font-family: monospace;
          white-space: pre-wrap;
          line-height: 1.6;
          color: #ccc;
        }

        .agreement-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-top: 1rem;
          padding: 1rem;
          background: #222;
          border-radius: 8px;
        }

        .agreement-checkbox input {
          width: 20px;
          height: 20px;
          accent-color: #d4af37;
          margin-top: 2px;
        }

        .agreement-checkbox label {
          font-size: 0.875rem;
          color: #ccc;
          cursor: pointer;
        }

        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid #333;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn.secondary {
          background: #333;
          color: #fff;
        }

        .btn.secondary:hover {
          background: #444;
        }

        .btn.primary {
          background: #d4af37;
          color: #000;
        }

        .btn.primary:hover {
          background: #e5c349;
        }

        .btn.primary:disabled {
          background: #666;
          cursor: not-allowed;
        }

        .error-message {
          background: #ef44441a;
          border: 1px solid #ef4444;
          color: #ef4444;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .success-state {
          text-align: center;
          padding: 2rem;
        }

        .success-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .success-title {
          font-size: 1.5rem;
          color: #22c55e;
          margin-bottom: 0.5rem;
        }

        .success-message {
          color: #888;
          margin-bottom: 1.5rem;
        }

        .loading-state {
          text-align: center;
          padding: 2rem;
          color: #888;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #333;
          border-top-color: #d4af37;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="pricing-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>🎵 {formatJobType(jobType)} Service</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step ${step === "pricing" ? "active" : "completed"}`}>
              <div className="step-number">1</div>
              <span>Pricing</span>
            </div>
            <div className={`step ${step === "contract" ? "active" : step === "complete" ? "completed" : ""}`}>
              <div className="step-number">2</div>
              <span>Contract</span>
            </div>
            <div className={`step ${step === "complete" ? "active" : ""}`}>
              <div className="step-number">3</div>
              <span>Complete</span>
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Loading */}
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          )}

          {/* Step 1: Pricing */}
          {!loading && step === "pricing" && pricing && (
            <>
              <div className="pricing-breakdown">
                <div className="pricing-row">
                  <span className="pricing-label">Service Type</span>
                  <span className="pricing-value">{formatJobType(pricing.jobType)}</span>
                </div>
                <div className="pricing-row">
                  <span className="pricing-label">Base Price</span>
                  <span className="pricing-value highlight">{pricing.basePriceFormatted}</span>
                </div>
                <div className="pricing-row">
                  <span className="pricing-label">Platform Fee ({pricing.platformFeePercent}%)</span>
                  <span className="pricing-value">{pricing.platformFeeFormatted}</span>
                </div>
                <div className="pricing-row">
                  <span className="pricing-label">Engineer Payout ({pricing.engineerSharePercent}%)</span>
                  <span className="pricing-value">{pricing.engineerAmountFormatted}</span>
                </div>
                <div className="pricing-row total">
                  <span className="pricing-label">Total</span>
                  <span className="pricing-value highlight">{pricing.basePriceFormatted}</span>
                </div>
              </div>

              <p style={{ fontSize: "0.875rem", color: "#888" }}>
                By proceeding, you agree to pay the total amount shown above. 
                An engineer will be assigned to your project after you sign the contract.
              </p>
            </>
          )}

          {/* Step 2: Contract */}
          {!loading && step === "contract" && contract && (
            <>
              <p style={{ fontSize: "0.875rem", color: "#888", marginBottom: "1rem" }}>
                Please review the contract below and agree to the terms to continue.
              </p>

              <div className="contract-text">
                {contractText || contract.termsSummary || "Loading contract text..."}
              </div>

              <div className="agreement-checkbox">
                <input 
                  type="checkbox" 
                  id="agree" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <label htmlFor="agree">
                  I have read and agree to the terms and conditions of this Studio Services Agreement. 
                  I understand that payment will be processed upon completion of the work.
                </label>
              </div>
            </>
          )}

          {/* Step 3: Complete */}
          {!loading && step === "complete" && (
            <div className="success-state">
              <div className="success-icon">✅</div>
              <div className="success-title">Service Booked!</div>
              <div className="success-message">
                Your {formatJobType(jobType)} job has been created and the contract is active.
                An engineer will be assigned shortly.
              </div>
              <p style={{ fontSize: "0.875rem", color: "#666" }}>
                Contract: {contract?.contractNumber}<br />
                Job ID: {job?.id}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {step === "pricing" && (
            <>
              <button className="btn secondary" onClick={onClose}>
                Cancel
              </button>
              <button 
                className="btn primary" 
                onClick={handleProceed}
                disabled={loading}
              >
                Proceed to Contract
              </button>
            </>
          )}

          {step === "contract" && (
            <>
              <button className="btn secondary" onClick={() => setStep("pricing")}>
                Back
              </button>
              <button 
                className="btn primary" 
                onClick={handleSign}
                disabled={loading || !agreed}
              >
                Sign & Confirm
              </button>
            </>
          )}

          {step === "complete" && (
            <button className="btn primary" onClick={onClose}>
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}




