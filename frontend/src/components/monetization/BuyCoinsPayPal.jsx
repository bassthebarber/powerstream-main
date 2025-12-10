// frontend/src/components/monetization/BuyCoinsPayPal.jsx
// Buy coins with PayPal component per Overlord Spec
import React, { useState } from "react";
import { useCoins } from "../../context/CoinContext.jsx";
import { Button, Modal } from "../common";
import "./monetization.css";

// Coin packages
const COIN_PACKAGES = [
  { id: "pack1", coins: 100, price: 0.99, bonus: 0 },
  { id: "pack2", coins: 500, price: 4.49, bonus: 50, popular: true },
  { id: "pack3", coins: 1000, price: 7.99, bonus: 150 },
  { id: "pack4", coins: 2500, price: 17.99, bonus: 500 },
  { id: "pack5", coins: 5000, price: 29.99, bonus: 1500 },
];

export default function BuyCoinsPayPal({ onSuccess }) {
  const { purchaseCoins, loading } = useCoins();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setProcessing(true);
    setError(null);

    try {
      // In production, this would integrate with PayPal SDK
      // For now, simulate a purchase
      const result = await purchaseCoins(
        selectedPackage.coins + selectedPackage.bonus,
        "paypal",
        "simulated_token"
      );

      if (result.success) {
        setIsOpen(false);
        setSelectedPackage(null);
        onSuccess?.(result.data);
        alert(`Successfully purchased ${result.data.coinsReceived} coins!`);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Purchase failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Button variant="primary" onClick={() => setIsOpen(true)}>
        Buy Coins
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Buy Coins"
        size="large"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePurchase}
              loading={processing || loading}
              disabled={!selectedPackage}
            >
              Purchase with PayPal
            </Button>
          </>
        }
      >
        <div className="ps-buy-coins">
          <div className="ps-buy-packages">
            {COIN_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`ps-buy-package ${
                  selectedPackage?.id === pkg.id ? "ps-buy-package--selected" : ""
                } ${pkg.popular ? "ps-buy-package--popular" : ""}`}
                onClick={() => setSelectedPackage(pkg)}
              >
                {pkg.popular && <span className="ps-buy-badge">Popular</span>}
                <div className="ps-buy-coins-amount">
                  🪙 {pkg.coins.toLocaleString()}
                  {pkg.bonus > 0 && (
                    <span className="ps-buy-bonus">+{pkg.bonus} bonus</span>
                  )}
                </div>
                <div className="ps-buy-price">${pkg.price.toFixed(2)}</div>
                <div className="ps-buy-rate">
                  ${((pkg.price / (pkg.coins + pkg.bonus)) * 100).toFixed(1)} per 100
                </div>
              </div>
            ))}
          </div>

          {error && <div className="ps-buy-error">{error}</div>}

          <div className="ps-buy-info">
            <p>
              Secure payment processed by PayPal. Coins are added instantly to
              your account after purchase.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}



