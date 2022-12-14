var express = require('express');
const bcrypt = require('bcrypt');
var objectId = require('mongodb').ObjectId
// const { response } = require('../app');
const cartHelpers = require('../helpers/cart-helpers')
const adminHelpers = require('../helpers/admin-helpers');
const productHelpers = require('../helpers/product-helpers')
const categoryHelpers = require('../helpers/category-helpers')
const userHelpers = require('../helpers/user-helpers');
const configTwilio=require('../config/twillio');
const couponHelpers = require('../helpers/coupen-helpers');
const addressHelpers = require('../helpers/address-helpers')
const paymentHelpers=require('../helpers/payment-helpers')
const wishHelpers = require('../helpers/wish-helpers')
var router = express.Router();
// const { json } = require('express');
const orderHelpers= require('../helpers/order-helpers')
const moment = require("moment");
const offerHelpers = require('../helpers/offer-helpers');
// const {getCartProductList,getTotalAmount} = require('../helpers/cart-helpers')
const productofferHelpers = require('../helpers/productoffer-helpers');
require('dotenv')
const serviceSID = process.env.serviceSID
const accountSID = process.env.accountSID
const authToken = process.env.authToken
const client = require('twilio')(accountSID, authToken, serviceSID);
// const client = require('twilio')(configTwilio.accountSID, configTwilio.authToken,configTwilio.serviceSID);
let phone

