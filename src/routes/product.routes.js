const express = require('express');
const { getAllProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const { upload } = require('../config/cloudinary');
const router = express.Router();

router.get('/', getAllProducts);
// En un entorno de produccion se debe añadir un middleware de JWT para proteger estas rutas
router.post('/', upload.single('image'), createProduct);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
