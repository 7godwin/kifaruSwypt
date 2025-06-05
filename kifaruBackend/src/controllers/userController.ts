

import mssql from 'mssql';
import { sqlConfig } from '../config/sqlConfig';
import { Request, Response } from "express";
import { v4 } from 'uuid';
import bcrypt from 'bcrypt'


//...............signUp user.......................
export const signupUser = async (req: Request, res: Response) => {
    try {

        const { merchantUserName, merchantEmail, password } = req.body;
        const id = v4();
        const hashPwd = await bcrypt.hash(password, 10);
        // let {error} = registerUserValidator.validate(req.body) 
        // if(error){
        //     return res.status(404).json({
        //         error: error.details[0].message
        //     })
        // }

        if (!password) {
            return res.status(400).json({
                error: "Password is required"
            });
        }
        const emailExists = await checkIfEmailExists(merchantEmail);
        if (emailExists) {
            return res.status(400).json({
                error: 'Email is already registered',
            });
        }

        const query = `
      INSERT INTO merchants (merchant_id, merchantUserName, merchantEmail, password)
      VALUES ($1, $2, $3, $4)
    `;
    const values = [id, merchantUserName, merchantEmail, hashPwd];

    const result = await sqlConfig.query(query, values);

    if ((result.rowCount ?? 0) > 0) {
        return res.json({
            message: "Account created successfully",
        });
    } else {
        return res.json({ error: "An error occurred while creating the account." });
        }
    } catch (error) {
        console.error("Error creating user:", error);
        return res.json({ error: " The user account was not created." });
    }

    async function checkIfEmailExists(merchantEmail: string): Promise<boolean> {
        const query = 'SELECT COUNT(*) FROM merchants WHERE merchantEmail = $1';
        const values = [merchantEmail];
        const result = await sqlConfig.query(query, values);
        return (result.rows[0].count) > 0;
}

};

// ..................createProduct............................

export const AddProduct = async (req: Request, res: Response) => {
  try {
    const { name,merchant_id,description,imageUrl,price ,category,quantity,walletAddressed } = req.body;
    const id = v4();

    const data = await sqlConfig.query(
      `INSERT INTO Products (id, merchant_id, imageUrl, name, description, category, quantity, price,walletAddressed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, merchant_id, imageUrl, name, description, category, quantity, price,walletAddressed]
    );

    return res.status(200).json({ message:'Product created successfully', rowsAffected: data.rowCount });
  } catch (error) {
    console.error('Error creating Product:', error);
    return res.status(500).json({ error: 'An error occurred while creating the product.' });
  }
};

//...............get Products...........................
export const getProducts = async (req: Request, res: Response) => {
    try {
       const pool = await sqlConfig.connect();
        if (!pool) {
            return res.status(500).json({
                error: "Database connection failed"
            });
        }
        const message = await pool.query('SELECT * FROM Products');
       return res.json({
            message: message.rows
        });
    } catch (error) {
            console.error("error can't get from the Table Product");
            res.status(500).send('Server Error');
        }
};

//...............update Product by id...........................
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, imageUrl, price, category, quantity } = req.body;

        const pool = await sqlConfig.connect();
        if (!pool) {
            return res.status(500).json({
                error: "Database connection failed"
            });
        }

        const message = await pool.query(
            `UPDATE Products SET name = $1, description = $2, imageUrl = $3, price = $4, category = $5, quantity = $6 WHERE id = $7`,
            [name, description, imageUrl, price, category, quantity, id]
        );

        if (message.rowCount ?? 0 > 0) {
            return res.json({
                message: "Product updated successfully"
            });
        } else {
            return res.status(404).json({
                error: "Product not found"
            });
        }
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ error: "An error occurred while updating the product." });
    }
};

//...............delete Product by id...........................
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pool = await sqlConfig.connect();
        if (!pool) {
            return res.status(500).json({
                error: "Database connection failed"
            });
        }
        const message = await pool.query('DELETE FROM Products WHERE id = $1', [id]);
        if (message.rowCount ?? 0 > 0) {
            return res.json({
                message: "Product deleted successfully"
            });
        } else {
            return res.status(404).json({
                error: "Product not found"
            });
        }
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ error: "An error occurred while deleting the product." });
    }
};


// export const savewallet = async (req: Request, res: Response) => {
//   try {
//     const { merchant_id, wallet_address } = req.body;
//     const id = v4();

//     // Validate required fields
//     if (!merchant_id || !wallet_address) {
//       return res.status(400).json({ message: "merchant_id and wallet_address are required." });
//     }

//     // Insert into the wallets table
//     const query = `
//       INSERT INTO wallets (id, merchant_id, wallet_address)
//       VALUES ($1, $2, $3)
//       RETURNING *;
//     `;

//     const values = [id, merchant_id, wallet_address];
//     const result = await sqlConfig.query(query, values);

//     return res.status(201).json({
//       message: "Wallet saved successfully.",
//       data: result.rows[0],
//     });

//   } catch (error) {
//     console.error("Error saving wallet:", error);
//     return res.status(500).json({ message: "Internal server error." });
//   }
// };

export const savewallet = async (req: Request, res: Response) => {
  try {
    const { merchant_id, wallet_address } = req.body;
    const id = v4();

    if (!merchant_id || !wallet_address) {
      return res.status(400).json({ message: "merchant_id and wallet_address are required." });
    }

    const insertQuery = `
      INSERT INTO wallets (id, merchant_id, wallet_address)
      VALUES ($1, $2, $3)
      ON CONFLICT (wallet_address) DO NOTHING
      RETURNING *;
    `;
    const values = [id, merchant_id, wallet_address];
    const result = await sqlConfig.query(insertQuery, values);

    if (result.rowCount === 0) {
      return res.status(409).json({ message: "Wallet address already exists." });
    }

    return res.status(201).json({
      message: "Wallet saved successfully.",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("Error saving wallet:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


export const getWalletById = async (req: Request, res: Response) => {
  const { id } = req.params;

  console.log("merchant_id param:", id);

  try {
    const result = await sqlConfig.query(
      "SELECT wallet_address FROM wallets WHERE merchant_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    return res.status(200).json({
      wallet_address: result.rows[0].wallet_address
    });

  } catch (error) {
    console.error("Error fetching wallet:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