const userController ={


    //////////////////////////////home page////////////////////////

    // homePage: async (req, res)=> {
    //     if(req.session.user){
    //       let userss=req.session.user
    //       let person = await userHelpers.getUser(userss._id)
    //       let cartCount=null
    //       if(req.session.user){
    //         cartCount=await cartHelpers.getCartCount(req.session.user._id)
    //        wishCount=await wishHelpers.getWishListCount(req.session.user._id)
    //       }
    //     let category = await categoryHelpers.getAllCategory()
    //       productHelpers.getAllProduct().then((products) => {
    //         products.forEach(async element => {
    //           let catName = await categoryHelpers.getCategory(element.category)
    //           if(catName){
    //             element.catName = catName.category 
    //           }
    //         });
    //       res.render('user/main',{user:true,category,products,users:true,person,cartCount,wishCount});
    //       })
    //     }
    //     let userss=req.session.user
    //     let category = await categoryHelpers.getAllCategory()
    //       productHelpers.getAllProduct().then((products) => {
    //         products.forEach(async element => {
    //           let catName = await categoryHelpers.getCategory(element.category)
    //           if(catName){
    //             element.catName = catName.category 
    //           }
    //         });
    //       res.render('user/main',{user:true,category,products,userss});
    //       })
    //   },


    homePage: async (req, res) => {
      var Men
      var Women
      var Kid
      let todayDate = new Date().toISOString().slice(0, 10);
      let startCouponOffer = await couponHelpers.startCouponOffer(todayDate)
      let startCategoryOffer = await offerHelpers.startCategoryOffer(todayDate)
      let startProductOffer = await productofferHelpers.startProductOffer(todayDate)

      if (req.session.user) {
          let userss = req.session.user
          let todayDate = new Date().toISOString().slice(0, 10);
          let startCouponOffer = await couponHelpers.startCouponOffer(todayDate)
          let startCategoryOffer = await offerHelpers.startCategoryOffer(todayDate)
          let startProductOffer = await productofferHelpers.startProductOffer(todayDate)
          let person = await userHelpers.getUser(userss._id)
          let cartCount = null
          if (req.session.user) {
              cartCount = await cartHelpers.getCartCount(req.session.user._id)
              wishCount=await wishHelpers.getWishListCount(req.session.user._id)
          }
          let category = await categoryHelpers.getAllCategory()
          console.log('categoryDetails', category);

          category.forEach(async(element)=>{
            if(element.category=="MEN"){
               Men = objectId(element._id)
            }
            else if(element.category=="WOMEN"){
               Women = objectId(element._id)
            }
            else if (element.category =="KID"){
               Kid= objectId(element._id)
            }
          });
         console.log("MEN WOMEN KID",Men,Women,Kid)
          let products = await productHelpers.getAllProduct();
          
          products.forEach(async (element) => {
              if (element.stock <= 10 && element.stock != 0) {
                  element.fewStock = true;
              } else if (element.stock == 0) {
                  element.noStock = true;
              }
          });


          res.render('user/main', { user: true, category, products, users: true, person, cartCount ,wishCount,Men,Women,Kid});

      }
      let userss = req.session.user
      let category = await categoryHelpers.getAllCategory()
      category.forEach(async(element)=>{
        if(element.category=="MEN"){
           Men = objectId(element._id)
        }
        else if(element.category=="WOMEN"){
           Women = objectId(element._id)
        }
        else if (element.category =="KID"){
           Kid= objectId(element._id)
        }
      });
      productHelpers.getAllProduct().then((products) => {
          // products.forEach(async element => {
          //     let catName = await categoryHelpers.getCategory(element.category)
          //     if (catName) {
          //         element.catName = catName.category
          //     }
          // });
          res.render('user/main', { user: true, category, products, userss ,Men,Women,Kid});
      })


  },
      ///////////////////////////////////////////////////  User Login And SignUp  /////////////////////////////////////////////////////////

// Users Logins

userLoginGet:function(req, res, next) {
    if(req.session.loggedIn){
      res.redirect('/')
    }else{
      res.render('user/login',{loginErr:req.session.logginErr,otpUserBlock : req.session.blockErr,invalidUser : req.session.invalidUser,blockErr:req.session.blockError});
      req.session.blockErr = false
      req.session.logginErr=false
      req.session.invalidUser = false
      req.session.blockError= false
    }
  },
  // ghgh
  
  
  userLoginPost: (req, res) => {
    userHelpers.doLogin(req.body).then((response) => {  // data comes throgh req.body
      if (response.isblocked) {
        req.session.blockError = "user blocked"     
        res.redirect('/login')
      }
      else if (response.status) {
        req.session.loggedIn = true
        req.session.user = response.user   
      
        if(req.session.previousUrl){
          res.redirect(req.session.previousUrl)
        }else        res.redirect('/')
      } else {
        req.session.logginErr = "Invalid Username or Password"
        res.redirect('/login')  
      }
    })
  },
  
  
  // Users SignUp
  
  userSignupGet: function(req, res, next) {
    res.render('user/signup',{signupErr:req.session.signupErr});
    req.session.signupErr=false
  },
  
  
  userSignupPost:(req,res)=>{
    userHelpers.doSignup(req.body).then((response)=>{
      if(response.statuss){
        req.session.signupErr = "Number Already  Exists"
        res.redirect('/signup')
        // res.redirect('/login')
      }else if (response.status){
        res.redirect('/login')
      }else{
        req.session.signupErr = "Email Already  Exists"
        res.redirect('/signup')
      }
    })
  
  },

  // Otp Login


otpPageGet:(req,res)=>{    
    res.render('user/otp',{otpErr:req.session.invalidOtpError,phone})
  },
  
  
getOtpPost:(req,res)=>{
     phone=req.body.phone
     console.log(phone, 'Entered Phone Number');
     userHelpers.verifyPhone(phone).then(()=>{
      client.verify
      .services(process.env.serviceSID)
      .verifications.create({
        to: `+91${phone}`,
        channel: "sms"
      }).then((response) => {
        res.render('user/otp', { phone })
      }).catch((e) => {
        console.log(e);
        console.log('failedd');
      })
     }).catch((response)=>{
      if(response.nouser){
        req.session.invalidUser= "invalid number"
        res.redirect('/login')
      }else{
        req.session.blockErr="user blocked"
        res.redirect('/login')
  
      }
     })
  
  },
  
  
 submitOtpPost: (req, res) => {
    userHelpers.verifyOTP(phone).then((response)=>{
      let users=req.session.user
      let otp = req.body.otp
      client.verify
        .services(process.env.serviceSID)
        .verificationChecks.create({
          to: `+91${phone}`,
          code: otp
    }).then((data) => {
        if (data.valid) {
          req.session.loggedIn = true
          req.session.user = response
          res.redirect('/')
        } else {
          req.session.invalidOtpError = "invalid otp"
          res.redirect('/otp')
        }
      })
    })
  },

  
  allProductGet:async (req, res) => { //verifyLogin required
    req.session.previousUrl = '/all-product'
    let users=req.session.user
    // let userss=req.session.user
    let category = await categoryHelpers.getAllCategory()
    let cartCount=await cartHelpers.getCartCount(req.session.user._id)
    let wishCount=await wishHelpers.getWishListCount(req.session.user._id)
    let person = await userHelpers.getUser(users._id)
    productHelpers.getAllProduct().then((products)=>{
      res.render('user/all-product', { user: true ,products,category,users,cartCount, wishCount,person})
    })  
    
    },


  showCategoryIdGet:async(req,res)=>{    //verifyLogin Required
    if(req.session.user){
    let userss=req.session.user
    let person = await userHelpers.getUser(userss._id)
    let category = await categoryHelpers.getAllCategory()
    let cartCount = await cartHelpers.getCartCount(req.session.user._id) 
    let wishCount=await wishHelpers.getWishListCount(req.session.user._id)
    let oneCat = await categoryHelpers.getCategory(req.params.id)
    console.log("}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}",oneCat)
    let products =  await categoryHelpers.getAllCategoryProduct(oneCat.category)
    var men;
    var women;
    var kid;
    products.forEach(async(element)=>{
      if(element.category==="MEN"){
        men=true;
      }else if(element.category==="WOMEN"){
        women=true;
      }else if(element.category==="KID"){
        kid=true;
      }else{
        men=null;
        women=null;
        kid=null
      }
    })
    let productss = await productHelpers.getAllProduct();
    products.forEach(async (element) => {
        if (element.stock <= 10 && element.stock != 0) {
            element.fewStock = true;
        } else if (element.stock == 0) {
            element.noStock = true;
        }
    });
    console.log(category);
    
    res.render('user/all-product',{user:true,login:true,products,productss,category,oneCat,users:true,userss,cartCount,person,wishCount,men,women,kid});
  }else{
    // let userss=req.session.user
    // let person = 0
    let category = await categoryHelpers.getAllCategory()
    let cartCount = 0
    let wishCount=0
    let oneCat = await categoryHelpers.getCategory(req.params.id)
    console.log("",oneCat)
    let products =  await categoryHelpers.getAllCategoryProduct(oneCat.category)
    var men;
    var women;
    var kid;
    products.forEach(async(element)=>{
      if(element.category==="MEN"){
        men=true;
      }else if(element.category==="WOMEN"){
        women=true;
      }else if(element.category==="KID"){
        kid=true;
      }else{
        men=null;
        women=null;
        kid=null
      }
    })
    let productss = await productHelpers.getAllProduct();
    products.forEach(async (element) => {
        if (element.stock <= 10 && element.stock != 0) {
            element.fewStock = true;
        } else if (element.stock == 0) {
            element.noStock = true;
        }
    });
    console.log(category);
    res.render('user/all-product',{user:true,login:true,products,productss,category,oneCat,cartCount,wishCount,men,women,kid});
  }  
  },
  
  ///////////////////////////////////////////////  Product  ////////////////////////////////////////////////////////////////

// productViewGet:(req,res)=>{
//     let users=req.session.user
//     res.render('user/product-view',{user:true,users})
//   },
  
  
productViewGetId:async(req,res)=>{
  req.session.previousUrl = '/product-view/'+req.params.id;
  console.log('358 = ',req.session.previousUrl)
  //body yill kodutha  //verify login required
  if(req.session.user){
    let users=req.session.user
    let userss=req.session.user
    let person = await userHelpers.getUser(userss._id)
    let id = req.params.id
    let category = await categoryHelpers.getAllCategory()
    let products = await productHelpers.getAllProduct()
    let productss = await productHelpers.getAllProduct()

    productss.forEach(async (element) => {
      if (element.stock <= 10 && element.stock != 0) {
          element.fewStock = true;
      } else if (element.stock == 0) {
          element.noStock = true;
      }
  });


    let cartCount=await cartHelpers.getCartCount(req.session.user._id)
    let wishCount=await wishHelpers.getWishListCount(req.session.user._id)
    let onePro =await productHelpers.getAllProduct(req.params.id)
    let product = await productHelpers.getProductDetails(id)
        if (product.stock <= 10 && product.stock != 0) {
            product.fewStock = true;
        } else if (product.stock == 0) {
            product.noStock = true;
        }
      
    
      res.render('user/product-view',{user:true,product,wishCount,productss, products,category,onePro,userss,users:true,cartCount,zoom:true,person})
      }else{
        // let users=req.session.user
    // let userss=req.session.user
    // let person = await userHelpers.getUser(userss._id)
    let id = req.params.id
    let category = await categoryHelpers.getAllCategory()
    let products = await productHelpers.getAllProduct()
    let productss = await productHelpers.getAllProduct()

    productss.forEach(async (element) => {
      if (element.stock <= 10 && element.stock != 0) {
          element.fewStock = true;
      } else if (element.stock == 0) {
          element.noStock = true;
      }
  });
    // let cartCount=await cartHelpers.getCartCount(req.session.user._id)
    // let wishCount=await wishHelpers.getWishListCount(req.session.user._id)
    let onePro =await productHelpers.getAllProduct(req.params.id)
    let product = await productHelpers.getProductDetails(id)
        if (product.stock <= 10 && product.stock != 0) {
            product.fewStock = true;
        } else if (product.stock == 0) {
            product.noStock = true;
        }
      
    
      res.render('user/product-view',{user:true,product,productss, products,category,onePro,zoom:true})
      }
  },
  
  
  
  
  
  ///////////////////////////////////////   Cart  /////////////////////////////////////////////////////////////////


viewCartGet:async(req,res)=>{   //verifyLogin Required
  try {
    let users=req.session.user
    let Person=req.session.user
    let person = await userHelpers.getUser(Person._id)
    let cartCount=await cartHelpers.getCartCount(req.session.user._id)
    let wishCount=await wishHelpers.getWishListCount(req.session.user._id)
    let totalValue=await cartHelpers.getTotalAmount(req.session.user._id)
    console.log("//////////",req.session.user._id)
    console.log("Total Proice is :",totalValue);
    let category = await categoryHelpers.getAllCategory()
    let products =  await cartHelpers.getCartList(req.session.user._id)
    const userId = await req.session.user._id
     res.render('user/view-cart',{user:true,category,products,cartCount,totalValue,userId,users,person,wishCount})
    } catch (error){
      console.log("Something Went Wrong n View Cart Get");
      res.redirect('/SomethingWentwrong');
    }
    },

  

  
  
  // addToCartGet:async(req,res)=>{  //verifyLogin Required
    
  //   cartHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
  //     res.json({status:true})
  //   })
  // },

  addToCartGet: async (req,res) => {
    console.log("Add to cart 346")
    try{
      let user=req.session.user;
      let proQuantity = await cartHelpers.findCartProdQty(req.session.user._id,req.params.id)
      let product = await productHelpers.findStock(req.params.id)

      console.log('productId is ',req.params.id)
      if(product.stock == 0){
        res.json({ status: "noStock"})
      } else if (product.stock == proQuantity){
        res.json({ status: "fewStock"})
      } else if (proQuantity == 3) {
        res.json({ status: "maxLimitStock"})
      } else{
        if (user){
          cartHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
            res.json({ status : "add" });
          })
        } else{
          res.json({ status: "login"})
        }
      }
    } catch (error){
      console.log("Something Wrong in Add To CartGET");
      res.redirect('/SomethingWentwrong');
    }
  },
