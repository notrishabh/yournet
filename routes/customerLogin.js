const express = require('express');
const passport = require('passport');
const route = express.Router();
var errors = []; //Flash errors



route.get('/', (req,res)=>{
    res.render('customerLogin', {
        errors
    });
});

route.get('/contactus', (req,res)=>{
    res.render('contactus', {
    });
});

route.post('/', (req,res, next)=>{
    passport.authenticate('customer-local', {
        successRedirect: '/customerPanel',
        failureRedirect: '/',
        failureFlash: true
    })(req,res,next);
});




module.exports = route;