import { Router } from 'express';
import { BudgetController } from '../controllers/budgetController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All routes are protected
router.use(authenticateToken);

// Budget CRUD
router.post('/', BudgetController.createBudget);
router.get('/', BudgetController.getAllBudgets);
router.get('/alerts', BudgetController.getBudgetAlerts);
router.get('/:month', BudgetController.getBudgetByMonth);
router.get('/:month/spending', BudgetController.getBudgetSpending);
router.get('/:month/summary', BudgetController.getBudgetSummary);
router.delete('/:month', BudgetController.deleteBudget);

// Budget allocation update
router.put('/allocations/:allocationId', BudgetController.updateBudgetAllocation);

export default router;
