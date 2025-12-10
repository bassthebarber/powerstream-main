// backend/config/applePay.js
export const merchantId = process.env.APPLE_PAY_MERCHANT_ID;
export const domainName = process.env.APPLE_PAY_DOMAIN;
export const displayName = 'PowerStream Platform';

export default {
  merchantId,
  domainName,
  displayName,
};
