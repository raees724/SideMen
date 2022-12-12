var express = require('express');
var router = express.Router();
const adminController = require('../controllers/adminController');
const orderHelpers = require('../helpers/order-helpers');


///////////////////////////////// Login Credentials ////////////////////////
// const credentials = {
//   email: "admin@gmail.com",
//   password: "admin"
// }


//////////////////////////////// Check Admin Logged In //////////////////////////////////
const verifyLogin1 = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next()
  } else {
    res.redirect('/admin')

  }

}


router.get('/', adminController.mainPageGet);
router.get('/admin-login', adminController.adminLoginGet);
router.post('/adminlogin',adminController.adminLoginPost);
router.get('/admin-dashboard',verifyLogin1, adminController.adminDashboardGet);
router.get('/admin-dashboard/day', adminController.adminDashboardGetday);
router.post('/admin-dashboard/graphdata', adminController.adminDashboardPostDataGrapgh);

router.get('/list-product',verifyLogin1, adminController.listProductGet);
router.get('/list-user',adminController.listUserGet);
router.get('/list-category', adminController.listCategoryGet);
router.get('/list-order',verifyLogin1, adminController.listOrderGet);
router.get('/add-category', adminController.addCategoryGet);
router.post('/add-category', adminController.addCategoryPost);
router.get('/add-product', adminController.addProductGet);
router.post('/add-product', adminController.addProductPost);

router.get('/delete-product/:id', adminController.deleteProductIdGet);
router.get('/delete-category/:id', adminController.deleteCategoryIdGet);
router.get('/changestatus', adminController.changeStatusGet);
router.post('/change-status', adminController.changeStatusPost)
router.get('/edit-category/:id', adminController.editCategoryGet);
router.post('/edit-category/:id', adminController.editCategoryPost);
router.get('/edit-product/:id', adminController.editProductGet);
router.post('/edit-product/:id', adminController.editProductPost);

router.post('/edit-status/:id', adminController.editStatusPost);
router.get('/sale-report', adminController.getSalesReport);
router.get('/view-details/:id',adminController.getviewdetails);

router.get('/add-categoryoffer',verifyLogin1, adminController.addCategorOfferyGet);
router.post('/add-categoryoffer',verifyLogin1, adminController.addCategorOfferyPost);
router.get('/list-coupon',verifyLogin1,adminController.getlistCoupon);
router.get('/add-coupon',verifyLogin1,adminController.getAddCoupon);
router.post('/add-coupon',verifyLogin1,adminController.postAddCoupon);
router.get('/add-productoffer',verifyLogin1, adminController.addProductOfferGet);
router.post('/add-productoffer',verifyLogin1, adminController.addProductOfferPost);
router.get('/edit-productoffer/:_id',verifyLogin1, adminController.editProductOfferGet);
router.post('/edit-productoffer/:_id',verifyLogin1, adminController.editProductOfferPost);
router.get('/delete-productoffer/:_id',verifyLogin1, adminController.deleteProductOfferGet);

router.get('/edit-categoryOffer/:id',verifyLogin1, adminController.editCategorOfferyGet);
router.post('/edit-categoryOffer/:id',verifyLogin1, adminController.editCategorOfferyPost);
router.get('/delete-categoryOffer/:id',verifyLogin1, adminController.deleteCategorOfferyIdGet);

router.delete('/deleteCoupon',adminController.DeleteCouponDelete);


router.get('/adminlogout', adminController.adminLogOut); 
router.get('/This-is-wrong',adminController.SomethingsWrong)

module.exports = router;
