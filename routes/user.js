var express = require('express');
const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');
const userHelpers = require('../helpers/user-helpers');
const { searchProduct } = require('../helpers/product-helpers');
var router = express.Router();


// Checking Whether the user is loggedIn
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})



router.get('/', userController.homePage);
router.get('/login',userController.userLoginGet); 
router.post('/login',userController.userLoginPost);
router.get('/logout',userController.logOutGet)
router.get('/signup', userController.userSignupGet);
router.post('/signup',userController.userSignupPost);
router.get('/otp',userController.otpPageGet);
router.post('/get-otp',userController.getOtpPost);
router.post('/submit-otp',userController.submitOtpPost);


router.get('/product-view/:id',userController.productViewGetId);
router.get('/all-product',verifyLogin,userController.allProductGet);
router.get('/show-category/:id',userController.showCategoryIdGet);
router.get('/view-cart',verifyLogin,userController.viewCartGet);
router.get('/add-to-cart/:id',verifyLogin,userController.addToCartGet);
router.post('/change-product-quantity',verifyLogin,userController.changeProductQuantityPost);
router.get('/place-order',verifyLogin,userController.placeOrderGet);
router.post('/place-order',verifyLogin,userController.placeOrderPost);
router.get('/myorder',verifyLogin,userController.myOrderGet);
router.post('/verify-payment',userController.verifyPaymentPost);
router.get('/cancel-Order/:id',verifyLogin,userController.cancelOrderIdGet);
router.get('/order-return/:id',verifyLogin,userController.reterunOrderIdGet);
router.get('/removefromcart/:id',userController.removeFromCartGet);
router.get('/payment-success',verifyLogin,userController.paymentSuccesGet);
router.get('/ordered-products/:id',verifyLogin,userController.orderedproductGet);
router.get('/address',userController.addressGet);
router.post('/address',userController.addressPost);
router.get('/profile',verifyLogin,userController.profileGet);
router.post('/change-password',verifyLogin,userController.changePasswordPost);
router.post('/useraddress',userController.userAddressPost);
router.post('/edit-profile/:id',userController.editProfilePost);
router.post('/edit-user-address/:id',userController.editUserAddressPost);

router.delete('/deleteAdress',userController.DeleteAdressGet);

router.post('/coupon-apply',userController.postApplyCoupon);

router.get('/searchProduct',userController.searchProductGet);
router.post('/searchProduct',userController.searchProductPost);

router.get('/wish-list',verifyLogin,userController.wishListGet);
router.get('/add-to-wishlist/:id',verifyLogin,userController.addToWishListGet);
router.get('/wishlist_removeproduct/:id',verifyLogin,userController.WishListRemoveGet)

router.get('/SomethingWentwrong',userController.SomethingsWrong)

router.get('/walletHistory', userController.viewWalletHistory);

module.exports = router;


