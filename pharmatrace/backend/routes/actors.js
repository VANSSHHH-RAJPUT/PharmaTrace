const express = require('express');
const actorController = require('../controllers/actorController');
const router = express.Router();

router.post('/', actorController.createActor);
router.get('/:wallet', actorController.getActor);

module.exports = router;