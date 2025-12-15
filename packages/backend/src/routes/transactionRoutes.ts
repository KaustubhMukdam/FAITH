import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All routes are protected
router.use(authenticateToken);

// IMPORTANT: Specific routes must come BEFORE parameterized routes
router.get('/summary', TransactionController.getTransactionSummary);
router.get('/categories', TransactionController.getCategories);

// Transaction CRUD
router.post('/', TransactionController.createTransaction);
router.get('/', TransactionController.getTransactions);
router.get('/:id', TransactionController.getTransactionById);
router.put('/:id', TransactionController.updateTransaction);
router.delete('/:id', TransactionController.deleteTransaction);

export default router;
