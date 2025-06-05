
import {Router} from "express";
import {  AddProduct, deleteProduct, getProducts, getWalletById, savewallet, signupUser, updateProduct} from "../controllers/userController";
import { loginUser } from "../auth/authLogin";


const router = Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
	Promise.resolve(fn(req, res, next)).catch(next);
};

//signup merchants
router.post('/signup', asyncHandler(signupUser));
router.post('/auth/login', asyncHandler(loginUser));
router.post('/AddProduct', asyncHandler(AddProduct));
router.get('/getProducts', asyncHandler(getProducts));
router.put('/updateProduct/:id', asyncHandler(updateProduct));
router.delete('/deleteProduct/:id', asyncHandler(deleteProduct));
router.post('/saveWallet',asyncHandler(savewallet))
router.get('/getWallet/:id', asyncHandler(getWalletById));

export default router;

