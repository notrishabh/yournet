const express = require("express");
const route = express.Router();
const mysql = require("mysql");
const { ensureAuthenticateds } = require("../config/adminAuth"); //Login Authenticator



route.get("/today", ensureAuthenticateds, (req, res) => {
  var today = new Date();
  var dd = String(today.getDate());
  var mm = String(today.getMonth() + 1);
  var yyyy = String(today.getFullYear());

  if (mm.length < 2) 
        mm = '0' + mm;
  if (dd.length < 2) 
      dd = '0' + dd;

  today = yyyy + "-" + mm + "-" + dd;

  let sql = `SELECT * FROM all_payment WHERE DATE_FORMAT(datePaid, "%Y-%m-%d" ) = "${today}" AND isDue = 0 ORDER BY id DESC`;
  db.query(sql, (err, results) => {
    let sql = `SELECT SUM(Amount) AS total FROM all_payment WHERE DATE_FORMAT(datePaid, "%Y-%m-%d" ) = "${today}" AND isDue = 0`;
    db.query(sql, (err,rus)=>{
      var totalToday = rus[0].total;
      res.render("payments/today", {
      user: req.user,
      results: results,
      today: today,
      sum : totalToday
    });
    });

  });
});

route.get("/thisMonth", ensureAuthenticateds, (req, res) => {
  var d = new Date();
  var month = new Array();
  month[0] = "January";
  month[1] = "February";
  month[2] = "March";
  month[3] = "April";
  month[4] = "May";
  month[5] = "June";
  month[6] = "July";
  month[7] = "August";
  month[8] = "September";
  month[9] = "October";
  month[10] = "November";
  month[11] = "December";

  var monthNumber = d.getMonth() + 1;
  var monthName = month[d.getMonth()];

  let sql = `SELECT * FROM all_payment WHERE month(datePaid) = "${monthNumber}" AND isDue = 0 ORDER BY id DESC`;
  db.query(sql, (err, results) => {
    res.render("payments/thisMonth", {
      user: req.user,
      month: monthName,
      results: results,
    });
  });
});

route.get('/thisYear', ensureAuthenticateds, (req,res)=>{
    var d = new Date();
    var year = d.getFullYear();

    let sql = `SELECT * FROM all_payment WHERE year(datePaid) = "${year}" AND isDue = 0 ORDER BY id DESC`;
    db.query(sql, (err,results)=>{
        res.render('payments/thisYear', {
            user : req.user,
            year : year,
            results : results
        });
    });
    
});

// route.get('/offline', ensureAuthenticateds, (req,res)=>{
//   let sql = `SELECT * FROM offline_payment ORDER BY id DESC`;
//   db.query(sql, (err,results)=>{
//     res.render('payments/offline', {
//       user : req.user,
//       results : results
//     })
//   });
// });

