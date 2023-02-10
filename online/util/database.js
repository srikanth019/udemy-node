const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db; 

const mongoConnect = (callBack) => {
    MongoClient
    .connect('mongodb+srv://srikanth19:1858260338@cluster0.5sgelp9.mongodb.net/shop?retryWrites=true&w=majority')
    .then(client => {
        console.log('CONNECTED');
        _db = client.db()
        callBack();
    })
    .catch(err => {
        console.log(err);
        throw  err;
    });
}

const getDb = () => {
    if (_db) {
        return _db; 
    }
    throw "No Databadse Found";
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;