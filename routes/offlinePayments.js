const express = require("express");
const route = express.Router();
const mysql = require("mysql");
const { ensureAuthenticateds } = require("../config/adminAuth"); //Login Authenticator

var success = [];

route.get('/',ensureAuthenticateds, (req,res)=>{
    res.render("offlinePayments", {
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
    res.render("offlinePayments", {
      user: req.user,
      results: results[0],
      displayDetails: "block",
      noResults: "none",
      success
    });
  });
});


route.post('/savePayment',ensureAuthenticateds,(req,res)=>{
  var amount;
  var packageOpted;
  var duration = req.body.duration;
  duration = parseInt(duration);
  var balance;
  var speed = req.body.speed;

  var startDate = req.body.startDate;
  var paymentDue = req.body.paymentDue;
  if(paymentDue == undefined){
    paymentDue = 0;
  }else{
    paymentDue = 1;
  }
  var paymentDate = req.body.paymentDate;



  var partspay = paymentDate.split('-');
  var paydate = new Date(partspay[0], partspay[1] - 1, partspay[2]); 

  var parts =startDate.split('-');
  var mydate = new Date(parts[0], parts[1] - 1, parts[2]); 
  var vardate = new Date(parts[0], parts[1] - 1, parts[2]); 


  
  if(req.body.balanceField){
    balance = req.body.balanceField;
  }else{
    balance = 0;
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
    // dateExpiry.setDate(dateExpiry.getDate() + (30 * duration));
    dateExpiry.setMonth(dateExpiry.getMonth() + duration);

    
    let all_payment = `INSERT INTO all_payment SET ?`;
    let all_values = {
        Name : results[0].Name,
        Address : results[0].Address,
        Mobile : results[0].Mobile,
        Stb : results[0].Stb,
        Amount : totalAmount,
        Mode : 'Offline',
        isDue : paymentDue,
        validity : duration,
        speed : speed,
        datePaid : paydate,
        dateStart : mydate,
        dateExpiry : dateExpiry
    };
    db.query(all_payment, all_values, (err,allpays)=>{

      let listPay = `UPDATE infos SET ? WHERE cid = "${results[0].cid}"`;
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
      if(paymentDue == 1 && balance == 0){
        listValues['status'] = 0;
      }
      listValues['validity'] = duration;
      listValues['speed'] = speed;
      listValues['isDue'] = paymentDue;
      listValues['lastAmountId'] = allpays.insertId;
      db.query(listPay,listValues, (err,results)=>{
        if(err){
          console.log(err);
        }
        req.session.save(function(err){
            req.flash('success_msg', 'Paid Successfully!');
            res.redirect('/adminPanel/offlinePayments');
  
        });
      });      

    });



    // let listPay = `UPDATE infos SET ? WHERE Stb = "${results[0].Stb}"`;
    // let listValues = {};
    // for(var i =0; i<duration; i++){
    //     listValues[month[mydate.getMonth() + i]] = amount/duration;
    // }
    // listValues['dateExpiry'] = dateExpiry;
    // listValues['datePaid'] = mydate;
    // if(balance > 0){
    //   listValues['status'] = 2;
    //   listValues['balance'] = balance;
    // }else{
    //   listValues['status'] = 1;
    // }
    // listValues['validity'] = duration;
    // listValues['speed'] = speed;
    // db.query(listPay,listValues, (err,results)=>{
    //   if(err){
    //     console.log(err);
    //   }
    // });



    // let all_payment = `INSERT INTO all_payment SET ?`;
    // let all_values = {
    //     Name : results[0].Name,
    //     Address : results[0].Address,
    //     Mobile : results[0].Mobile,
    //     Stb : results[0].Stb,
    //     Amount : totalAmount,
    //     Mode : 'Offline',
    //     validity : duration,
    //     speed : speed,
    //     dateStart : mydate,
    //     dateExpiry : dateExpiry
    // };
    // db.query(all_payment, all_values, (err,results)=>{
    //   if(!err){
    //     req.flash('success_msg', 'Saved Successfully!');
    //     res.redirect('/adminPanel/offlinePayments');
    //   }
    // });


  });

});


module.exports = route;