var db = require('../config/connection')
var collection = require('../config/collection');
var objectId = require('mongodb').ObjectId
var moment = require('moment');

module.exports = {

    addProductOffer: (data) => {
      console.log("{{{{{}}}}}}{{{{{}}}}}}}",data);
        return new Promise(async (resolve, reject) => {
          let exist = await db
            .get()
            .collection(collection.PRODUCTOFFER_COLLECTION)
            .findOne({ product: data.product });
          if (exist) {
            reject();
          } else {
            console.log('1818');
            data.startDateIso = new Date(data.starting);
            data.endDateIso = new Date(data.expiry);
            data.productOfferPercentage = parseInt(data.productOfferPercentage);
            let exist2 = await db
              .get()
              .collection(collection.PRODUCT_COLLECTION)
              .findOne({ Name: data.product, offer: { $exists: true } });
              console.log("Exist cheyundo?????",exist2)
            if (exist2) {
              console.log('2828282');
              reject();
            } else {
              console.log('3113131');
              db.get()
                .collection(collection.PRODUCTOFFER_COLLECTION)
                .insertOne(data)
                .then(() => {
                  resolve();
                });
            }
          }
        });
      },

    getAllProductOffer: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let AllCatOffers = await db.get().collection(collection.PRODUCTOFFER_COLLECTION).find().toArray()
                resolve(AllCatOffers)
            } catch {
                resolve(0)
            }
        })
    },
    getProductOfferDetails: (id) => {
        return new Promise((resolve, reject) => {
            try {


                db.get().collection(collection.PRODUCTOFFER_COLLECTION).findOne({ _id: objectId(id) }).then((response) => {
                    resolve(response)
                })
            } catch {
                resolve(0)
            }
        })

    },

    getProductOffer: (id) => {
        return new Promise((resolve, reject) => {
            try {


                db.get().collection(collection.PRODUCTOFFER_COLLECTION).findOne({ _id: objectId(id) }).then((response) => {
                    resolve(response)
                })
            } catch {
                resolve(0)
            }
        })

    },
    editProdOffer: (proOfferId, data) => {
        return new Promise((resolve, reject) => {
          db.get()
            .collection(collection.PRODUCTOFFER_COLLECTION)
            .updateOne(
              { _id: objectId(proOfferId) },
              {
                $set: {
                    product: data.product,
                    starting: data.starting,
                    expiry: data.expiry,
                    productOfferPercentage: parseInt(data.productOfferPercentage),
                    startDateIso: new Date(data.starting),
                    endDateIso: new Date(data.expiry),
                },
              }
            )
            .then(async () => {
              let products = await db
                .get()
                .collection(collection.PRODUCT_COLLECTION)
                .find({ product: data.product, offer: { $exists: true } })
             
              if (products) {
               
                  await db
                    .get()
                    .collection(collection.PRODUCT_COLLECTION)
                    .updateOne(
                      { _id: objectId(products._id) },
                      {
                        $set: {
                          price: products.actualPrice,
                        },
                        $unset: {
                          offer: "",
                          productOfferPercentage: "",
                          actualPrice: "",
                        },
                      }
                    )
                    .then(() => {
                      resolve();
                    });
           
              } else {
                resolve();
              }
              resolve();
            });
        });
      },
      deleteProdOffer: (proOfferId) => {
        console.log("Ivde etheeknn",proOfferId);
        return new Promise(async (resolve, reject) => {
          let productOfferPercentage = await db
            .get()
            .collection(collection.PRODUCTOFFER_COLLECTION)
            .findOne({ _id: objectId(proOfferId) });
            console.log("////////%%%%%/",productOfferPercentage);
          let pname = productOfferPercentage.product;
          console.log("/////pnme/////",pname);
          let product = await db
            .get()
            .collection(collection.PRODUCT_COLLECTION)
            .findOne({ Name: pname });
            console.log("/////////////////////",product);
          db.get()
            .collection(collection.PRODUCTOFFER_COLLECTION)
            .deleteOne({ _id: objectId(proOfferId) })
            .then(() => {
              db.get()
                .collection(collection.PRODUCT_COLLECTION)
                .updateOne(
                  { Name: pname },
                  {
                    $set: {
                      price: product.actualPrice,
                    },
                    $unset: {
                      offer: "",
                      productOfferPercentage: "",
                      actualPrice: "",
                    },
                  }
                )
                .then(() => {
                  resolve();
                });
            });
        });
      },
 
    startProductOffer: (date) => {
      console.log('iiiiiiiiiiiiiiiiiiiiii');
        let proStartDateIso = new Date(date);
        console.log(proStartDateIso,"///////////dare///////////");
        return new Promise(async (resolve, reject) => {
            let data = await db
                .get().collection(collection.PRODUCTOFFER_COLLECTION)
                .findOne({ startDateIso: { $lte: proStartDateIso } })
                console.log('jjjjj 181',data);
            if (data) {
              console.log(data, "bannnnnnnnnn");
                    let product = await db
                        .get()
                        .collection(collection.PRODUCT_COLLECTION)
                        // .findOne({  Name: data.product, offer: false  });
                        .findOne({  Name: data.product ,offer : {$ne: true}  });
                        console.log('jjjjj 187',product);
                    if (product) {
                        let actualPrice = product.price;
                        let newPrice = (((actualPrice) * (data.productOfferPercentage)) / 100);
                        newPrice = newPrice.toFixed();
                        db.get()
                            .collection(collection.PRODUCT_COLLECTION)
                            .updateOne(
                                { _id: objectId(product._id) },
                                {
                                    $set: {
                                        actualPrice: actualPrice,
                                        price: (actualPrice - newPrice),
                                        offer: true,
                                        productOfferPercentage: data.productOfferPercentage,
                                    },
                                }
                            );
                        resolve();
                        console.log("get");
                    } else {
                        resolve();
                        console.log("rejected");
                    }
             
            }
            resolve();
        });
    },
    

    // startProductOffer: (date) => {
    //     let startDateIso = new Date(date)
    //     return new Promise(async (resolve, reject) => {
    //         try {

    //             let data = await db.get().collection(collection.PRODUCTOFFER_COLLECTION).find({ startDateIso: { $lte: startDateIso } }).toArray()
    //             if (data.length > 0) {
    //                 await data.map(async (onedata) => {
    //                     let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ product: onedata.Name, offer: { $exists: false } })
    //                     if (product) {
    //                         let actualPrice = parseInt(product.price);

    //                         let newPrice = (((actualPrice) * (onedata.productOfferPercentage)) / 100)
    //                         newPrice = newPrice.toFixed()
    //                         console.log(actualPrice, newPrice);
    //                         db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(product._id) },
    //                             {
    //                                 $set: {
    //                                     actualPrice: actualPrice,
    //                                     price: (actualPrice - newPrice),
    //                                     offer: true,
    //                                     productOfferPercentage: onedata.productOfferPercentage
    //                                 }
    //                             })

    //                     }
    //                 })
    //                 resolve()

    //             } else {
    //                 resolve()
    //             }
    //         } catch {
    //             resolve(0)
    //         }
    //     })
    // }
}