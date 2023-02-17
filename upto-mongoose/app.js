const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res,next) => {
    User.findById("63ecd33a9d5a76ffb3007983")
    .then(user => {
        req.user = user;
        next()
    })
    .catch(err => {
        console.log(err);
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect(
    'mongodb+srv://srikanth19:1858260338@cluster0.5sgelp9.mongodb.net/shop?retryWrites=true&w=majority'
)
.then(result => {
    // console.log(result);
    User.findOne()
    .then(user => {
        if(!user) {
            const user = new User({
                name: "srikanth",
                email: "sri@gmail.com",
                cart: {
                    items: []
                }
            });   
            user.save();
        }
    })

    app.listen(3000, () => {
        console.log("Server is running at 3000 port and connected to shop DB");
    });
})
.catch(err => {
    console.log(err);
})

