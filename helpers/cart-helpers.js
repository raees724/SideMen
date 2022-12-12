var db=require('../config/connection')
var collection=require('../config/collection')
const {CATEGORY_COLLECTION}=require('../config/collection')
const { response }=require('../app')
var objectId=require('mongodb').ObjectId

module.exports ={

    addToCart: (prodId,userId) =>{
      console.log('addToCart',prodId,'   use id  ',userId);
        let prodObject = {
            item: objectId(prodId),
            quantity:1
        }
        return new Promise (async (resolve,reject)=>{
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user: objectId(userId)})
            if(userCart){
                let ProdExist = userCart.product.findIndex(product => product.item == prodId)
                if (ProdExist != -1){
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId),'product.item':objectId(prodId)},
                    {
                        $inc:{'product.$.quantity':1}
                    }).then(()=>{
                        resolve()
                    })
                }else{
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
                    {
                        $push:{product:prodObject}

                    }).then((response)=>{
                        resolve()
                    })
                }
            
            } else{
                let cartObject ={
                    user : objectId(userId),
                    product :[prodObject]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObject).then((response)=>{
                    resolve()
                })
            }  

        })
    },

    getCartList : (userId) =>{
        return new Promise (async (resolve,reject)=>{
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user: objectId(userId)}
                },
                {
                    $unwind: '$product'
                },
                {
                    $project:{
                        item: '$product.item',
                        quantity: '$product.quantity'
                    }
                },
                {
                    $lookup:{
                        from: collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,
                        product:{ $arrayElemAt:['$product',0]}
                        // product:1
                    }
                }
            ]).toArray()

            if (cartItems.length == 0) {
                resolve()
            } else{
                console.log("//////////////////////////////////",cartItems);
                resolve(cartItems)
            }
        })
    },

    getCartCount : (userId) =>{
        return new Promise(async (resolve,reject)=>{
            let count=0;
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})

            if(cart){
                count = cart.product.length
            }
            resolve(count)
        })
    },

    // changeProductQuantity:(details)=>{
     
    //     details.count=parseInt(details.count)
    //     details.quantity=parseInt(details.quantity)
      
    //     return new Promise((resolve,reject)=>{
    //         if( details.count==-1&& details.quantity==1){
    //              db.get().collection(collection.CART_COLLECTION)
    //         .updateOne({_id: objectId(details.cart), 'product.item': objectId(details.product) },
    //             {
    //                 $pull: {product:{item:objectId(details.product)}  
    //             }
    //             }).then((response) => {
                 
    //                 resolve({status:true})
    //             })
                
    //         }else{
    //             db.get().collection(collection.CART_COLLECTION)
    //                 .updateOne({ _id: objectId(details.cart), 'product.item': objectId(details.product) },
    //                     {
    //                         $inc: { 'product.$.quantity': details.count }// edu cartaan update cheyuunnathe
    //                     }).then((response) => {
                            
    //                         resolve({status:false})
    //                     })

    //         }
           
    //     })
      

    // }, 

    changeProductQuantity: (details) => {
        details.count = parseInt(details.count);
        details.quantity = parseInt(details.quantity);
        return new Promise(async (resolve, reject) => {
          let stockCount = await db
            .get()
            .collection(collection.PRODUCT_COLLECTION)
            .findOne({ _id: objectId(details.product) });
            if(stockCount.stock){
          if (details.quantity == stockCount.stock && details.count == 1) {
            reject({status:true});
          } else if(details.quantity == 3 && details.count == 1) {
            reject({count:true});
          } else{
            if (details.count == -1 && details.quantity == 1) {
              db.get()
                .collection(collection.CART_COLLECTION)
                .updateOne(
                  { _id: objectId(details.cart) },
                  {
                    $pull: { products: { item: objectId(details.product) } },
                  }
                )
                .then(() => {
                  resolve({ removeProduct: true });
                });
            } else {
              db.get()
                .collection(collection.CART_COLLECTION)
                .updateOne(
                  {
                    _id: objectId(details.cart),
                    "product.item": objectId(details.product),
                  },
                  {
                    $inc: { "product.$.quantity": details.count },
                  }
                )
                .then(() => {
                  resolve({ status: true });
                });
            }
          }
        }else{
          reject({noStock:true})
        }
        });
      },

    removeFromCart: (prodId, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },
                {
                    $pull: { product: { item: objectId(prodId) } }
                }).then((response) => {
                  
                    resolve(response)
                })
        })
    },
    getTotalAmount: (userId) => {
        console.log('143');
        return new Promise (async function (resolve, reject) {
            try{
                console.log('147');
                let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match:{user: objectId(userId)}
                    },
                    {
                        $unwind:'$product'
                },
                {
                    $project:{
                        item:'$product.item',
                        quantity:'$product.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField:'_id',
                        as: 'product'
                    }
                },
                {
                    $project:{
                        item:1,
                        quantity:1,
                        product: {$arrayElemAt:['$product',0]}
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity',{'$toInt':'$product.price'}]}}
                    }
                }
                
            ]).toArray()
            console.log('183');
            console.log(total)
            console.log('hgdsstrhxydhfc',total[0].total);
            console.log('hgdsstrhxydhfc',total[0]);
            resolve(total[0].total)
        }catch{
            console.log('189');
            resolve(0)
        }
            // if(total.length == 0){
            //     console.log("1");
            //     resolve(0)
            // } else {
            //     console.log("2");
            //     let ftotal = total[0].total
            //     console.log("hereeee");
            //     ftotal = ftotal.toFixed(0)
            //     console.log(ftotal);
            //     resolve(ftotal)
            // }
            
        })
    },

    getCartProductList:(userId)=>{
        return new Promise (async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            resolve(cart.product)
        })


    },
    
    placeOrder:(order, products,total)=>{
        return new Promise((resolve,reject)=>{
           
            // wallet Comes here
            let status=order['payment-method']==='COD'?'placed':'pending'

            let orderObj={
                deliveryDitails:{
                    homeaddress:order.homeaddress,
                    fullAddress:order.fullAddress,
                    town:order.town,
                    Country:order.country,
                    pincode:order.pincode
                },
                userId:objectId(order.userId),
                paymentMethod:order['payment-method'],
                product:products,
                status:status,
                total:total,
                date:new Date()
                   

                }

                db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                    // db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
                    products.forEach(async (element) => {
                        let product = await db
                            .get()
                            .collection(collection.PRODUCT_COLLECTION)
                            .findOne({ _id: element.item });
                        let pquantity = Number(product.stock);
                        pquantity = pquantity - element.quantity;
                        await db
                            .get()
                            .collection(collection.PRODUCT_COLLECTION)
                            .updateOne(
                                { _id: element.item },
                                {
                                    $set: {
                                        stock: pquantity,
                                    },
                                }
                            );
                    });
                    db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
                    //Wallet Comes Here
                    
                    resolve(response.insertedId)
                })

            
        })
    },

    findCartProdQty: (userId, proId) => {
        return new Promise(async (resolve, reject) => {
          try {
            let userCart = await db
              .get()
              .collection(collection.CART_COLLECTION)
              .aggregate([
                {
                  $match: { user: objectId(userId) },
                },
                {
                  $unwind: "$product",
                },
                {
                  $project: {
                    item: "$product.item",
                    quantity: "$product.quantity",
                  },
                },
                {
                  $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: "item",
                    foreignField: "_id",
                    as: "product",
                  },
                },
                {
                  $match: {
                    item: objectId(proId),
                  },
                },
                {
                  $project: {
                    item: 1,
                    quantity: 1,
                    product: { $arrayElemAt: ["$product", 0] },
                  },
                },
                {
                  $project: {
                    unitprice: { $toInt: "$product.price" },
                    quantity: { $toInt: "$quantity" },
                  },
                },
              ])
              .toArray();
            resolve(userCart[0].quantity);
          } catch {
            resolve(0);
          }
        });
      }
    
}