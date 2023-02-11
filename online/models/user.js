const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId;
const { getDb } = require('../util/database');

class User {
    constructor(username, email, cart, id) {
        this.username = username;
        this.email = email;
        this.cart = cart;//cart = { items: [ { productId : ?, quantity: ? }] }
        this._id = id;
    }

    save(){
        const db = getDb();
        return db
        .collection('users')
        .insertOne(this);
        // .then(result => {
        //     console.log(result);
        // })
        // .catch(err => {
        //     console.log(err);
        // })
    }

    addToCart(product) {
        const cartProductIndex = this.cart.items.findIndex(cp => {
            //DOUBT
            return cp.productId == product._id.toString();
        })

        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];
        // console.log(updatedCartItems);

        if (cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({ productId: new ObjectId(product._id), quantity: newQuantity });
        }

        const updatedCart = { items: updatedCartItems };
        const db = getDb();
        return db
        .collection('users')
        .updateOne(
            {_id: new ObjectId(this._id)},
            {$set: {cart: updatedCart}}
        );
    }

    getCart() {
        const db = getDb();
        const productsIds = this.cart.items.map(i => {
            return i.productId;
        });
        return db
        .collection('products')
        .find({_id : {$in: productsIds}})
        .toArray()
        .then(products => {
            return products.map(p => {
               return {...p,
                    quantity: this.cart.items.find(i => {
                        return i.productId == p._id.toString();
                    }).quantity
                };
            });
        });
    }

    deleteItemFromCart(prodId) {
        const db = getDb();
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId != prodId.toString();
        })
        return db
        .collection('users')
        .updateOne(
            {_id: new ObjectId(this._id)},
            {$set: {cart: {items: updatedCartItems}}}
        );
    }

    addOrder() {
    const db = getDb();
    return this.getCart()
        .then(cartProducts => { //here we get [ of products ]
            const order = {
                items: cartProducts,
                user: {
                    _id: new ObjectId(this._id),
                    name: this.name 
                }
            };
            return db.collection('orders').insertOne(order);
        })
        .then(result => {
            this.cart = { items: [] };
            return db
            .collection('users')
            .updateOne({_id: new ObjectId(this._id)}, { $set: {cart: { items: [] } } } );
        })
        .catch(err => {
            console.log(err);
        });
    }

    getOrders() {
        const db = getDb();
        return db.collection('orders')
        .find({'user._id': new ObjectId(this._id) } )
        .toArray();
    }

    static findById(userId) {
        const db = getDb();
        return db
        .collection('users')
        // .findOne( { _id: new mongodb.ObjectId(userId) })
        .findOne( { _id: new ObjectId(userId) })
        .then(user => {
            return user;
        })
        .catch(err => {
            console.log(err);
        });
    }
}

module.exports = User;

