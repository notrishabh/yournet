const express = require('express');
const route = express.Router();
const mysql = require("mysql");
const { ensureAuthenticateds } = require("../config/adminAuth"); //Login Authenticator

var success = [];


route.get('/', ensureAuthenticateds, (req,res)=>{
    let sql = `SELECT * FROM region`;
    db.query(sql, (err,results)=>{
        res.render('region', {
            user : req.user,
            results : results,
            success
        })
    });
});

route.post('/add',ensureAuthenticateds,(req,res)=>{

      let sql = `INSERT INTO region SET ?`;
      let values = {
        region_name : req.body.region_name,
      };
      db.query(sql, values, (err,results)=>{
        if(!err){
          req.flash('success_msg', 'Added Successfully!');
          res.redirect('/adminPanel/region');
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