const express = require('express');
const route = express.Router();
const mysql = require("mysql");
const {ensureAuthenticateds} = require('../config/adminAuth');    //Login Authenticator

var success = [];


route.get("/",ensureAuthenticateds,(req,res)=>{
    let sql = `SELECT * FROM infos WHERE suspended = 1`;

    db.query(sql,(err,results)=>{
        res.render('suspendedList', {
            user : req.user,
            results : results,
            success
        });
    });

});

route.post('/remove', ensureAuthenticateds, (req,res)=>{
    let sql = `UPDATE infos SET suspended = 0 WHERE Stb = "${req.body.Stb}"`;
    db.query(sql, (err,results)=>{
        if(!err){
            req.flash('success_msg', 'Stb Unsuspended Successfully!');
            res.redirect('/adminPanel/suspendedList');
          }else{
            req.flash('error_msg', 'Error unsuspending STB');
            res.redirect('/adminPanel/suspendedList');
          }    
    });
});



module.exports = route;