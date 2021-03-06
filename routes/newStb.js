const express = require("express");
const route = express.Router();
const mysql = require("mysql");
const { ensureAuthenticateds } = require("../config/adminAuth"); //Login Authenticator

var success = [];

route.get('/', ensureAuthenticateds,(req,res)=>{
    let sql = `SELECT * FROM region`;
    db.query(sql, (err,regions)=>{
        let sql = `SELECT * FROM brand`;
        db.query(sql, (err,brands)=>{
            res.render('newStb',{
                user : req.user,
                regionList : regions,
                brandList : brands,
                success
            });
        })
        

    });

});

route.post('/add', ensureAuthenticateds, (req,res)=>{
    if(req.body.devPrice === ''){
        req.body.devPrice = 0;
    }
    let sql = `INSERT INTO infos (region_id, brand_id, Name, Address, Mobile, Stb, devName, devPrice, sos) VALUES (${req.body.region}, ${req.body.brand}, "${req.body.name}", "${req.body.address}", "${req.body.mobile}", "${req.body.stb}", "${req.body.devName}", ${req.body.devPrice}, "${req.body.sos}")`;
    // let values = {
    //     region_id : req.body.region,
    //     Name : req.body.name,
    //     Address : req.body.address,
    //     Mobile : req.body.mobile,
    //     Stb : req.body.stb
    // };
    db.query(sql, (err,results)=>{
        if(!err){
            req.flash('success_msg', 'New Connection Added Successfully!');
            res.redirect('/adminPanel/newStb');
        }else{
            console.log(err);
            req.flash('error_msg', 'Error Adding New Connection');
            res.redirect('/adminPanel/newStb');
    
        }
    });
});

module.exports = route;