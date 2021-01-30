const express = require("express");
const route = express.Router();
const mysql = require("mysql");
const { ensureAuthenticateds } = require("../config/adminAuth"); //Login Authenticator

var success = [];

route.get('/',ensureAuthenticateds, (req,res)=>{
    res.render("offlineComplaints", {
        user : req.user,
        results : "none",
        displayDetails : "none",
        success
    });
});

route.post("/",ensureAuthenticateds, (req, res) => {
  stb = req.body.stb;
  let sql = `SELECT * FROM infos WHERE stb = "${stb}"`;
  db.query(sql, (err, results) => {
    res.render("offlineComplaints", {
      user: req.user,
      results: results[0],
      displayDetails: "block",
      noResults: "none",
      success
    });
  });
});


route.post('/saveComplaint',ensureAuthenticateds,(req,res)=>{

  db.query(`SELECT * FROM infos WHERE Stb = "${req.body.Stb}"`,(err,results)=>{
    let sql = `INSERT INTO complaint SET ?`;
    let values = {
      Name : results[0].Name,
      Address : results[0].Address,
      Mobile : results[0].Mobile,
      Stb : results[0].Stb,
      Mail : 'Offline',
      Error : req.body.error,
      Msg : req.body.msg
    };
    db.query(sql, values, (err,results)=>{
      if(!err){
        req.flash('success_msg', 'Saved Successfully!');
        res.redirect('/adminPanel/offlineComplaints');
      }
    });
  });

});


module.exports = route;