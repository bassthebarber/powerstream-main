// frontend/src/components/monetization/RequestWithdrawal.jsx
// Request withdrawal component per Overlord Spec
import React, { useState } from "react";
import api from "../../lib/api";
import { useCoins } from "../../context/CoinContext.jsx";
import { Button, Modal } from "../common";
import "./monetization.css";

const WITHDRAWAL_METHODS = [
  { id: "paypal", name: "PayPal", icon: "💳" },
  { id: "bank", name: "Bank Transfer", icon: "🏦" },
  { id: "cashapp", name: "Cash App", icon: "💵" },
];

const MIN_WITHDRAWAL = 100;
const CONVERSION_RATE = 0.01; // $0.01 per coin

export default function RequestWithdrawal({ onSuccess }) {
  const { balance, refreshBalance } = useCoins();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(MIN_WITHDRAWAL);
  const [method, setMethod] = useState("paypal");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (amount < MIN_WITHDRAWAL) {
      setError(`Minimum withdrawal is ${MIN_WITHDRAWAL} coins`);
      return;
    }

    if (amount > balance) {
      setError("Insufficient balance");
      return;
    }

    if (!details.trim()) {
      setError("Please enter your payment details");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/monetization/payouts/request", {
        amount,
        method,
        details: { account: details },
      });

      if (response.data.success) {
        setIsOpen(false);
        setAmount(MIN_WITHDRAWAL);
        setDetails("");
        refreshBalance();
        onSuccess?.(response.data.data);
        alert("Withdrawal request submitted! We'll process it within 3-5 business days.");
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const estimatedUSD = (amount * CONVERSION_RATE).toFixed(2);

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        Cash Out
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Request Withdrawal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={loading}
              disabled={amount < MIN_WITHDRAWAL || amount > balance}
            >
              Submit Request
            </Button>
          </>
        }
      >
        <div className="ps-withdrawal">
          <div className="ps-withdrawal-balance">
            Available: <strong>{balance.toLocaleString()}</strong> coins
          </div>

          <div className="ps-withdrawal-amount">
            <label>Amount to withdraw:</label>
            <input
              type="number"
              min={MIN_WITHDRAWAL}
              max={balance}
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              className="ps-withdrawal-input"
            />
            <span className="ps-withdrawal-usd">≈ ${estimatedUSD} USD</span>
          </div>

          <div className="ps-withdrawal-method">
            <label>Payment method:</label>
            <div className="ps-withdrawal-methods">
              {WITHDRAWAL_METHODS.map((m) => (
                <button
                  key={m.id}
                  className={`ps-withdrawal-method-btn ${
                    method === m.id ? "ps-withdrawal-method-btn--active" : ""
                  }`}
                  onClick={() => setMethod(m.id)}
                >
                  <span>{m.icon}</span>
                  <span>{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="ps-withdrawal-details">
            <label>
              {method === "paypal" && "PayPal Email:"}
              {method === "bank" && "Bank Account Details:"}
              {method === "cashapp" && "Cash App $Cashtag:"}
            </label>
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={
                method === "paypal"
                  ? "your@email.com"
                  : method === "cashapp"
                  ? "$yourcashtag"
                  : "Account number, routing, etc."
              }
              className="ps-withdrawal-input"
            />
          </div>

          {error && <div className="ps-withdrawal-error">{error}</div>}

          <div className="ps-withdrawal-info">
            <p>
              Minimum withdrawal: {MIN_WITHDRAWAL} coins. Processing time: 3-5
              business days. A 5% fee may apply.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}



