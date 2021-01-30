const express = require('express');
const route = express.Router();
const mysql = require("mysql");
const {ensureAuthenticateds} = require('../config/adminAuth');    //Login Authenticator
const Excel = require('exceljs');

var success = [];

route.get('/', ensureAuthenticateds, (req,res)=>{
    res.render('paidList', {
        user: req.user,
        results : "none",
        displayDetails : "none",
        monthDrop : 0,
        monthName : "",
        success
    });
});

route.post('/', ensureAuthenticateds, (req,res)=>{
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

    var monthDrop = req.body.monthDrop;

    var monthName = month[monthDrop];


    let sql = `SELECT Name,Address,Mobile,Stb,${monthName} AS Amount FROM infos WHERE ${monthName} != '0'`;
    db.query(sql, (err,results)=>{
    
        res.render('paidList', {
            user: req.user,
            results: results,
            displayDetails: "block",
            noResults: "none",
            monthDrop : monthDrop,
            monthName : monthName,
            success
        });
    });
});


route.get('/:monthDrop/download', ensureAuthenticateds,(req,res)=>{

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

    var monthDrop = req.params.monthDrop;

    var monthName = month[monthDrop];


    const workbook = new Excel.Workbook();

    let sql = `SELECT infos.region_id, region.region_name 
               FROM infos INNER JOIN region 
               ON infos.region_id = region.id 
               GROUP BY infos.region_id;
               SELECT region_id, Name, Address, Stb, Mobile, ${monthName} AS Amount FROM infos WHERE ${monthName} != '0'`; 

    db.query(sql, (err,results)=>{
        results[0].forEach(lol=>{
            let worksheet = workbook.addWorksheet(lol.region_name);
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
            
            results[1].forEach((result)=>{
                if(result.region_id == lol.region_id){
                    var data = JSON.parse(JSON.stringify(result));
                    // console.log(data);
                    worksheet.addRow(data);
                }
           
            }); 

        });
        sendWorkbook(workbook,res,monthName);
    });


    // let newsql = `SELECT infos.region_id, region.region_name FROM infos INNER JOIN region ON infos.region_id = region.id GROUP BY infos.region_id`;
    // db.query(newsql, (err,results)=>{
    //     results.forEach(lol =>{
    //         const worksheet = workbook.addWorksheet(`${lol.region_name}`);
    //         worksheet.views = [
    //             {state: 'frozen', ySplit: 1, activeCell: 'A1'}
    //         ];
    //         worksheet.columns = [
    //             { header: 'Name', key: 'Name', width: 32 },
    //             { header: 'Address', key: 'Address', width: 30 },
    //             { header: 'Stb', key: 'Stb', width: 15},
    //             { header: 'Mobile', key: 'Mobile', width: 15 },
    //             { header: 'Amount', key: 'Amount', width: 10 },
    //         ];
    //         // worksheet.addRow({Name: 'lol', Address: 'dsadasd', Stb: '165161', Mobile: 18918918, Amount: 250});
    //         // worksheet.addRow({ Name: 'Umesh Sanitary',
    //         // Address: '12/3 Road side g.f',
    //         // Stb: '62965207',
    //         // Mobile: 9312648584,
    //         // Amount: 100 });
    //         let sql = `SELECT Name, Address, Stb, Mobile, ${monthName} AS Amount FROM infos WHERE ${monthName} != '0' AND region_id = "${lol.region_id}"`;
    //         db.query(sql, (err,results)=>{
    //         //  console.log(results);
             
    //             results.forEach((result)=>{
    //                 var data = JSON.parse(JSON.stringify(result));
    //                 // console.log(data);
    //                 worksheet.addRow(data);
    //             }); 

    //         });

    //     });

    //     sendWorkbook(workbook,res,monthName);

    
    // });

});

async function sendWorkbook(workbook, response, monthName) { 

        var fileName = `${monthName}` + " Paid List" + ".xlsx";
        response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        response.setHeader("Content-Disposition", "attachment; filename=" + fileName);
    
         await workbook.xlsx.write(response);
    
        response.end();
   
}

module.exports = route;