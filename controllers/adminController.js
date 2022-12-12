var express = require('express');
var router = express.Router();
const adminHelpers = require('../helpers/admin-helpers')
const userHelpers = require('../helpers/user-helpers')
const productHelpers = require('../helpers/product-helpers')
const categoryHelpers = require('../helpers/category-helpers');
const { render ,response} = require('../app');
const orderHelpers = require('../helpers/order-helpers');
const offerHelpers = require('../helpers/offer-helpers');
const { getAllCatOffers } = require('../helpers/offer-helpers');
const couponHelpers = require('../helpers/coupen-helpers');
const productofferHelpers = require('../helpers/productoffer-helpers');



const adminController={
  
  
  ///////////////////////////////// Login Credentials ////////////////////////
  //  credentials : {
  //   email: "admin@gmail.com",
  //   password: "admin"
  // },
  
  ////////////////// Main Page (dash/Login) ///////////////////////. 
  mainPageGet: async(req, res, next)=> {
   try{
    if (req.session.adminLoggedIn) {
      let Users=await userHelpers.totUsers()
      let Products=await userHelpers.totProducts()
      let Orders=await userHelpers.totOrders()  
      let Revenue=await adminHelpers.graphdata()
      let revenue =Revenue.yearlySales[0].total
      res.render('admin/admin-dashboard', { admin: true,Users,Products,Orders,revenue})
    } else {
      res.redirect('/admin/admin-login')
    }
  }catch(error) {
    res.redirect('/SomethingWentwrong');
      console.log("Something Went Wrong in main page of admin",error);
  }
},
  
  ////////////////////// Admin Login ///////////////////////////////
  adminLoginGet: (req, res) => {
    if (req.session.adminLoggedIn) {
      res.redirect('/admin')
    } else {
      res.render('admin/admin-login',{adminErr:req.session.adminLoginError})
      req.session.adminLoginError=false
  
    }
  
  },
  
  
  adminLoginPost: function (req, res) {
    const credentials = {
      email: "admin@gmail.com",
      password: "admin"
    }    
    if (req.body.Email == credentials.email && req.body.Password == credentials.password) {
      req.session.adminLoggedIn = true;
      req.session.admin = req.body.email;
      res.redirect('/admin');
      
    }
    else {
      console.log("admin not logged in");
      req.session.adminLoginError="Invalid Username or Password"
      res.redirect('/admin')
    }
  },
  
  
  
  
  /////////////////////////// Listing(User,Category,Products, Orders) ///////////////////////////////
  
  listProductGet: (req, res) => { //verifyLogin1
    console.log('asdfafoff');
    productHelpers.getAllProduct().then((products) => {
      // products.forEach(async element => {
      //   let catName = await categoryHelpers.getCategory(element.category)
      //   if(catName){
      //     element.catName = catName.category
      //   }
      // });
      res.render('admin/list-product', { admin: true, products })
    })
  
  },
  
  
  
  listUserGet: (req, res) => {
    userHelpers.getAllUsers().then((users) => {
      res.render('admin/list-user', { admin: true, users })
  
    })
  },
  
  
  
  listCategoryGet: async (req, res) => {  
    let category = await categoryHelpers.get_category_list()
    res.render('admin/list-category', { admin: true, category })
  },
  
  
  listOrderGet: async(req, res) => {  //verifyLogin1
    try{
    let allproduct = await productHelpers.getAllProduct()

    orderHelpers.getAllOrders().then((orderList) => {
    orderList.forEach(element => {
        if (element.status == "delivered") {
          element.delivered = true;
        } else if (element.status == "cancelled") {
          element.cancelled = true;
        }else if (element.status == "returned"){
          element.returned = true;
        }
      });
      
      res.render('admin/list-order', { admin: true ,orderList, allproduct})
    })
  }catch (error){
    console.log("Something Went Wrong ListOrderGet");
    res.redirect('/SomethingWentwrong');
  }
    },
  
  /////////////////////////// Adding (Category,Products) ///////////////////////////////
  
  addCategoryGet: (req, res) => {
    res.render('admin/add-category', { admin: true , categoryErr: false  })
  },
  
//   addCategoryPost: (req, res) => {
//     try{
//     console.log("////////",req.body);
//     console.log(req.files.image1.name)
//     const catDetails = {
//       category: req.body.category,
//       image1 : req.files.image1.name,
//       }
//     categoryHelpers.add_category(catDetails).then((data) => {
//       console.log("EEde Ethikn")
//       let image1 = req.files.image1
//       image1.mv(`./public/assets/cat-images/${data}1.jpg`, (err, done) => {
//       })
//       if (data.status) {
//         console.log('fhdfhdhdhd');
//         res.redirect('/admin/list-category')


//     }else {
//       res.render('admin/add-category', { categoryErr: true, admin: true })
//   }
//   })
// } catch(error){
//   res.redirect('/SomethingWentwrong');
//   console.log("Someting Went Wrong in add Category");
// }
//   },

  addCategoryPost: (req, res) => {
    try{
    console.log(req.body);
    categoryHelpers.add_category(req.body).then((data) => {
      if (data.status) {
        console.log('fhdfhdhdhd');
        res.redirect('/admin/list-category')


    }else {
      res.render('admin/add-category', { categoryErr: true, admin: true })
  }
  })
} catch(error){
  console.log("Someting Went Wrong");
}
  },
  
  
  
  addProductGet: async (req, res) => {
    let category = await categoryHelpers.get_category_list()
    res.render('admin/add-product', { admin: true, category })
  
  },
  
  
  addProductPost: function (req, res) {
    console.log(req.body);
    console.log(req.files.image1.name);
    console.log('image name = ',req.files.image1);
    try{
    const prdtDetails = {
      Name : req.body.Name,
      price: req.body.price,
      discriptions : req.body.discriptions,
      stock: req.body.stock,
      category: req.body.category,
      image1 : req.files.image1.name,
      image2 : req.files.image2.name,
      image3 : req.files.image3.name,
      image4 : req.files.image4.name
      }
    productHelpers.addProduct(prdtDetails).then((data) => {
      let image1 = req.files.image1
      let image2 = req.files.image2
      let image3 = req.files.image3
      let image4 = req.files.image4
      console.log('image = ',image1);
      image1.mv(`./public/assets/product-images/${data}1.jpg`, (err, done) => {
      })
      image2.mv(`./public/assets/product-images/${data}2.jpg`, (err, done) => {
      })
      image3.mv(`./public/assets/product-images/${data}3.jpg`, (err, done) => {
      })
      image4.mv(`./public/assets/product-images/${data}4.jpg`, (err, done) => {
      })
  
      res.redirect('/admin/list-product')
    })
  } catch (error){
    console.log("Something Went Wrong in Add Product");
    res.redirect('/SomethingWentwrong');
  }
  },
  
  
  
  
  //////////////////// Deleting & Blocking (User , Products, Category)///////////////////////////////////////////////////
  
  deleteProductIdGet: (req, res) => {
    let proId = req.params.id
    console.log(proId);
    productHelpers.deleteProduct(proId).then((response) => {
      res.redirect('/admin/list-product')
    })
  },
  
  
  
  deleteCategoryIdGet: (req, res) => {
    let proId = req.params.id
    console.log(proId);
    categoryHelpers.delete_category(proId).then((response) => {
      res.redirect('/admin/list-category')
    })
  
  },
  
  
  changeStatusGet: (req, res) => {
    userHelpers.changeStatus(req.query.id).then((response) => {
      admin__msg = response
      res.redirect('/admin/list-user')
    })
  },
  
  changeStatusPost:(req, res)=>{
    res.render('admin/list-order')
  },
  
  
  
  /////////////////////////// Editing (Category,Products) ///////////////////////////////
  
  
  
  editCategoryGet: async (req, res) => {
    let category = await categoryHelpers.getCategoryDetails(req.params.id)
    res.render('admin/edit-category', { category, admin: true })
    admin__msg = ''
  },
  
  
  editCategoryPost: (req, res) => {
    console.log(req.body, "out said");
    categoryHelpers.updateCategory(req.params.id, req.body).then((response) => {
      res.redirect('/admin/list-category')
    })
  },
  
  
  editProductGet: async (req, res) => {
    let product = await productHelpers.getProductDetails(req.params.id)
    let category = await categoryHelpers.get_category_list()
    res.render('admin/edit-product', { product, category, admin: true })
  },
  
  
  editProductPost: (req, res) => {
    let data = req.params.id
    productHelpers.updateProduct(data, req.body).then(async (response) => {
      try {
        if (req.files.image1) {
          let image1 = req.files.image1
          await image1.mv(`./public/assets/product-images/${data}1.jpg`, (err, succ) => {
            if (err) {
              console.warn(err)
            } else {
              console.log('success')
            }
          })
        }
        if (req.files.image2) {
          let image2 = req.files.image2
          await image2.mv(`./public/assets/product-images/${data}2.jpg`, (err, succ) => {
            if (err) {
              console.warn(err)
            } {
              console.log('success')
            }
          })
        }
        if (req.files.image3) {
          let image3 = req.files.image3
          await image3.mv(`./public/assets/product-images/${data}3.jpg`, (err, succ) => {
            if (err) {
              console.warn(err)
            } {
              console.log('success')
            }
          })
        }
        if (req.files.image4) {
          let image4 = req.files.image4
          await image4.mv(`./public/assets/product-images/${data}4.jpg`, (err, succ) => {
            if (err) {
              console.warn(err)
            } {
              console.log('success')
            }
          })
        }
        res.redirect('/admin/list-product')
      }
      catch (err) {
        res.redirect('/admin/list-product')
      }
    })
  },
  
  
  
  
  
    editStatusPost: (req, res) => {
      adminHelpers.productStatus(req.params.id, req.body.status).then(() => {
        res.redirect('/admin/list-order')
      })
    },
  
  
  //////////////////////// Dashboard /////////////////////////////


  adminDashboardGet: async(req, res) => { //verifyLogin1
    let Users=await userHelpers.totUsers()
    let Products=await userHelpers.totProducts()
    let Orders=await userHelpers.totOrders()
    let Revenue=await adminHelpers.graphdata()
    let revenue =Revenue.yearlySales[0].total
    console.log(Revenue);
    // console.log(Revenue.yearlySales[0].total);
    // console.log(revenue.yearlySales[0].total);
    console.log('jjjjjjjjjjjjjjjjj')
  
    res.render('admin/admin-dashboard', { admin: true,Users,Products,Orders,revenue})
  
  
  },
  adminDashboardGetday: async (req, res) => {
    console.log('nnnnnnnnnnnnnnnnnnnnnnn')
  
    await adminHelpers.findOrdersByDay().then((data) => {
      res.json(data)
    })
  },
  
  adminDashboardPostDataGrapgh: async (req, res) => {
    console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
  
    await adminHelpers.graphdata().then((data) => {
      console.log(data,'jooooooo');
      res.json({ data })
    })
  },
  
  
  getSalesReport: async (req, res) => {
  try{
    if (req.session.adminLoggedIn) {
      let myorder = await orderHelpers.getAllDelOrders()
      myorder.forEach(element => {
        let a = element.date.toISOString().split('T')[0]
        console.log(a);
            element.date = a;
          });
  
      res.render('admin/sale-report', { myorder, admin: true })
    }
  } catch (error) {
    console.log("Something Went Wrong Page SalesRepo");
    res.redirect('/SomethingWentwrong');
  }
  },


  getviewdetails: async (req, res) => {
    try{
    let order = await orderHelpers.getOrderDetails(req.params.id)
    console.log("Suiiiiiiiiiiiiiiiiiiii",order);
    res.render('admin/view-details', { admin:true,order })
    } catch{
      console.log("Something Went Wrong in GetViewDetails");
      res.redirect('/SomethingWentwrong');
    }



},

/// product offer///
addProductOfferGet: async (req, res) => {
  try {
      let product = await productHelpers.getAllProduct();
      let AllProductOffer = await productofferHelpers.getAllProductOffer();
      console.log(product, 'looooooooooooooo');


      res.render('admin/add-productoffer', { admin: true, product, AllProductOffer })

  } catch (error) {
    res.redirect('/SomethingWentwrong');
      console.log('somthing wrong in add product offer  ');

  }


},
addProductOfferPost: (req, res) => {
  try {
      
              productofferHelpers.addProductOffer(req.body).then(() => {
      
                  console.log(req.body, 'juuuuuuuuuu');
      
                  res.redirect('/admin/add-productoffer')
              });

  } catch (error) {
    res.redirect('/SomethingWentwrong');
      console.log('somthing wrong in add-productoffer  ');

  }
},


editProductOfferGet: async (req, res) => {
  try {
              let proOfferId = req.params._id;
              let proOfferDetails = await productofferHelpers.getProductOfferDetails(proOfferId);
              console.log(proOfferDetails, 'pooooooooooo');
              let product = await productHelpers.getAllProduct()
              res.render("admin/edit-productoffer", { admin: true, proOfferDetails, product })

  } catch (error) {
    res.redirect('/SomethingWentwrong');
      console.log('somthing wrong in editProductOfferPost ');

  }


},
editProductOfferPost: (req, res) => {
  try {
      let proOfferId = req.params._id;
      console.log(req.body, 'kkkkkkk');
      console.log(proOfferId, 'lllllllllllllll');
      productofferHelpers.editProdOffer(proOfferId, req.body).then(() => {
          res.redirect("/admin/add-productoffer");
      })

  } catch (error) {
    res.redirect('/SomethingWentwrong');
      console.log('somthing wrong in editProductOfferPost ');

  }



},

deleteProductOfferGet: (req, res) => {
  try {
      let proOfferId = req.params._id;
      console.log("HEre////////////////",proOfferId);
      productofferHelpers.deleteProdOffer(proOfferId).then(() => {
          res.redirect("/admin/add-productoffer");
      });

  } catch (error) {
    res.redirect('/SomethingWentwrong');
      console.log('somthing wrong in delete-productoffer ');

  }




},

/// category offeers      ////

addCategorOfferyGet: async (req, res) => {
  try {
      let category = await categoryHelpers.getAllCategory()
      let alloffercategory = await offerHelpers.getAllCatOffers()
      res.render('admin/add-categoryoffer', { admin: true, category, alloffercategory })

  } catch (error) {
    res.redirect('/SomethingWentwrong');
      console.log('somthing wrong in Add Category offer');

  }


},
addCategorOfferyPost: (req, res) => {
  try {
      
              offerHelpers.addCategoryOffer(req.body).then(() => {
                  res.redirect('/admin/add-categoryoffer')
      
              }).catch(() => {
                  req.session.offerExist = "offer for this category is already added"
                  res.redirect('/admin/add-categoryoffer')
              })

  } catch (error) {
    res.redirect('/SomethingWentwrong');
      console.log('somthing wrong in  Add Category offer ');

  }
},



editCategorOfferyGet: async (req, res) => {
  try {
      let data = await offerHelpers.getCatOfferDetails(req.params.id)
      let category = await categoryHelpers.get_category_list()

      res.render('admin/edit-categoryoffer', { admin: true, data, category })

  } catch (error) {
    res.redirect('/SomethingWentwrong');
      console.log('Somthing wrong in editCategory Offer ');
  }

},

editCategorOfferyPost: (req, res) => {
  try {
      console.log(req.body);
      let id = req.params.id
      offerHelpers.updateCatOffer(id, req.body).then(() => {
          res.redirect('/admin/add-categoryoffer')
      })

  } catch (error) {
    res.redirect('/SomethingWentwrong');
      console.log('Somthing wrong in editCategory Offer');

  }

},


deleteCategorOfferyIdGet: (req, res) => {
  let catoffId = req.params.id
  offerHelpers.deleteCatOffer(catoffId).then((response) => {
      res.redirect('/admin/add-categoryoffer')

  })


},


deleteCategorOfferyGet: (req, res) => {

  res.render('/admin/add-categoryoffer')

},

 /////coupon///////////


 getlistCoupon: async (req, res) => {
  let coupons = await couponHelpers.getAllCoupons()
  res.render('admin/list-coupon', { admin: true, coupons },)
},

getAddCoupon: (req, res) => {
  res.render('admin/add-coupon',{ admin: true})

},
postAddCoupon: (req, res) => {

      console.log(req.body, 'ffffffffffff');
      couponHelpers.addCoupon(req.body).then(() => {
          res.redirect('/admin/list-coupon')

      })

 
},
DeleteCouponDelete: (req, res) => {

  console.log('57222')
  // let userId = req.session.user._id
  let id = req.body.couponId
  couponHelpers.deleteCoupon(id).then((response) => {
      res.status(200).send({ response: true })
  })

},

/////////////////////////////////////////////////////////////////////////

SomethingsWrong: (req,res)=>{
  res.render('SomethingsWrong')
},


  
  adminLogOut: (req, res) => {
    req.session.admin = null
    req.session.adminLoggedIn = null
    req.session.adminLoginError = null
    res.redirect('/admin')
  },
  
}

  module.exports = adminController;
  