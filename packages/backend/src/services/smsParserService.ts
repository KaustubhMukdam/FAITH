import pool from '../config/database';

interface ParsedSMSData {
  amount?: number;
  type?: 'DEBIT' | 'CREDIT';
  merchant?: string;
  category?: string;
  accountNumberHint?: string;
  confidenceScore: number;
}

export class SMSParserService {
  // Common bank sender patterns
  private static BANK_SENDERS = [
    'HDFCBK', 'ICICIBK', 'SBIIN', 'AXISBK', 'KOTAKBK', 
    'PNBSMS', 'BOIIND', 'UNIBKS', 'IDFCFB', 'YESBNK'
  ];

  // Transaction keywords
  private static DEBIT_KEYWORDS = ['debited', 'withdrawn', 'spent', 'paid', 'purchase', 'debit'];
  private static CREDIT_KEYWORDS = ['credited', 'received', 'deposited', 'refund', 'credit'];

  static async parseSMS(userId: string, smsData: { message: string; sender: string; timestamp: Date }) {
    const { message, sender, timestamp } = smsData;

    // Check if sender is a known bank
    const isBankSMS = this.BANK_SENDERS.some(bank => sender.toUpperCase().includes(bank));
    
    if (!isBankSMS) {
      return null; // Not a bank SMS
    }

    // Parse SMS content
    const parsed = this.extractTransactionInfo(message);

    if (!parsed.amount) {
      return null; // No amount found, not a transaction SMS
    }

    // Store in sms_transactions table
    const query = `
      INSERT INTO sms_transactions (
        user_id, raw_sms, sender, received_at,
        parsed_amount, parsed_type, parsed_merchant, parsed_category,
        account_number_hint, confidence_score, is_processed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false)
      RETURNING *
    `;

    const values = [
      userId,
      message,
      sender,
      timestamp,
      parsed.amount,
      parsed.type,
      parsed.merchant,
      parsed.category,
      parsed.accountNumberHint,
      parsed.confidenceScore,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  private static extractTransactionInfo(message: string): ParsedSMSData {
    const msg = message.toLowerCase();
    let confidenceScore = 0.5;

    // Extract amount
    const amountMatch = msg.match(/(?:rs\.?|inr|₹)\s*([0-9,]+(?:\.[0-9]{2})?)/i) ||
                       msg.match(/([0-9,]+(?:\.[0-9]{2})?)\s*(?:rs\.?|inr|₹)/i);
    
    const amount = amountMatch 
      ? parseFloat(amountMatch[1].replace(/,/g, ''))
      : undefined;

    if (amount) confidenceScore += 0.3;

    // Determine type (DEBIT/CREDIT)
    let type: 'DEBIT' | 'CREDIT' | undefined;
    
    if (this.DEBIT_KEYWORDS.some(kw => msg.includes(kw))) {
      type = 'DEBIT';
      confidenceScore += 0.2;
    } else if (this.CREDIT_KEYWORDS.some(kw => msg.includes(kw))) {
      type = 'CREDIT';
      confidenceScore += 0.2;
    }

    // Extract merchant/description
    const merchantMatch = msg.match(/(?:at|to|from)\s+([a-z0-9\s]+?)(?:\s+on|\s+a\/c|\s+xx|\s+ref|\.|\,|$)/i);
    const merchant = merchantMatch ? merchantMatch[1].trim() : undefined;

    if (merchant) confidenceScore += 0.1;

    // Extract account number hint (last 4 digits)
    const accountMatch = msg.match(/(?:a\/c|ac|account|card)[\s\*]*(?:xx)?(\d{4})/i);
    const accountNumberHint = accountMatch ? accountMatch[1] : undefined;

    // Basic category inference
    const category = this.inferCategory(merchant || '');

    return {
      amount,
      type,
      merchant,
      category,
      accountNumberHint,
      confidenceScore: Math.min(confidenceScore, 1.0),
    };
  }

  private static inferCategory(merchant: string): string | undefined {
    const m = merchant.toLowerCase();

    if (/swiggy|zomato|restaurant|food|cafe|pizza|burger/i.test(m)) return 'FOOD';
    if (/uber|ola|rapido|metro|bus|petrol|fuel/i.test(m)) return 'TRANSPORTATION';
    if (/amazon|flipkart|myntra|ajio|shop|store/i.test(m)) return 'SHOPPING';
    if (/netflix|prime|hotstar|spotify|movie|pvr|inox/i.test(m)) return 'ENTERTAINMENT';
    if (/bigbasket|dmart|grocery|vegetables/i.test(m)) return 'GROCERIES';
    if (/electricity|water|gas|bill|recharge/i.test(m)) return 'BILLS';
    if (/hospital|clinic|pharmacy|medicine|doctor/i.test(m)) return 'HEALTHCARE';
    
    return undefined;
  }

  static async getUnprocessedSMS(userId: string) {
    const query = `
      SELECT * FROM sms_transactions
      WHERE user_id = $1 AND is_processed = false
      ORDER BY received_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async processToTransaction(smsTransactionId: string, transactionId: string) {
    const query = `
      UPDATE sms_transactions
      SET is_processed = true, transaction_id = $2
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [smsTransactionId, transactionId]);
    return result.rows[0];
  }
}
