const express = require('express');
const route = express.Router();
const mysql = require("mysql");
const {ensureAuthenticated} = require('../config/auth');    //Login Authenticator
const checksum_lib = require('../checksum');




route.get('/', ensureAuthenticated, (req,res)=>{
    console.log(req.user);
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
    console.log(monthName);

    var month3 = [];
    for(var i =0; i<3; i++){
        month3.push(month[d.getMonth()-i]);
    }

    console.log(req.user);
    var monthData = month3.join();
         
       let sql = `SELECT ${monthData} FROM infos WHERE Stb = "${req.user.Stb}"`;
       db.query(sql, (err,results)=>{
           res.render('customerPanel', {
            data : req.user,
            historyData : results,
            months : month3
        });
       });

   
});

route.get('/logout', (req,res)=>{
    req.logOut();
    req.flash('success_msg', 'You have logged out.');
    res.redirect('/');
});

route.post('/sendComplaint', (req,res)=>{
   var mail = req.body.mail;
   var stb = req.body.stb;
   var error = req.body.error;
   var msg = req.body.msg;

   db.query(`SELECT * FROM infos WHERE Stb = "${stb}"`, (err,result)=>{
    let sql = 'INSERT INTO complaint SET ?'
    var values = {
        Name : result[0].Name,
        Address : result[0].Address,
        Mobile : result[0].Mobile, 
        Stb : result[0].Stb, 
        Mail : mail, 
        Error : error,
        Msg : msg, 
        Checkbox : 0
    };
    db.query(sql, values, (err,results)=>{
        if(err){
            console.log(err);
        }else{
            res.render('afterComplaint');
    
        }   
    });
   });
});


route.post('/txn' , ensureAuthenticated, (req,res)=>{
    res.render('txn', {
        Stb : req.body.Stb,
        Mobile : req.body.Mobile,
        Amount : req.body.group1
    });
});

route.post('/txn/payment', function(req, res){
    var Stb = req.body.Stb;
    var Mobile = req.body.Mobile;
    var Amount = req.body.Amount;
    if(req.url == "/txn/payment"){
            var params 						= {};
            params['MID'] 					= PaytmConfig.mid;
            params['WEBSITE']				= PaytmConfig.website;
            params['CHANNEL_ID']			= 'WEB';
            params['INDUSTRY_TYPE_ID']	    = 'Retail';
            params['ORDER_ID']			    = 'TEST_'  + new Date().getTime();
            params['CUST_ID'] 			    = 'Customer001';
            params['TXN_AMOUNT']		    = Amount;
            params['CALLBACK_URL']		    = 'http://localhost:'+port+'/customerPanel/callback?stb='+Stb;
            // params['CALLBACK_URL']		    = 'https://yourstb.herokuapp.com/customerPanel/callback?stb='+Stb;
            params['EMAIL']				    = 'abc@mailinator.com';
            params['MOBILE_NO']			    = Mobile;

            checksum_lib.genchecksum(params, PaytmConfig.key, function (err, checksum) {

                var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
                // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production
                
                var form_fields = "";
                for(var x in params){
                    form_fields += "<input type='hidden' name='"+x+"' value='"+params[x]+"' >";
                }
                form_fields += "<input type='hidden' name='CHECKSUMHASH' value='"+checksum+"' >";

                // res.writeHead(200, {'Content-Type': 'text/html'});
                res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="'+txn_url+'" name="f1">'+form_fields+'</form><script type="text/javascript">document.f1.submit();</script></body></html>');
                res.end();
            });

    }	
    });
        route.post('/callback', function(req, res){ //ADD QUERY FOR INSERTING IN all_info with respective month in production
            let sql = `SELECT * FROM infos WHERE Stb = "${req.query.stb}"`
            db.query(sql, function(error, results, fields) {
                var pay = 'INSERT INTO payment SET ?';
                var values = {
                    Txn_Id : req.body.TXNID,
                    Name : results[0].Name,
                    Address : results[0].Address,
                    Mobile : results[0].Mobile,
                    Stb : results[0].Stb,
                    Amount : req.body.TXNAMOUNT,
                    Order_ID : req.body.ORDERID,
                    Payment_Mode : req.body.PAYMENTMODE,
                    Gateway_Name : req.body.GATEWAYNAME,
                    Bank_Txn_ID : req.body.BANKTXNID,
                    Bank_Name : req.body.BANKNAME
                };
                db.query(pay, values, function(err, results, fields){
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
              
                var monthName = month[d.getMonth()];

                var dateExpiry = new Date();
                dateExpiry.setDate(dateExpiry.getDate() + 30);

                let listPay = `UPDATE infos SET ${monthName}="${req.body.TXNAMOUNT}", datePaid = now(), ?  WHERE Stb = "${results[0].Stb}"`;
                let listValues = {
                    dateExpiry : dateExpiry,
                    status : 1
                };
                db.query(listPay, listValues, (err,results)=>{
                });

                let all_payment = `INSERT INTO all_payment SET ?`;
                let all_values = {
                    Name : results[0].Name,
                    Address : results[0].Address,
                    Mobile : results[0].Mobile,
                    Stb : results[0].Stb,
                    Amount : req.body.TXNAMOUNT,
                    Mode : 'Online',
                    dateExpiry : dateExpiry
                };
                db.query(all_payment, all_values, (err,results)=>{
                });
            });
        res.render('aftercallback.ejs', {
            stb : req.query.stb,
            orderId : req.body.ORDERID,
            txnId : req.body.TXNID,
            txnAmount : req.body.TXNAMOUNT,
            paymentMode : req.body.PAYMENTMODE,
            txnDate : req.body.TXNDATE,
            status : req.body.STATUS,
            bankName : req.body.BANKNAME,
            bankTxnId : req.body.BANKTXNID,
        });
});



module.exports = route;