const express = require('express');
const route = express.Router();
const mysql = require("mysql");
const {ensureAuthenticateds} = require('../config/adminAuth');    //Login Authenticator
const Excel = require('exceljs');

var success = [];



route.get("/",ensureAuthenticateds,(req,res)=>{
    let sql = `SELECT COUNT(infos.Stb) AS totalConnections, brand.id, brand.brand_name, infos.status FROM infos INNER JOIN brand ON infos.brand_id = brand.id AND infos.suspended = 0 GROUP BY infos.brand_id`;

    db.query(sql,(err,results)=>{
        let sql = `SELECT COUNT(Stb) AS allFull, status FROM infos WHERE suspended = 0`;
        db.query(sql, (err,all)=>{

            res.render('fullList/brandlist', {
                user : req.user,
                results : results,
                all : all,
                success

            });
        });
    });

});
route.get("/:brand/regionList",ensureAuthenticateds,(req,res)=>{
    var brand = req.params.brand;
    let sql = `SELECT COUNT(infos.Stb) AS totalConnections, region.id, region.region_name, infos.status FROM infos INNER JOIN region
               ON infos.region_id = region.id AND infos.suspended = 0 AND brand_id = ${brand} GROUP BY infos.region_id`;

    db.query(sql,(err,results)=>{
        res.render('fullList/fullList', {
            user : req.user,
            results : results,
            brand: brand,
            success

        });
    });

});

route.get('/all',ensureAuthenticateds, (req,res)=>{
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
    let sqll = `SELECT * FROM region`;
    db.query(sqll, (err,regionList)=>{
        let sql = `SELECT region.region_name,infos.cid,infos.Name,infos.Address,infos.Mobile,infos.Stb,infos.validity,infos.speed,infos.${monthName} AS Amount,infos.datePaid,infos.dateExpiry 
        FROM infos INNER JOIN region ON infos.region_id = region.id AND infos.suspended = 0`;
        db.query(sql, (err,results)=>{
            let sql = `SELECT * FROM brand`;
            db.query(sql, (err,brandList)=>{
                res.render('fullList/allFull', {
                    user : req.user,
                    results : results,
                    monthName : monthName,
                    regionList : regionList,
                    brandList : brandList,
                    success
                });
            });
            
        });
    });
   
});

route.get('/all/download', ensureAuthenticateds,(req,res)=>{
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
        { header: 'User ID', key: 'Stb', width: 15},
        { header: 'Mobile', key: 'Mobile', width: 15 },
        { header: 'Amount', key: 'Amount', width: 10 },
    ];
    let sql = `SELECT Name, Address, Mobile, Stb, ${monthName} AS Amount FROM infos WHERE suspended = 0`;
    db.query(sql, (err,results)=>{
        results.forEach((result)=>{
            var data = JSON.parse(JSON.stringify(result));
            worksheet.addRow(data);
        });
        sendWorkbookAll(workbook,res);
    })
});


async function sendWorkbookAll(workbook, response) { 

    var fileName = `AllFullList.xlsx`;
    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.setHeader("Content-Disposition", "attachment; filename=" + fileName);

        await workbook.xlsx.write(response);

    response.end();
}

route.post('/all/complaint',ensureAuthenticateds,(req,res)=>{

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
          res.redirect('/adminPanel/fullList/all');
        }
      });
    });
  
  });
