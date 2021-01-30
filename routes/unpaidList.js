const express = require('express');
const route = express.Router();
const mysql = require("mysql");
const {ensureAuthenticateds} = require('../config/adminAuth');    //Login Authenticator
const Excel = require('exceljs');
const { start } = require('live-server');

var success = [];

route.get("/",ensureAuthenticateds,(req,res)=>{
  let sql = `SELECT COUNT(infos.Stb) AS unpaidConnections, brand.id, brand.brand_name, infos.status FROM infos INNER JOIN brand ON infos.brand_id = brand.id AND infos.status = 0 AND infos.suspended = 0 GROUP BY infos.brand_id`;

  db.query(sql,(err,results)=>{
    let sql = `SELECT COUNT(Stb) AS allUnpaid, status FROM infos WHERE status = 0 AND suspended = 0`;
    db.query(sql, (err,all)=>{
          res.render('unpaidList/brandlist', {
          user : req.user,
          results : results,
          all : all,
          success
      });
    });

  });

});

route.get('/:brand/download', ensureAuthenticateds,(req,res)=>{
  var brand = req.params.brand;

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


  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('records');
  worksheet.views = [
      {state: 'frozen', ySplit: 1, activeCell: 'A1'}
  ];
  worksheet.columns = [
      { header: 'Name', key: 'Name', width: 32 },
      { header: 'Address', key: 'Address', width: 30 },
      { header: 'Stb', key: 'Stb', width: 15},
      { header: 'Mobile', key: 'Mobile', width: 15 },
      { header: 'Amount', key: 'Amount', width: 10 },
  ];
  let sql = `SELECT Name, Address, Mobile, Stb, ${monthName} AS Amount FROM infos WHERE brand_id = "${brand}" AND suspended = 0 AND status = 0`;
  db.query(sql, (err,results)=>{
      results.forEach((result)=>{
          var data = JSON.parse(JSON.stringify(result));
          worksheet.addRow(data);
      });
      sendWorkbookBrand(workbook,res,brand);
  })
});


async function sendWorkbookBrand(workbook, response, brand) { 

  let sql = `SELECT brand_name FROM brand WHERE id = ${brand}`;
  db.query(sql,async(err,results)=>{
      var brandName = results[0].brand_name;
      var fileName = `${brandName}.xlsx`;
      response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      response.setHeader("Content-Disposition", "attachment; filename=" + fileName);
  
       await workbook.xlsx.write(response);
  
      response.end();
  });
}

route.get('/all', ensureAuthenticateds,(req,res)=>{
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


      res.render('unpaidList/allUnpaid', {
          user : req.user,
          results : results,
          success
      });
  });
});

route.get("/:brand/regionList",ensureAuthenticateds,(req,res)=>{
  var brand = req.params.brand;
  let sql = `SELECT COUNT(infos.Stb) AS unpaidConnections, region.id, region.region_name, infos.status FROM infos INNER JOIN region
             ON infos.region_id = region.id AND infos.status = 0 AND infos.suspended = 0 AND brand_id = ${brand} GROUP BY infos.region_id`;

  db.query(sql,(err,results)=>{
      res.render('unpaidList/fullUnpaid', {
          user : req.user,
          results : results,
          brand: brand,
          success

      });
  });

});



route.get('/:brand/:region_id',ensureAuthenticateds, (req,res)=>{
    var region_id = req.params.region_id;
    var brand = req.params.brand;
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
    let sql = `SELECT region.region_name,infos.status,infos.Name,infos.Address,infos.Mobile,infos.Stb,infos.validity,infos.speed,infos.dateExpiry,infos.${prevMonthName} AS PrevAmount,infos.balance,infos.${monthName} AS Amount 
                FROM infos INNER JOIN region ON infos.region_id = region.id AND infos.region_id = ${region_id} AND brand_id = ${brand} AND status != 1 AND suspended = 0`;
    db.query(sql, (err,results)=>{
      if(err){
        res.send(err)
      }


        res.render('unpaidList/allRegions', {
            user : req.user,
            results : results,
            region_id : region_id,
            brand: brand,
            success
        });
    });
});

route.post('/all/pay',ensureAuthenticateds,(req,res)=>{
  var amount;
  var speed = req.body.speed;
  var packageOpted;
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
          res.redirect('/adminPanel/unpaidList/all');

      });

    });


  });

});

route.post('/:brand/:region_id/pay',ensureAuthenticateds,(req,res)=>{
    var region_id = req.params.region_id;
    var brand = req.params.brand;
    var amount;
    var speed = req.body.speed;
    var packageOpted;
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
      // let sql = `INSERT INTO offline_payment SET ?`;
      // let values = {
      //   Name : results[0].Name,
      //   Address : results[0].Address,
      //   Mobile : results[0].Mobile,
      //   Stb : results[0].Stb,
      //   Amount : totalAmount,
      //   packageOpted : packageOpted
      // };
      // db.query(sql, values, (err,results)=>{
      //   if(!err){
      //     req.flash('success_msg', 'Paid Successfully!');
      //     res.redirect('/adminPanel/unpaidList/' + brand + "/" + region_id);
      //   }
      // });
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
            res.redirect('/adminPanel/unpaidList/' + brand + "/" + region_id);

        });

      });
  
  
    });
  
  });

// }


route.get('/:brand/:region/download', ensureAuthenticateds,(req,res)=>{
    var region = req.params.region;
    var brand = req.params.brand;

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
    
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Unpaid Records');
    worksheet.views = [
        {state: 'frozen', ySplit: 1, activeCell: 'A1'}
    ];
    worksheet.columns = [
        { header: 'Name', key: 'Name', width: 32 },
        { header: 'Address', key: 'Address', width: 30 },
        { header: 'Stb', key: 'Stb', width: 15},
        { header: 'Mobile', key: 'Mobile', width: 15 },
        { header: 'Amount', key: 'Amount', width: 10 },
    ];
    let sql = `SELECT Name, Address, Mobile, Stb, ${monthName} AS Amount FROM infos WHERE region_id = "${region}" AND brand_id = ${brand} AND status = 0 AND suspended = 0`;
    db.query(sql, (err,results)=>{
        results.forEach((result)=>{
            var data = JSON.parse(JSON.stringify(result));
            worksheet.addRow(data);
        });
        sendWorkbook(workbook,res,region);
    })
});


async function sendWorkbook(workbook, response, region) { 

    let sql = `SELECT region_name FROM region WHERE id = ${region}`;
    db.query(sql,async(err,results)=>{
        var regionName = results[0].region_name;
        var fileName = `Unpaid ${regionName}.xlsx`;
        response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        response.setHeader("Content-Disposition", "attachment; filename=" + fileName);
    
         await workbook.xlsx.write(response);
    
        response.end();
    });
}




module.exports = route;