//   addToCartGet: async (req, res) => {  //verifyLogin Required
//     let user = req.session.user;
//     let proQuantity = await cartHelpers.findCartProdQty(req.session.user._id, req.params.id)
//     let product = await productHelpers.findStock(req.params.id);
//     console.log(product.stock, 'kkkkkkkkkkk');
//     if (product.stock == 0) {
//         console.log('hiiii');
//         res.json({ noStock: true });
//     } else if (product.stock == proQuantity) {
//         res.json({ status: "fewStock" });
//     } else if (proQuantity == 3) {
//         res.json({ status: "maxLimitStock" });
//     } else {
//         if (user) {
//             cartHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
//                 console.log('here')
//                 res.json({ status: true })
//             })

//         } else {
//             res.json({ status: false })
//         }
//     }
// },
  
  // changeProductQuantityPost:async(req,res,next)=>{ //verifyLogin Required
  //   var obj = req.body
  //   obj.user= await req.session.user._id
  //   cartHelpers.changeProductQuantity(obj).then(async(response)=>{  
  //      total =await cartHelpers.getTotalAmount(req.session.user._id)
  //     response.total = total
  //     res.json(response) //java script object notation ,passing an data as and object
  //   })
  // },
  
  changeProductQuantityPost: async (req, res, next) => {
    try{
      cartHelpers.changeProductQuantity(req.body).then(async (response) => {
        response.total = await cartHelpers.getTotalAmount(req.body.user);
        res.json(response)
      }). catch((response)=>{
        if(response.status || response.noStock){
          res.json({ noStock: true})
        } else {
          res.json({ maxLimitStock: true })
        }
      })
    } catch(error) {
      console.log("Something Went Wrong in Change Prod QTY");
      res.redirect('/SomethingWentwrong');
    }
  },

 ////////////////////////////////////////// Order ///////////////////////////////////////////////////////////