route.post('/:brand/:region/complaint',ensureAuthenticateds,(req,res)=>{
    var region = req.params.region;
    var brand = req.params.brand;
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
          res.redirect("/adminPanel/fullList/" + brand + "/"+ region);
        }
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
    let sql = `SELECT Name, Address, Mobile, Stb, ${monthName} AS Amount FROM infos WHERE brand_id = "${brand}" AND suspended = 0`;
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


route.post("/edit/:brand/:region_id", ensureAuthenticateds, (req,res)=>{
    var region_id = req.params.region_id;
    var brand = req.params.brand;
    let sql = `UPDATE infos SET ? WHERE cid = ${req.body.cid}`;
    let values = {
        region_id : req.body.region,
        brand_id : req.body.brand,
        Name : req.body.name,
        Address : req.body.address,
        Mobile : req.body.mobile,
        Stb : req.body.stbnew
    };
    db.query(sql, values, (err,results)=>{
        if(!err){
            req.flash('success_msg', 'Record Edited Successfully!');
            res.redirect("/adminPanel/fullList/" + brand + "/"+ region_id);
        }else{
            req.flash('error_msg', 'Error Editing Record');
            res.redirect("/adminPanel/fullList/" + brand + "/"+ region_id);
        }
    });
});
route.post("/edit/all", ensureAuthenticateds, (req,res)=>{
    let sql = `UPDATE infos SET ? WHERE cid = ${req.body.cid}`;
    let values = {
        region_id : req.body.region,
        brand_id : req.body.brand,
        Name : req.body.name,
        Address : req.body.address,
        Mobile : req.body.mobile,
        Stb : req.body.stbnew
    };
    db.query(sql, values, (err,results)=>{
        if(!err){
            req.flash('success_msg', 'Record Edited Successfully!');
            res.redirect("/adminPanel/fullList/all");
        }else{
            req.flash('error_msg', 'Error Editing Record');
            res.redirect("/adminPanel/fullList/all");
        }
    });
});

route.post('/suspend/:brand/:region_id',ensureAuthenticateds,(req,res)=>{
    var region_id = req.params.region_id;
    var brand = req.params.brand;
    var cid = req.body.cid;
    let sql = `UPDATE infos SET suspended = 1 WHERE cid= "${cid}"`;
    db.query(sql, (err,results)=>{
      if(!err){
        req.flash('error_msg', 'STB Suspended Successfully!');
        res.redirect("/adminPanel/fullList/" + brand + "/"+ region_id);
    }else{
        req.flash('error_msg', 'ERROR!');
        res.redirect("/adminPanel/fullList/" + brand + "/"+ region_id);
    }
    });

});
route.post('/suspend/all',ensureAuthenticateds,(req,res)=>{
    var cid = req.body.cid;
    let sql = `UPDATE infos SET suspended = 1 WHERE cid= "${cid}"`;
    db.query(sql, (err,results)=>{
      if(!err){
        req.flash('error_msg', 'STB Suspended Successfully!');
        res.redirect("/adminPanel/fullList/all");
    }else{
        req.flash('error_msg', 'ERROR!');
        res.redirect("/adminPanel/fullList/all");
    }
    });

});

route.post('/remove/:brand/:region_id',ensureAuthenticateds,(req,res)=>{
    var region_id = req.params.region_id;
    var brand = req.params.brand;
    var cid = req.body.cid;
    let sql = `DELETE FROM infos WHERE cid = "${cid}"`;
    db.query(sql, (err,results)=>{
      if(!err){
        req.flash('error_msg', 'STB Removed Successfully!');
        res.redirect("/adminPanel/fullList/" + brand + "/"+ region_id);
    }else{
        req.flash('error_msg', 'ERROR');
        res.redirect("/adminPanel/fullList/" + brand + "/"+ region_id);
    }
    });

});
route.post('/remove/all',ensureAuthenticateds,(req,res)=>{
    var cid = req.body.cid;
    let sql = `DELETE FROM infos WHERE cid = "${cid}"`;
    db.query(sql, (err,results)=>{
      if(!err){
        req.flash('error_msg', 'STB Removed Successfully!');
        res.redirect("/adminPanel/fullList/all");
    }else{
        req.flash('error_msg', 'ERROR');
        res.redirect("/adminPanel/fullList/all");
    }
    });

});


route.get('/:brand/:region_id',ensureAuthenticateds, (req,res)=>{
    var region_id = req.params.region_id;
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
    let sqll = `SELECT * FROM region`;
    db.query(sqll, (err,regionList)=>{
        let sql = `SELECT region.region_name,infos.cid,infos.Name,infos.Address,infos.Mobile,infos.Stb,infos.validity,infos.speed,infos.${monthName} AS Amount,infos.datePaid,infos.dateExpiry 
        FROM infos INNER JOIN region ON infos.region_id = region.id AND infos.region_id = ${region_id} AND brand_id = ${brand} AND infos.suspended = 0`;
        db.query(sql, (err,results)=>{
            let sql = `SELECT * FROM brand`;
            db.query(sql, (err,brandList)=>{
                res.render('fullList/allRegions', {
                    user : req.user,
                    results : results,
                    region_id : region_id,
                    monthName : monthName,
                    regionList : regionList,
                    brand: brand,
                    brandList : brandList,
                    success
    
                });
            });
            
        });
    });
   
});



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
    let sql = `SELECT Name, Address, Mobile, Stb, ${monthName} AS Amount FROM infos WHERE brand_id = ${brand} AND region_id = "${region}" AND suspended = 0`;
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
        var fileName = `${regionName}.xlsx`;
        response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        response.setHeader("Content-Disposition", "attachment; filename=" + fileName);
    
         await workbook.xlsx.write(response);
    
        response.end();
    });
}



module.exports = route;