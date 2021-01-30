const express = require("express");
const route = express.Router();
const mysql = require("mysql");
const { ensureAuthenticateds } = require("../config/adminAuth"); //Login Authenticator

var success = [];

route.get('/',ensureAuthenticateds, (req,res)=>{
    res.render("workerPanel/paymentEntry", {
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
    res.render("workerPanel/paymentEntry", {
      user: req.user,
      results: results[0],
      displayDetails: "block",
      noResults: "none",
      success
    });
  });
});


// route.post('/savePayment',ensureAuthenticateds,(req,res)=>{
//   var amount;
//   var packageOpted;
//   if(req.body.exampleField){
//     amount = req.body.exampleField;
//   }else{
//     amount = req.body.exampleRadios;
//   }
//   if(amount == "153"){
//     packageOpted = "Basic";
//   } else if(amount == "275"){
//     packageOpted = "Silver";
//   }else if(amount == "360"){
//     packageOpted = "Gold";
//   }else if(amount == "454"){
//     packageOpted = "Diamond";
//   }else{
//     packageOpted = "Custom";
//   }
//  //ADD QUERY FOR INSERTING in all_info in respective month in production
//   db.query(`SELECT * FROM infos WHERE Stb = "${req.body.Stb}"`,(err,results)=>{
//     let sql = `INSERT INTO offline_payment SET ?`;
//     let values = {
//       Name : results[0].Name,
//       Address : results[0].Address,
//       Mobile : results[0].Mobile,
//       Stb : results[0].Stb,
//       Amount : amount,
//       packageOpted : packageOpted
//     };
//     db.query(sql, values, (err,results)=>{
//       if(!err){
//         req.flash('success_msg', 'Saved Successfully!');
//         res.redirect('/workerPanel/paymentEntry');
//       }
//     });
//     var d = new Date();
//     var month = new Array();
//     month[0] = "January";
//     month[1] = "February";
//     month[2] = "March";
//     month[3] = "April";
//     month[4] = "May";
//     month[5] = "June";
//     month[6] = "July";
//     month[7] = "August";
//     month[8] = "September";
//     month[9] = "October";
//     month[10] = "November";
//     month[11] = "December";
              
//     var monthName = month[d.getMonth()];
//     var dateExpiry = new Date();
//     dateExpiry.setDate(dateExpiry.getDate() + 30);

//     // let listPay = `UPDATE infos SET ${monthName}="${amount}", datePaid = now(), ?  WHERE Stb = "${results[0].Stb}"`;
//     // let listValues = {
//     //     dateExpiry : dateExpiry
//     // };
//     // db.query(listPay, listValues, (err,results)=>{
//     // });

//     let all_payment = `INSERT INTO all_payment SET ?`;
//     let all_values = {
//         Name : results[0].Name,
//         Address : results[0].Address,
//         Mobile : results[0].Mobile,
//         Stb : results[0].Stb,
//         Amount : amount,
//         Mode : 'Offline',
//         dateExpiry : dateExpiry
//     };
//     db.query(all_payment, all_values, (err,results)=>{
//     });


//   });

// });

route.post('/savePayment',ensureAuthenticateds,(req,res)=>{
  var amount;
  var packageOpted;
  var duration = req.body.duration;

  if(req.body.exampleField){
    amount = req.body.exampleField;
  }else{
    amount = req.body.exampleRadios;
  }
  if(amount == "153"){
    packageOpted = "Basic";
  } else if(amount == "275"){
    packageOpted = "Silver";
  }else if(amount == "360"){
    packageOpted = "Gold";
  }else if(amount == "454"){
    packageOpted = "Diamond";
  }else{
    packageOpted = "Custom";
  }

  var totalAmount = amount * duration;


  db.query(`SELECT * FROM infos WHERE Stb = "${req.body.Stb}"`,(err,results)=>{
    let sql = `INSERT INTO offline_payment SET ?`;
    let values = {
      Name : results[0].Name,
      Address : results[0].Address,
      Mobile : results[0].Mobile,
      Stb : results[0].Stb,
      Amount : totalAmount,
      packageOpted : packageOpted
    };
    db.query(sql, values, (err,results)=>{
      if(!err){
        req.flash('success_msg', 'Saved Successfully!');
        res.redirect('/workerPanel/paymentEntry');
      }
    });
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
    var dateExpiry = new Date();
    dateExpiry.setDate(dateExpiry.getDate() + (30 * duration));


    let listPay = `UPDATE infos SET ?, datePaid = now() WHERE Stb = "${results[0].Stb}"`;
    let listValues = {};
    for(var i =0; i<duration; i++){
        listValues[month[d.getMonth() + i]] = amount;
    }
    listValues['dateExpiry'] = dateExpiry;
    listValues['status'] = 1;
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
        dateExpiry : dateExpiry
    };
    db.query(all_payment, all_values, (err,results)=>{
    });


  });

});



module.exports = route;