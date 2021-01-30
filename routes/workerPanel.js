const express = require('express');
const route = express.Router();
const mysql = require("mysql");
const {ensureAuthenticateds} = require('../config/adminAuth');    //Login Authenticator


route.get('/', ensureAuthenticateds, (req,res)=>{
    res.render('workerPanel/dashboard', {
        user : req.user
    });
});



route.get('/logout', (req,res)=>{
    req.logOut();
    req.flash('success_msg', 'You have logged out');
    res.redirect('/adminLogin');
});

route.use('/paymentEntry', require('./paymentEntry'));
route.use('/unpaidList', require('./unpaidListWorker'));




module.exports = route;