placeOrderGet: async (req, res) => { //verifyLogin Required
  try{
  let users = req.session.user
  let userss = req.session.user

  let person = await userHelpers.getUser(userss._id)
  let cartCount = await cartHelpers.getCartCount(req.session.user._id)
  let eachAddress = await addressHelpers.getAddressbyId(users._id)
  let address = await userHelpers.getAllAddress(req.session.user._id)
  // let alladdress= address.allAddressDetails
  let alladdress = address.address

  let total = await cartHelpers.getTotalAmount(req.session.user._id)
  let product = await categoryHelpers.getAllCategoryProduct(req.params.id)
  let cartsProducts = await cartHelpers.getCartList(req.session.user._id)
  console.log("gggggggggggg", cartsProducts);
  let category = await categoryHelpers.getAllCategory()
  // let addressUser=address[0].allAddressDetails
  res.render('user/place-order', { user: true, category, total, user: req.session.user, cartsProducts, product, users, cartCount, eachAddress, alladdress, person, })
  } catch(error) {
  console.log("Something Went Wrong in Place Order");
  res.redirect('/SomethingWentwrong');
  }
},

placeOrderPost: async (req, res) => {  //verifyLogin Required
  
  console.log("hoiiiiiifffffffffff");
  
  try{
  let products = await cartHelpers.getCartProductList(req.session.user._id)
  console.log(req.body);

  console.log(req.body, "hoiiiiii");
  if (req.session.couponTotal) {
    totalPrice = req.session.couponTotal
    req.session.couponTotal = null
    } else {
    totalPrice = await cartHelpers.getTotalAmount(req.body.userId)

  }
  cartHelpers.placeOrder(req.body, products, totalPrice).then((orderId) => {
      console.log(orderId, 'cod');
      if (req.body['payment-method'] === 'COD') {
          res.json({ codStatus: true })

      } else if (req.body['payment-method'] === 'paypal') {
          paymentHelpers.genaretePaypal(orderId, totalPrice).then((link) => {
              paymentHelpers.changePaymentStatus(orderId).then(() => {
                  res.json({ link, paypal: true })
              })
          })
      } else if (req.body['payment-method'] === 'razorpay') {
        console.log("Reached RazorPay")
          paymentHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
              console.log(response, 'responsee');
              console.log(orderId, "ordeereeee");
              res.json(response)
          })
      }


  })

} catch (error){
  console.log("Something Went Wrong in Place Order Post");
  res.redirect('/SomethingWentwrong');
}
},

