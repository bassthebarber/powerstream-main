// utils/EncryptionUtils.js
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPT_KEY || "DefaultSecretKey";

export const encryptData = (data) => {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  } catch (err) {
    console.error("Encryption error:", err);
    return null;
  }
};

export const decryptData = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (err) {
    console.error("Decryption error:", err);
    return null;
  }
};
