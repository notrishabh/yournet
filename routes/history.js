const express = require("express");
const route = express.Router();
const mysql = require("mysql");
const { ensureAuthenticateds } = require("../config/adminAuth"); //Login Authenticator

var success = [];

route.get('/', ensureAuthenticateds, (req,res)=>{
    res.render('history', {
        user : req.user,
        results : "none",
        displayDetails : "none",
        success
    });
});


route.post("/",ensureAuthenticateds, (req, res) => {
    var stb = req.body.stb;
    var status = 0;
    var suspended = 0;
    var brand_id = 0;
    var validity = 0;
    var speed = 0;
    let sql = `SELECT * FROM all_payment WHERE stb = "${stb}"`;
    db.query(sql, (err, results) => {
      let sql = `SELECT SUM(Amount) AS sum FROM all_payment WHERE stb = "${stb}"`;
      db.query(sql, (err, sumTotal) => {   
        let sql = `SELECT suspended, status, brand_id, validity, speed FROM infos WHERE stb = "${stb}"`;
        db.query(sql , (err,infos) =>{
          if(infos.length > 0){
            status = infos[0].status;
            suspended = infos[0].suspended;
            brand_id = infos[0].brand_id;
            validity = infos[0].validity;
            speed = infos[0].speed;
          }
          let sql = `SELECT brand_name FROM brand WHERE id = ${brand_id}`;
            db.query(sql, (err,brand)=>{
                res.render("history", {
                user: req.user,
                results: results,
                sumTotal: sumTotal,
                status : status,
                suspended: suspended,
                brand: brand,
                validity: validity,
                speed: speed,
                displayDetails: "block",
                noResults: "none",
                success
              });
            });
   
        })     
        
      })
      
    });
  });

  route.post("/unsuspend", ensureAuthenticateds, (req,res)=>{
    let sql = `UPDATE infos SET suspended = 0 WHERE Stb = "${req.body.stb}"`;
    db.query(sql, (err,results)=>{
        if(!err){
            req.flash('success_msg', 'Stb Unsuspended Successfully!');
            res.redirect('/adminPanel/history');
          }else{
            req.flash('error_msg', 'Error unsuspending STB');
            res.redirect('/adminPanel/history');
          }    
    });
  });


module.exports = route;