verifyPaymentPost: (req, res) => {
 try{
  paymentHelpers.verifyPayment(req.body).then(() => {
      console.log(req.body, 'rq.body')
      paymentHelpers.changePaymentStatus(req.body.order.receipt).then(() => {
          console.log('success full');
          res.json({ status: true })


      })
  }).catch((err) => {
      console.log(err, 'is the error in the user.js verify payment');
      res.json({ status: false, erMsg: 'payment failed' })
  })

} catch(error) {
  console.log("Someethoing Went Wrong in Paymnent Verification");
  res.redirect('/SomethingWentwrong');
}
},


  
  

  myOrderGet: async (req, res) => { //verifyLogin Required
    try{
    let users = req.session.user
    let userss = req.session.user
    let person = await userHelpers.getUser(userss._id)
    let category = await categoryHelpers.getAllCategory()
    let cartCount = await cartHelpers.getCartCount(req.session.user._id)
    let wishCount=await wishHelpers.getWishListCount(req.session.user._id)
    // let order=await orderHelpers.getOrderProduct(req.session.user._id)
    let order = await orderHelpers.getOrderProduct(req.session.user._id)
    order.forEach(element => {
        let a = element.date.toISOString().split('T')[0]
        console.log(a);
        element.date = a;
    });

    console.log('router', order);
    order.forEach(element => {
        if (element.status == "delivered") {
            element.delivered = true;
        } else if (element.status == "cancelled") {
            element.cancelled = true;
        } else if (element.status == "returned") {
            element.returned = true;
        }
    });



    res.render('user/myorder', { user: true, users, userss, category, cartCount, order, person, order ,wishCount})

  } catch (error){
    console.log("Something Went Wrong in myOrderGet");
    res.redirect('/SomethingWentwrong');
  }
},
  
  cancelOrderIdGet: (req, res) => { //verifyLogin Required
    userHelpers.orderCancel(req.params.id).then(() => {
      res.redirect('/myorder')
    })
  },
  
  removeFromCartGet: (req, res) => {
    cartHelpers.removeFromCart(req.params.id, req.session.user._id).then((response) => {
      res.json({ status: true })
    })
  },
  
  reterunOrderIdGet: (req, res) => { //verifyLogin Required
    userHelpers.orderReturn(req.params.id).then(() => {
        res.redirect('/myorder')
    })
},
  
  paymentSuccesGet:(req,res)=>{ //verifyLogin Required
    res.render('user/payment-success')
  },
  
  orderedproductGet:async(req, res)=>{ //verifyLogin Required
    try{
    let users=req.session.user
    let userss=req.session.user
    let person = await userHelpers.getUser(userss._id)
    let cartCount=await cartHelpers.getCartCount(req.session.user._id)
    let category = await categoryHelpers.getAllCategory()
    let orderId = req.params.id
    let orderItems = await orderHelpers.getOrderProductList(orderId)
    let wishCount=await wishHelpers.getWishListCount(req.session.user._id)
    let orderList = await orderHelpers.getOrderedDetails(orderId)
    orderList.date = moment (orderList.date).format("XXX")
    console.log(orderList,"...........................");

    console.log(orderItems);
    res.render('user/ordered-product',{orderItems,user:true,users,userss,category,zoom:true,cartCount,person,orderList,wishCount})
  }catch(error) {
    console.log("Something Went Wrong in Ordered Page");
    res.redirect('/SomethingWentwrong');
  }
},
  
  
  addressGet:(req,res)=>{
    res.render('user/address')
  },
  addressPost:(req,res)=>{
    let userID = req.session.user._id
    addressHelpers.addAddress(userID,req.body).then(()=>{
      res.redirect('/place-order')
    })
  
  },
  
  //////////////////////////////////////  Profile  ///////////////////////////////////////////////////////////

