import { Router } from 'express';
import { AccountController } from '../controllers/accountController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// All routes are protected
router.use(authenticateToken);

// Linked Accounts CRUD
router.post('/', AccountController.linkAccount);
router.get('/', AccountController.getLinkedAccounts);
router.get('/summary', AccountController.getAccountSummary);
router.get('/:id', AccountController.getAccountById);
router.put('/:id', AccountController.updateAccount);
router.delete('/:id', AccountController.deleteAccount);

// Account Sync
router.post('/:id/sync', AccountController.syncAccount);
router.get('/sync/logs', AccountController.getSyncLogs);

// SMS Parser
router.post('/sms/parse', AccountController.parseSMS);
router.get('/sms/unprocessed', AccountController.getUnprocessedSMS);

export default router;
