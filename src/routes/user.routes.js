const express = require('express');
const { getAllUsers, deleteUser, createUser, updateUser } = require('../controllers/user.controller');
const router = express.Router();

// En producción se debe usar middleware de protección JWT aquí
router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