profileGet:async(req,res)=>{  //verifyLogin Required
  try{
    let userss=req.session.user
    let users=req.session.user
    let userId = req.session.user._id
    let category = await categoryHelpers.getAllCategory()
    let address=await userHelpers.getAddressDetails()
    let cartCount=await cartHelpers.getCartCount(req.session.user._id)
    let wishCount=await wishHelpers.getWishListCount(req.session.user._id)
    let userAddress = await addressHelpers.getAllAddress(userId)
    let person = await userHelpers.getUser(users._id)

    let add = userAddress.address
    res.render('user/profile',{user:true,category,userss,users,address,cartCount,person,userAddress,add, passErr:req.session.changePasswordError,wishCount})
    req.session.changePasswordError=false
  } catch (error){
    console.log("Something Went Wrong in Profile");
    res.redirect('/SomethingWentwrong');
}
},
 

  
  changePasswordPost: async (req, res) => {  //verifyLogin Required
    try{
    let userId = req.session.user._id;
    let enteredPassword = req.body.old;
    let newPassword = req.body.new;
    let confirmPassword = req.body.confirm
  
    if (newPassword == confirmPassword) {
      let userdetails = await userHelpers.getUser(userId) 
      bcrypt.compare(enteredPassword, userdetails.Password).then((status) => {
        if (status) {
          userHelpers.changePassword(userId, newPassword).then((response) => {
            req.session.success = true
            res.redirect('/profile')
          })
  
        }
      })
  
    } else {
      req.session.changePasswordError = "Entered wrong password pleace enter same password";
      res.redirect('/profile')
    }
  } catch(error) {
    console.log("Something Went Wrong in Profile");
    res.redirect('/SomethingWentwrong');
  }
},
  
  
  userAddressPost:(req,res)=>{
    let userID = req.session.user._id
    addressHelpers.addAddress(userID,req.body).then(()=>{
      res.redirect('/profile')
    })
  
  },
  
  
  
  
  editProfilePost:(req,res)=>{
    let userID=req.params.id
      userHelpers.updateProfile(userID,req.body).then(async(data) => {
        try {
          if (req.files.profileImg) {
            let image = req.files?.profileImg
            await image.mv(`./public/assets/product-images/${userID}.jpg`, (err, succ) => {
              if (err) {
                console.warn(err)
              } {
                console.log('success')
              }
            })
          }
          res.redirect('/profile')
        }
        catch (err) {
          // res.redirect('/profile')
          res.redirect('/SomethingWentwrong');
          console.log('Something went wrong in Profile Page Post')
        }
      })
  },
  
  
  editUserAddressPost: (req, res) => {
    console.log('562')
    console.log(req.body)
    addressHelpers.editAddress(req.body.addressId, req.body).then((response) => {
      console.log(req.body);
      res.redirect('/profile')
   
    })
  },
  
  DeleteAdressGet: (req, res) => {
    console.log('57222')
    let userId = req.session.user._id
    let id=req.body.addressId
    addressHelpers.deleteAddress(userId,id).then((response) => {
      res.status(200).send({response:true})
    })
  
  },
  
  postApplyCoupon: async (req, res) => {
    try {

        let id = req.session.user._id
        let coupon = req.body.coupon
        let totalAmount = await cartHelpers.getTotalAmount(req.session.user._id)
        couponHelpers.validateCoupon(req.body, id, totalAmount).then((response) => {
            req.session.couponTotal = response.total

            if (response.success) {
                console.log(response);
                console.log('success');
                res.json({ couponSuccess: true, total: response.total, discountValue: response.discountValue, coupon })

            } else if (response.couponUsed) {
                res.json({ couponUsed: true })
            }
            else if (response.couponExpired) {
                console.log('expired');
                res.json({ couponExpired: true })
            }
            else {
                res.json({ invalidCoupon: true })
            }
        })


    } catch (error) {
      res.redirect('/SomethingWentwrong');
        console.log('somthing wrong in Copuen Posted ');

    }


},