route.post('/today/delete', ensureAuthenticateds, (req,res)=>{
var pid = req.body.pid;
var stb = req.body.stb;

var month = new Array();
month[0] = "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";
month[12] = "January";
month[13] = "February";
month[14] = "March";
month[15] = "April";
month[16] = "May";
month[17] = "June";
month[18] = "July";
month[19] = "August";
month[20] = "September";
month[21] = "October";
month[22] = "November";
month[23] = "December";

let firstsql = `SELECT * FROM all_payment WHERE id = "${pid}"`;

db.query(firstsql, (err,results)=>{
  var monthStart = results[0].dateStart.getMonth();
  var monthExpiry = results[0].dateExpiry.getMonth();
  var validity = results[0].validity;
  
  let sql = `DELETE FROM all_payment WHERE id = "${pid}"`;
  db.query(sql, (err,paydel)=>{
    if(!err){
      req.session.save((err)=>{
        if(!err){
          req.flash('error_msg', 'Payment Removed Successfully!');
          res.redirect("/adminPanel/payments/today");
        }
      });
      let lolsql = `SELECT * FROM all_payment WHERE Stb = "${stb}" ORDER by id DESC LIMIT 1`;
      db.query(lolsql, (err,lols)=>{
        let values = {};
        let infosql = `UPDATE infos SET ? WHERE Stb = "${stb}"`;
        for(var i = 0; i < validity; i++){
          values[month[monthStart + i]] = 0;
        }
        if(lols.length > 0){
          values['dateExpiry'] = lols[0].dateExpiry;
          values['datePaid'] = lols[0].dateStart;
          values['lastAmountId'] = lols[0].id;
          values['validity'] = lols[0].validity;
          values['speed'] = lols[0].speed;
        }else{
          values['dateExpiry'] = 0;
          values['datePaid'] = 0;
          values['lastAmountId'] = 0;
          values['validity'] = 0;
          values['speed'] = 0;
      
        }
        db.query(infosql, values, (err,boi)=>{
        });
      });
      if(results[0].bid != 0){
        let billdelsql = `DELETE FROM billing WHERE id = "${results[0].bid}"`;
        db.query(billdelsql, (err,billdel)=>{
        });

      }
  }else{
      req.flash('error_msg', 'ERROR');
      res.redirect("/adminPanel/payments/today");
  }
  });
});
});

route.post('/thismonth/delete', ensureAuthenticateds, (req,res)=>{
  var pid = req.body.pid;
  var stb = req.body.stb;
  
  var month = new Array();
  month[0] = "January";
  month[1] = "February";
  month[2] = "March";
  month[3] = "April";
  month[4] = "May";
  month[5] = "June";
  month[6] = "July";
  month[7] = "August";
  month[8] = "September";
  month[9] = "October";
  month[10] = "November";
  month[11] = "December";
  month[12] = "January";
  month[13] = "February";
  month[14] = "March";
  month[15] = "April";
  month[16] = "May";
  month[17] = "June";
  month[18] = "July";
  month[19] = "August";
  month[20] = "September";
  month[21] = "October";
  month[22] = "November";
  month[23] = "December";
  
  let firstsql = `SELECT * FROM all_payment WHERE id = "${pid}"`;
  
  db.query(firstsql, (err,results)=>{
    var monthStart = results[0].dateStart.getMonth();
    var monthExpiry = results[0].dateExpiry.getMonth();
    var validity = results[0].validity;
    
    let sql = `DELETE FROM all_payment WHERE id = "${pid}"`;
    db.query(sql, (err,paydel)=>{
      if(!err){
        req.session.save((err)=>{
          if(!err){
            req.flash('error_msg', 'Payment Removed Successfully!');
            res.redirect("/adminPanel/payments/thismonth");
          }
        });
        let lolsql = `SELECT * FROM all_payment WHERE Stb = "${stb}" ORDER by id DESC LIMIT 1`;
        db.query(lolsql, (err,lols)=>{
          let values = {};
          let infosql = `UPDATE infos SET ? WHERE Stb = "${stb}"`;
          for(var i = 0; i < validity; i++){
            values[month[monthStart + i]] = 0;
          }
          if(lols.length > 0){
            values['dateExpiry'] = lols[0].dateExpiry;
            values['datePaid'] = lols[0].dateStart;
            values['lastAmountId'] = lols[0].id;
            values['validity'] = lols[0].validity;
            values['speed'] = lols[0].speed;
          }else{
            values['dateExpiry'] = 0;
            values['datePaid'] = 0;
            values['lastAmountId'] = 0;
            values['validity'] = 0;
            values['speed'] = 0;
        
          }
          db.query(infosql, values, (err,boi)=>{
          });
        });
        if(results[0].bid != 0){
          let billdelsql = `DELETE FROM billing WHERE id = "${results[0].bid}"`;
          db.query(billdelsql, (err,billdel)=>{
          });
  
        }
    }else{
        req.flash('error_msg', 'ERROR');
        res.redirect("/adminPanel/payments/thismonth");
    }
    });
  });
  });

module.exports = route;
