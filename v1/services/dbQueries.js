const getUserDetailsQuery = `SELECT * FROM users WHERE deleted_at IS NULL AND (email = ? OR phone = ?) `;
const serchUserByEmailQuery = `SELECT *  FROM users WHERE email = ? OR phone = ? AND deleted_at IS NULL `;

// const addServiceIndbQuery = `INSERT INTO users (name, email, password,  phone, dob, role, address, kyc_verified , status ,created_at)
// VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) `;

const addServiceIndbQuery = `
            INSERT INTO users (name, email, password, phone, dob, role, address, kyc_verified,refer_code, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,? , CURRENT_TIMESTAMP) `;

const serchMerchantByEmailQuery = ` SELECT * FROM merchants WHERE email = ? OR Phone = ? AND deleted_at IS NULL ; `;

const addMerchantIndbQuery = `INSERT INTO merchants (
  name, email, password, phone, dob, address, business_name, business_type, gst_number, 
  business_address, business_phone, kyc_document, bank_account_number, 
  bank_ifsc, pan_number, role, operating_hours ,created_at
) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP);
`;

//admin Query

const serchAdminByEmailQuery = ` SELECT * FROM admins WHERE email = ? OR phone_number = ? AND deleted_at IS NULL ; `;

const addAdminIndbQuery = `
      INSERT INTO admins (full_name, username, email, password, phone_number, dob, address, company_name, verification_code, role, terms_accepted, status , created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,CURRENT_TIMESTAMP)
    `;


// wallet query's 
const userWalleteCreate = ` INSERT INTO users_wallets (user_id , balance , created_at )  VALUES ( ? , 0 , CURRENT_TIMESTAMP)`
const updateWalletBalanceQuery = `UPDATE users_wallets SET balance = balance + ? WHERE user_id = ?`;
const updateWalletTransTypeQuery =  `UPDATE wallet_transactions SET status = 'success' WHERE transaction_id = ?`;
const  AddWalletTransQuery =  `INSERT INTO wallet_transactions (user_id, transaction_id, type, amount, status) VALUES (?, ?, ?, ?, ?)`;
const getTransDetailsQuery = ` SELECT * FROM wallet_transactions WHERE transaction_id = ?`
const getUserBalanceQuery =`SELECT balance FROM users_wallets WHERE user_id = ?`
const getUserTransHistoryQuery = `SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC`
const deductResultIndbQuery =   `UPDATE users_wallets SET balance = balance - ? WHERE user_id = ? AND balance >= ?`
const addAmountResultIndbQuery = `UPDATE users_wallets SET balance = balance + ? WHERE user_id = ?`
const searchUserByphoneQuery = `SELECT *  FROM users WHERE phone = ? AND deleted_at IS NULL `
const senderWalletTrnResultQuery = `INSERT INTO wallet_transactions (user_id, transaction_id, type, amount, status, created_at) VALUES (?, ?, 'debit', ?, 'success', CURRENT_TIMESTAMP)`
const receiverWalletTrnResultQuery = `INSERT INTO wallet_transactions (user_id, transaction_id, type, amount, status, created_at) VALUES (?, ?, 'credit', ?, 'success', CURRENT_TIMESTAMP)`




module.exports = {
  getUserDetailsQuery,
  serchUserByEmailQuery,
  addServiceIndbQuery,
  addMerchantIndbQuery,
  serchMerchantByEmailQuery,
  serchAdminByEmailQuery,
  addAdminIndbQuery,
  updateWalletBalanceQuery , 
  updateWalletTransTypeQuery ,
  AddWalletTransQuery ,
  getTransDetailsQuery ,
  getUserBalanceQuery ,
  getUserTransHistoryQuery ,
  userWalleteCreate ,
  deductResultIndbQuery ,
  addAmountResultIndbQuery ,
  searchUserByphoneQuery ,
  senderWalletTrnResultQuery ,
  receiverWalletTrnResultQuery
  
};





// const express = require('express');
// const router = express.Router();
// const db = require('./db'); // Assume a DB connection utility is available

// router.post('/wallet/transfer', async (req, res) => {
//   const { sender_id, receiver_id, amount } = req.body;

//   if (!sender_id || !receiver_id || !amount) {
//     return res.status(400).json({ error: 'Sender, receiver, and amount are required.' });
//   }

//   const connection = await db.getConnection();
//   try {
//     // Start transaction
//     await connection.beginTransaction();

//     // Deduct amount from sender's wallet
//     const [deductResult] = await connection.execute(
//       `UPDATE users_wallets SET balance = balance - ? WHERE user_id = ? AND balance >= ?`,
//       [amount, sender_id, amount]
//     );
//     if (deductResult.affectedRows === 0) {
//       throw new Error('Insufficient funds or invalid sender.');
//     }

//     // Add amount to receiver's wallet
//     const [addResult] = await connection.execute(
//       `UPDATE users_wallets SET balance = balance + ? WHERE user_id = ?`,
//       [amount, receiver_id]
//     );
//     if (addResult.affectedRows === 0) {
//       throw new Error('Invalid receiver.');
//     }

//     // Log transaction for sender
//     const transactionId = `TXN-${Date.now()}`; // Unique transaction ID
//     await connection.execute(
//       `INSERT INTO wallet_transactions (user_id, transaction_id, type, amount, status, created_at) VALUES (?, ?, 'debit', ?, 'success', CURRENT_TIMESTAMP)`,
//       [sender_id, transactionId, amount]
//     );

//     // Log transaction for receiver
//     await connection.execute(
//       `INSERT INTO wallet_transactions (user_id, transaction_id, type, amount, status, created_at) VALUES (?, ?, 'credit', ?, 'success', CURRENT_TIMESTAMP)`,
//       [receiver_id, transactionId, amount]
//     );

//     // Commit transaction
//     await connection.commit();

//     res.json({ message: 'Transfer successful.', transactionId });
//   } catch (error) {
//     // Rollback transaction on error
//     await connection.rollback();
//     res.status(500).json({ error: error.message });
//   } finally {
//     connection.release();
//   }
// });

// module.exports = router;
