const express = require('express');
const route = express.Router();
const mysql = require("mysql");
const {ensureAuthenticateds} = require('../config/adminAuth');    //Login Authenticator

var success = [];

route.get("/",ensureAuthenticateds,(req,res)=>{
    let sql = `SELECT * FROM infos WHERE status = 2`;

    db.query(sql,(err,results)=>{
        res.render('balanceList', {
            user : req.user,
            results : results,
            success
        });
    });

});

route.post('/pay', ensureAuthenticateds, (req,res)=>{
    var balance = req.body.balance;
    var values = {};
    let sql = `SELECT * FROM infos WHERE Stb = "${req.body.Stb}"`;
    db.query(sql, (err,results)=>{
        let sql = `UPDATE infos SET ? WHERE Stb = "${req.body.Stb}"`;
        if(results[0].balance == balance){
            values = {
                balance : 0,
                status : 1
            };
        }else{
            values = {
                balance : results[0].balance - balance,
                status : 2
            }
        }
        db.query(sql, values, (err,resultss)=>{
            if(err){
                console.log(err);
                req.flash('error_msg', 'Error Saving');
                res.redirect('/adminPanel/balanceList');
            }else{
                req.flash('success_msg', 'Saved Successfully!');
                res.redirect('/adminPanel/balanceList');
            }
        });
    });

});



module.exports = route;