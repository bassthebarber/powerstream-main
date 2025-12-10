// frontend/src/components/monetization/SendCoins.jsx
// Send coins (tip) component per Overlord Spec
import React, { useState } from "react";
import { useCoins } from "../../context/CoinContext.jsx";
import { Button, Modal } from "../common";
import "./monetization.css";

export default function SendCoins({
  recipientId,
  recipientName,
  onSuccess,
  trigger, // Optional custom trigger element
}) {
  const { balance, sendCoins, loading } = useCoins();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(10);
  const [memo, setMemo] = useState("");
  const [error, setError] = useState(null);

  const presetAmounts = [5, 10, 25, 50, 100];

  const handleSend = async () => {
    if (amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (amount > balance) {
      setError("Insufficient balance");
      return;
    }

    const result = await sendCoins(recipientId, amount, memo);

    if (result.success) {
      setIsOpen(false);
      setAmount(10);
      setMemo("");
      setError(null);
      onSuccess?.(result.data);
    } else {
      setError(result.message);
    }
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <Button
          variant="primary"
          size="small"
          onClick={() => setIsOpen(true)}
        >
          🪙 Tip
        </Button>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Send Coins to ${recipientName}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSend}
              loading={loading}
              disabled={amount <= 0 || amount > balance}
            >
              Send {amount} 🪙
            </Button>
          </>
        }
      >
        <div className="ps-send-coins">
          <div className="ps-send-balance">
            Your balance: <strong>{balance.toLocaleString()}</strong> coins
          </div>

          <div className="ps-send-presets">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                className={`ps-send-preset ${amount === preset ? "ps-send-preset--active" : ""}`}
                onClick={() => setAmount(preset)}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="ps-send-custom">
            <label>Custom amount:</label>
            <input
              type="number"
              min="1"
              max={balance}
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              className="ps-send-input"
            />
          </div>

          <div className="ps-send-memo">
            <label>Message (optional):</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Say something nice..."
              className="ps-send-input"
              maxLength={100}
            />
          </div>

          {error && <div className="ps-send-error">{error}</div>}
        </div>
      </Modal>
    </>
  );
}



