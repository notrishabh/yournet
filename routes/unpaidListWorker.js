const express = require('express');
const route = express.Router();
const mysql = require("mysql");
const {ensureAuthenticateds} = require('../config/adminAuth');    //Login Authenticator
// const Excel = require('exceljs');

var success = [];


route.get("/",ensureAuthenticateds,(req,res)=>{
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
  
    var monthName = month[d.getMonth()];

    let sql =   `SELECT COUNT(infos.Stb) AS unpaidConnections, region.id, region.region_name 
                FROM infos INNER JOIN region ON infos.region_id = region.id AND status = 0 AND suspended = 0
                GROUP BY infos.region_id`;

    db.query(sql,(err,results)=>{
        res.render('workerPanel/fullUnpaid', {
            user : req.user,
            results : results
        });
    });

});


route.get('/:region_id',ensureAuthenticateds, (req,res)=>{
    var region_id = req.params.region_id;
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
  
    var monthName = month[d.getMonth()];
    let sql = `SELECT region.region_name,infos.Name,infos.Address,infos.Mobile,infos.Stb,infos.${monthName} AS Amount 
                FROM infos INNER JOIN region ON infos.region_id = region.id AND infos.region_id = ${region_id} AND status = 0 AND suspended = 0`;
    db.query(sql, (err,results)=>{
        res.render('workerPanel/allRegions', {
            user : req.user,
            results : results,
            region_id : region_id,
            success
        });
    });
});

route.post('/:region_id/pay',ensureAuthenticateds,(req,res)=>{
  var region_id = req.params.region_id;
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
        req.flash('success_msg', 'Paid Successfully!');
        res.redirect('/workerPanel/unpaidList/' + region_id);
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

// route.post('/:region_id/pay',ensureAuthenticateds,(req,res)=>{
//     var region_id = req.params.region_id;
//     var amount;
//     var packageOpted;
//     if(req.body.exampleField){
//       amount = req.body.exampleField;
//     }else{
//       amount = req.body.exampleRadios;
//     }
//     if(amount == "153"){
//       packageOpted = "Basic";
//     } else if(amount == "275"){
//       packageOpted = "Silver";
//     }else if(amount == "360"){
//       packageOpted = "Gold";
//     }else if(amount == "454"){
//       packageOpted = "Diamond";
//     }else{
//       packageOpted = "Custom";
//     }
//     db.query(`SELECT * FROM infos WHERE Stb = "${req.body.Stb}"`,(err,results)=>{
//       let sql = `INSERT INTO offline_payment SET ?`;
//       let values = {
//         Name : results[0].Name,
//         Address : results[0].Address,
//         Mobile : results[0].Mobile,
//         Stb : results[0].Stb,
//         Amount : amount,
//         packageOpted : packageOpted
//       };
//       db.query(sql, values, (err,results)=>{
//         if(!err){
//           req.flash('success_msg', 'Paid Successfully!');
//           res.redirect('/workerPanel/unpaidList/' + region_id);
//         }
//       });
//       var d = new Date();
//       var month = new Array();
//       month[0] = "January";
//       month[1] = "February";
//       month[2] = "March";
//       month[3] = "April";
//       month[4] = "May";
//       month[5] = "June";
//       month[6] = "July";
//       month[7] = "August";
//       month[8] = "September";
//       month[9] = "October";
//       month[10] = "November";
//       month[11] = "December";
                
//       var monthName = month[d.getMonth()];
//       var dateExpiry = new Date();
//       dateExpiry.setDate(dateExpiry.getDate() + 30);
  
//       let listPay = `UPDATE infos SET ${monthName}="${amount}", datePaid = now(), ?  WHERE Stb = "${results[0].Stb}"`;
//       let listValues = {
//           dateExpiry : dateExpiry
//       };
//       db.query(listPay, listValues, (err,results)=>{
//       });
  
//       let all_payment = `INSERT INTO all_payment SET ?`;
//       let all_values = {
//           Name : results[0].Name,
//           Address : results[0].Address,
//           Mobile : results[0].Mobile,
//           Stb : results[0].Stb,
//           Amount : amount,
//           Mode : 'Offline',
//           dateExpiry : dateExpiry
//       };
//       db.query(all_payment, all_values, (err,results)=>{
//       });
  
  
//     });
  
//   });

// route.get('/:region/download', ensureAuthenticateds,(req,res)=>{
//     var region = req.params.region;

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
    
//     const workbook = new Excel.Workbook();
//     const worksheet = workbook.addWorksheet('Unpaid Records');
//     worksheet.views = [
//         {state: 'frozen', ySplit: 1, activeCell: 'A1'}
//     ];
//     worksheet.columns = [
//         { header: 'Name', key: 'Name', width: 32 },
//         { header: 'Address', key: 'Address', width: 30 },
//         { header: 'Stb', key: 'Stb', width: 15},
//         { header: 'Mobile', key: 'Mobile', width: 15 },
//         { header: 'Amount', key: 'Amount', width: 10 },
//     ];
//     let sql = `SELECT Name, Address, Mobile, Stb, ${monthName} AS Amount FROM infos WHERE region_id = "${region}" AND ${monthName} = 0`;
//     db.query(sql, (err,results)=>{
//         results.forEach((result)=>{
//             var data = JSON.parse(JSON.stringify(result));
//             worksheet.addRow(data);
//         });
//         sendWorkbook(workbook,res,region);
//     })
// });


// async function sendWorkbook(workbook, response, region) { 

//     let sql = `SELECT region_name FROM region WHERE id = ${region}`;
//     db.query(sql,async(err,results)=>{
//         var regionName = results[0].region_name;
//         var fileName = `Unpaid ${regionName}.xlsx`;
//         response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//         response.setHeader("Content-Disposition", "attachment; filename=" + fileName);
    
//          await workbook.xlsx.write(response);
    
//         response.end();
//     });
// }




module.exports = route;