import Router from 'express'
import { addAlllProducts, createProduct, deleteProduct, getAllProducts, getSingleProduct, updateProduct } from '../controllers/product.controller.js'
import { upload } from '../middleware/multer.middleware.js'

const router = Router()

router.route('/add-data').post(addAlllProducts)
router.route('/get-all-products').get(getAllProducts)
router.route('/:id').get(getSingleProduct)
router.route('/create-product').post(upload.fields([
    { name: "Image", maxCount: 1 },
    { name: "Image1", maxCount: 1 },
    { name: "Image2", maxCount: 1 },
    { name: "Image3", maxCount: 1 },
]), createProduct)

router.route("/update-product/:product_id").put(upload.fields([
    { name: "Image", maxCount: 1 },
    { name: "Image1", maxCount: 1 },
    { name: "Image2", maxCount: 1 },
    { name: "Image3", maxCount: 1 },
]), updateProduct)

router.route("/delete-product/:id").delete(deleteProduct)

// router.route("/create2").post(upload.fields([
//     { name: "Image", maxCount: 1 },
//     { name: "Image1", maxCount: 1 },
//     { name: "Image2", maxCount: 1 },
//     { name: "Image3", maxCount: 1 },
// ]),createProductFromExcel)
export default router