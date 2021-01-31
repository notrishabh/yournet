const express = require('express');
const route = express.Router();
const mysql = require("mysql");
const {ensureAuthenticateds} = require('../config/adminAuth');    //Login Authenticator
// const Excel = require('exceljs');

var success = [];


// route.get("/",ensureAuthenticateds,(req,res)=>{

//     let sql =   `SELECT COUNT(infos.Stb) AS unpaidConnections, region.id, region.region_name 
//                 FROM infos INNER JOIN region ON infos.region_id = region.id AND status = 0 AND suspended = 0
//                 GROUP BY infos.region_id`;

//     db.query(sql,(err,results)=>{
//         res.render('workerPanel/fullUnpaid', {
//             user : req.user,
//             results : results
//         });
//     });

// });


route.get('/', ensureAuthenticateds,(req,res)=>{
  var d = new Date();
  var month = new Array();
  month[-3] = "October";
  month[-2] = "November";
  month[-1] = "December";
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

  var monthName = month[d.getMonth()];
  var prevMonthName = month[d.getMonth() - 1];
 
  let sql = `SELECT brand.brand_name,brand.id,infos.brand_id,infos.status,infos.Name,infos.Address,infos.Mobile,infos.Stb,infos.validity,infos.speed,infos.dateExpiry,infos.${prevMonthName} AS PrevAmount,infos.balance,infos.${monthName} AS Amount FROM infos INNER JOIN brand ON infos.brand_id = brand.id AND status != 1 AND suspended = 0`;
  db.query(sql, (err,results)=>{
    if(err){
      res.send(err)
    }


      res.render('workerPanel/allRegions', {
          user : req.user,
          results : results,
          success
      });
  });
});

route.post('/pay',ensureAuthenticateds,(req,res)=>{
  var amount;
  var speed = req.body.speed;
  var duration = req.body.duration;
  duration = parseInt(duration);
  var totalBalance = req.body.totalBalance;
  var startDate = req.body.startDate;


  var parts =startDate.split('-');
  var mydate = new Date(parts[0], parts[1] - 1, parts[2]); 
  var vardate = new Date(parts[0], parts[1] - 1, parts[2]); 


  var balance=0;

  if(req.body.balanceField){
    balance += req.body.balanceField;
  }else{
    balance += 0;
  }


  amount = req.body.exampleField;



  var totalAmount = amount;

  db.query(`SELECT * FROM infos WHERE Stb = "${req.body.Stb}"`,(err,results)=>{
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
              
    var monthName = month[d.getMonth()];
    var dateExpiry = vardate;

    dateExpiry.setDate(dateExpiry.getDate() + (30 * duration));
    

    let listPay = `UPDATE infos SET ? WHERE Stb = "${results[0].Stb}"`;
    let listValues = {};
    for(var i =0; i<duration; i++){
        listValues[month[mydate.getMonth() + i]] = amount/duration;
    }
    listValues['dateExpiry'] = dateExpiry;
    listValues['datepaid'] = mydate;

    if(balance > 0){
      listValues['status'] = 2;
      listValues['balance'] = balance;
    }else{
      listValues['status'] = 1;
      listValues['balance'] = 0;
    }
    listValues['validity'] = duration;
    listValues['speed'] = speed;
    db.query(listPay,listValues, (err,results)=>{
      if(err){
        console.log(err);
      }
    });



    let all_payment = `INSERT INTO all_payment SET ?`;
    let all_values = {
        Name : results[0].Name,
        Address : results[0].Address,
        Mobile : results[0].Mobile,
        Stb : results[0].Stb,
        Amount : totalAmount,
        Mode : 'Offline',
        validity : duration,
        speed : speed,
        dateStart : mydate,
        dateExpiry : dateExpiry
    };
    db.query(all_payment, all_values, (err,results)=>{
      req.session.save(function(err){
          req.flash('success_msg', 'Paid Successfully!');
          res.redirect('/workerPanel/unpaidList');

      });

    });


  });

});





module.exports = route;