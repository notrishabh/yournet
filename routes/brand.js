const express = require('express');
const route = express.Router();
const mysql = require("mysql");
const { ensureAuthenticateds } = require("../config/adminAuth"); //Login Authenticator

var success = [];


route.get('/', ensureAuthenticateds, (req,res)=>{
    let sql = `SELECT * FROM brand`;
    db.query(sql, (err,results)=>{
        res.render('brand', {
            user : req.user,
            results : results,
            success
        })
    });
});

route.post('/add',ensureAuthenticateds,(req,res)=>{

      let sql = `INSERT INTO brand SET ?`;
      let values = {
        brand_name : req.body.brand_name,
      };
      db.query(sql, values, (err,results)=>{
        if(!err){
          req.flash('success_msg', 'Added Successfully!');
          res.redirect('/adminPanel/brand');
        }
      });
  
  });

// route.post('/delete',ensureAuthenticateds,(req,res)=>{
//     var id = req.body.id;
//     let sql = `DELETE FROM region WHERE id=${id}`;
//     db.query(sql, (err,results)=>{
//       if(!err){
//         req.flash('error_msg', 'Region Deleted Successfully!');
//         res.redirect('/adminPanel/region');
//       }
//     });

// });





module.exports = route;