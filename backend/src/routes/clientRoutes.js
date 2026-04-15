const express = require('express');
const clientController = require('../controllers/clientController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, clientController.listClients);
router.get('/:id', authMiddleware, clientController.getClientById);
router.post('/', authMiddleware, clientController.createClient);
router.put('/:id', authMiddleware, clientController.updateClient);
router.delete('/:id', authMiddleware, clientController.deleteClient);

module.exports = router;
