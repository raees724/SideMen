var db=require('../config/connection')
var collection =require('../config/collection')
const { MongoCompatibilityError } = require('mongodb');
const { defaultWorkerPolicies } = require('twilio/lib/jwt/taskrouter/util');
var objectId = require('mongodb').ObjectId
const bcrypt= require('bcrypt')
var signupErr=null
var statuss=null


module.exports={
    doSignup: (userData) => {
        var statuss = null
        return new Promise(async (resolve, reject) => {
            let emailId = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
            let mobile = await db.get().collection(collection.USER_COLLECTION).findOne({ phone: userData.phone })
            if (!emailId) {
                if(!mobile){
                userData.blocked = false
                userData.Password = await bcrypt.hash(userData.Password, 10)
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                    console.log(data);
                    resolve({ status: true })
                })
            }else{
                console.log("The number exist")
                resolve({ statuss:true})
            }
        } else {
                console.log("This email exists")
                resolve({ statusss: true })
            }
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
            console.log(user)
            if (user) {
                if (user.blocked) {
                    response.isblocked = true
                    resolve(response)
                }
                else {
                    bcrypt.compare(userData.Password, user.Password).then((status) => {//checking the password from user and in database 
                        console.log(status, 'st')
                        if (status) {
                            console.log("login success");
                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {
                            console.log("login failed");
                            resolve({ status: false })
                        }
                    })
                }
            } else {
                console.log("no user");
                resolve({ status: false })
            }
        })
    },


    
    verifyPhone:(phone)=>{
        return new Promise(async(resolve, reject) => {
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({phone:phone})
            console.log(user);
            if(user){
                if(user.blocked){
                    reject({blocked:true})
                }else{
                    resolve(user)

                }
            }else{
                reject({nouser:true})
            }
        })
    },


    otpLogin: (userData) => {
        console.log(typeof (userData.phonenumber) + ' phone number that user typed');
        return new Promise(async (resolve, reject) => {
            let userNumber = false
            let number = await db.get().collection(collection.USER_COLLECTION).findOne({ phone: userData.number })
            if (number) {
                resolve({ userNumber: true })
            } else {
                resolve({ userNumber: false })
            }
        })
    },
    verifyOTP: (number) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ phone: number })
            if (user) {
                resolve(user)
            }
        })
    },

    getUser:(userID)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userID) })
            if (user) {
                resolve(user)
            }
        })
    },



    
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(user)
        })
    },

    changeStatus: function (id) {
        return new Promise(async function (resolve, reject) {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(id) })
            if (user.blocked == true) {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
                    $set: {
                        blocked: false
                    }
                }).then(() => {
                    resolve("unblocked")
                })
            } else {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(id) }, {
                    $set: {
                        blocked: true
                    }
                }).then((response) => {
                    resolve("blocked")
                })
            }
        })
    },
    
    
    getUserDetails: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) }).then((user) => {
                resolve(user)
            })
        })
    },
    


    
    


        orderCancel: (ordId) => {
            return new Promise((resolve, reject) => {
                let status = 'cancelled'
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(ordId) }, {
                    $set: {
                        status: status
                    }
                }).then(() => {
                    resolve()
                })
            })
        },

        getAddress:(address,userId)=>{
            let addressDetails ={
             homeaddress:address.housename,
             fullAddress:address.address,
             town:address.town,
             Country:address.country,
             pincode:address.pincode,
             phone:address.phone,
     
            }
            console.log(addressDetails);
            return new Promise(async (resolve, reject) => {
             await db.get().collection(collection.USER_COLLECTION)
             .updateOne({ _id: objectId(userId) },
                 {
                     $push: { allAddressDetails: addressDetails }
     
                 }).then((response) => {
                     resolve()
                 })
     
     
            })
     
     
         },
         getAllAddress: (userId) => {
             return new Promise(async (resolve, reject) => {
                 let address = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
                 resolve(address)
             })
         },
     
         deleteAddress: (addressId) => {
             return new Promise((resolve, reject) => {
                 db.get().collection(collection.USER_COLLECTION).deleteOne({ _id: objectId(addressId) }).then((response) => {
                     resolve(response)
                 })
             })
         },
         getAddressDetails: (addressId) => {
             return new Promise((resolve, reject) => {
                 
                     db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(addressId) }).then((address) => {
                         console.log(address)
                         resolve(address)
                     })
                 
             })
         },
         
         updateProfile: (userID, userDetails) => {
            return new Promise((resolve, reject) => {
                db.get().collection(collection.USER_COLLECTION)
                    .updateOne({ _id: objectId(userID) }, {
                        $set: {
                            Name: userDetails.Name
                        }
                    }).then((response) => {
                        resolve()
                    })
            })
          },
          
          changePassword:(userId,newPassword)=>{
            return new Promise(async(resolve,reject)=>{
                db.get().collection(collection.USER_COLLECTION).updateOne(
                    {_id:objectId(userId)},
                    {
                        $set:{
                            Password:await bcrypt.hash(newPassword,10),
                        }
                    }
                ).then((response)=>{
                    resolve()
                })
            })
          },
        
          orderReturn: (ordId) => {
            return new Promise((resolve, reject) => {
                let status = 'returned'
                db.get().collection(collection.ORDER_COLLECTION).findOneAndUpdate({ _id: objectId(ordId) }, {
                    $set: {
                        status: status
                    }
                }).then((order) => {
    
                    console.log(order, 'eeeeeeeeeeee');
    
                    // db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(order.value.userId) }, {
                    //     $inc: { 'wallet': order.value.total }
                    // })
    
    
    
                    resolve()
                })
            })
        },

          totUsers:()=>{
            return new Promise(async(resolve,reject)=>{
                var totalUsers = await db.get().collection(collection.USER_COLLECTION).count();
                resolve(totalUsers)
            })
           },
           totProducts:()=>{
            return new Promise(async(resolve,reject)=>{
                var totalProducts = await db.get().collection(collection.PRODUCT_COLLECTION).count();
                resolve(totalProducts)
            })
           },
        
           totOrders:()=>{
            return new Promise(async(resolve,reject)=>{
                var totalOrders = await db.get().collection(collection.ORDER_COLLECTION).count();
                resolve(totalOrders)
            })
           },
           
           orderCancel: (ordId) => {
            return new Promise((resolve, reject) => {
                let status = 'cancelled'
                db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(ordId) }, {
                    $set: {
                        status: status
                    }
                }).then(() => {
                    resolve()
                })
            })
        },
     }
     
    