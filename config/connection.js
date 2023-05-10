const mongoClient=require('mongodb').MongoClient;

const state = {
    db:null
}

module.exports.connect=function(done) {
    const url='mongodb://localhost:27017';
    // const url='mongodb+srv://raeesahmed:724@cluster0.6gbj8pv.mongodb.net';
    
    
    const dbname='sidemen'
// monogo connection code!!
    mongoClient.connect(url, (err, data) => {
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })
}

module.exports.get = function(){
    return state.db;
}