////////////////////////////////////////////// wishlist ////////////////////////////////////////////////////////////

wishListGet: async (req, res) => {
  let users=req.session.user
  let Person=req.session.user
  let person = await userHelpers.getUser(Person._id)
  const userId = await req.session.user._id
  let cartCount=await cartHelpers.getCartCount(req.session.user._id)
  let wishCount=await wishHelpers.getWishListCount(req.session.user._id)
  let category = await categoryHelpers.getAllCategory()
  let product = await wishHelpers.getWishListProducts(req.session.user._id)
  res.render('user/wishlist', { user: true, product, users,person,userId,category,wishCount,cartCount})
},

addToWishListGet: (req, res) => {
  wishHelpers.addToWishlist(req.params.id, req.session.user._id).then((wishlist) => {
    if (wishlist.length > 0) {
      if (res.wishlist) {
        console.log('jhjhjhjhhjhj')
        res.json({ status: true, wishlist: true })

      } else {
        res.json({ status: true, wishlist: false })
      }
    }

  })
},


WishListRemoveGet:  (req, res) => {
  wishHelpers.removeWishListProduct(req.params.id, req.session.user._id).then((response) => {
    res.json({ status: true })
  })
},


SomethingsWrong: (req,res)=>{
  res.render('SomethingWentwrong')
},

/////////////////////////////Search Page/////////////////////////////

searchProductGet: async(req,res)=>{
  res.render('user/search')
},

searchProductPost: async(req,res)=> {
  let users=req.session.user
  let category = await categoryHelpers.getAllCategory()
  if(req.session.user){
  let person = await userHelpers.getUser(req.session.user._id)
  // let userss=req.session.user
  let cartCount=await cartHelpers.getCartCount(req.session.user._id)
  let wishCount=await wishHelpers.getWishListCount(req.session.user._id)
  productHelpers.searchProduct(req.body.search).then((products)=>{
    console.log('proooo = ', products);
    res.render('user/SearchedProducts', { user: true ,products,category,users,cartCount, wishCount,person})
  }) 
}else{
  let cartCount=0
  let wishCount=0
  let person = 0
  productHelpers.searchProduct(req.body.search).then((products)=>{
    console.log('proooo = ', products);
    res.render('user/SearchedProducts', { user: true ,products,category,users,cartCount, wishCount,person})
  }) 
  }
},
  ////////////////////////////////////////////// LogOut /////////////////////////////////////////////////////////////

logOutGet: (req, res) => {
    req.session.loggedIn = null
    req.session.user = null
    res.redirect('/')
  },
  
  
  };

  module.exports = userController;