/* === POWERSTREAM GOLD BUTTONS (FINAL STYLE) === */
.button-gold {
  background: linear-gradient(180deg, #FFD24A 0%, #E6B800 100%);
  border-radius: 18px;
  color: #000 !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 22px;
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: 0.5px;
  text-decoration: none;
  text-transform: none;
  transition: transform 0.12s ease, filter 0.25s ease;
}

.button-gold:hover {
  filter: brightness(1.08);
  transform: translateY(-2px);
}

.button-gold:active {
  transform: translateY(1px);
}

.button-gold .label {
  color: #111 !important;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.45);
}

.button-gold .icon {
  margin-right: 10px;
  filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.3));
}

/* Prevent any low-opacity fading */
.button-gold.disabled {
  opacity: 1 !important;
  pointer-events: auto !important;
}
