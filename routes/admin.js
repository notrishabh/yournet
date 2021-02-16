const express = require('express');
const route = express.Router();
const mysql = require("mysql");
const {ensureAuthenticateds} = require('../config/adminAuth');    //Login Authenticator
const bcrypt = require('bcrypt');
const saltRounds = 10;

var success = [];



route.get('/', ensureAuthenticateds, (req,res)=>{
    console.log(req.user);
    var monthlyEarnings = 'NA';
    var yearlyEarnings = 'NA';
    var latestName = 'NA';
    var latestAmount = 'NA';
    var totalComplaints = 'NA';
    var sum = 'NA';
    var onlineCount = 'NA';
    var offlineCount = 'NA';
    var dateSusp = new Date();
    var dateToday = new Date();

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
  
    var monthName = month[dateToday.getMonth()];


    var today = new Date();
    var dd = String(today.getDate());
    var mm = String(today.getMonth() + 1);
    var yyyy = String(today.getFullYear());

    today = yyyy + '-' + mm + '-' + dd;

    let sql = `SELECT SUM(Amount) AS total FROM all_payment WHERE MONTH(datePaid) = "${mm}" AND isDue = 0`; //MONTHLY CARD
    db.query(sql,(err,results)=>{
        monthlyEarnings = results[0].total;
        let sql = `SELECT SUM(Amount) AS total FROM all_payment WHERE YEAR(datePaid) = "${yyyy}" AND isDue = 0`; //YEARLY CARD
        db.query(sql, (err,results)=>{
            yearlyEarnings = results[0].total;
            let sql = `SELECT * FROM all_payment WHERE isDue = 0 ORDER BY id DESC LIMIT 1`; //LATEST PAYMENT CARD
            db.query(sql, (err,results)=>{
                if(results.length != 0){
                    latestName = results[0].Name;
                    latestAmount = results[0].Amount;
                }
                let sql = `SELECT COUNT(id) AS total FROM complaint WHERE Checkbox = 0`; //LATEST COMPLAINT CARD
                db.query(sql, (err, results)=>{
                    totalComplaints = results[0].total;
                    let sql = `SELECT SUM(Amount) AS sum,month(datePaid) AS month FROM all_payment WHERE isDue = 0 GROUP BY month(datePaid)`; //EARNING CHART
                    db.query(sql, (err,results)=>{
                        sum = results;
                        let sql = `SELECT COUNT(id) AS onlineCount FROM all_payment WHERE isDue = 0 AND Mode="Online"`; //PIE CHART
                        db.query(sql, (err,results)=>{
                            onlineCount = results[0].onlineCount;
                            let sql = `SELECT COUNT(id) AS offlineCount FROM all_payment WHERE Mode="Offline" AND isDue = 0`;  //PIE CHART
                            db.query(sql,(err,results)=>{
                                offlineCount = results[0].offlineCount;
                                dateSusp.setDate(dateSusp.getDate() - 60);
                                dateSusp = dateSusp.toISOString().slice(0, 19).replace('T', ' ');
                                dateToday = new Date().toISOString().slice(0, 19).replace('T', ' ');


                                //SUSPENDED LIST STATUS 0=unpaid 1=paid
                                let sqlSusp = `UPDATE infos SET suspended = 1 WHERE dateExpiry != STR_TO_DATE('0000-00-00 00:00:00', '%Y-%m-%d %H:%i:%s') 
                                           AND dateExpiry < "${dateSusp}"; 
                                           UPDATE infos SET status = 0 WHERE status != 2 AND dateExpiry < "${dateToday}"`;
                                db.query(sqlSusp, (err,rol)=>{
                                    if(err){
                                        console.log(err);
                                        res.send(err);
                                    }                                    
                                });
                                
                                res.render('adminPanel', {
                                    user : req.user,
                                    monthlyEarnings : monthlyEarnings,
                                    yearlyEarnings : yearlyEarnings,
                                    latestName : latestName,
                                    latestAmount : latestAmount,
                                    totalComplaints : totalComplaints,
                                    sum : sum,
                                    onlineCount : onlineCount,
                                    offlineCount : offlineCount
                                });


                                
                            });
                            
                        });
                       
                    });

                    

                });

                
            });
            
        });
        
    });
    
});


route.get('/settings', ensureAuthenticateds,(req,res)=>{
    res.render('settings', {
        user : req.user,
        success

    });
});



route.post('/settings', ensureAuthenticateds, (req,res)=>{
    var password = req.body.newPass;


    bcrypt.hash(password, saltRounds, function(err, hash) {
        let sql = `UPDATE admin_login SET ? WHERE admin_id = 1`;
        let values = {
            password : hash
        };
        // Store hash in your password DB.
        db.query(sql, values, (err, results)=>{
            if(!err){
                req.flash('success_msg', 'Password Changed Successfully!');
                res.redirect('/adminPanel/settings');
            }
        });
    });

});





route.get('/logout', (req,res)=>{
    req.logOut();
    req.session.destroy(() => {
        res.clearCookie('connect.sid')
        // req.flash('success_msg', 'You have logged out');
        res.redirect('/adminLogin');
    });
    
});


route.use('/payments', require('./payments'));
route.use('/complaints', require('./complaints'));
route.use('/offlinePayments', require('./offlinePayments'));
route.use('/offlineComplaints', require('./offlineComplaints'));
route.use('/fullList', require('./fullList'));
route.use('/suspendedList', require('./suspendedList'));
route.use('/balanceList', require('./balanceList'));
route.use('/unpaidList', require('./unpaidList'));
route.use('/paidList', require('./paidList'));
route.use('/worker', require('./worker'));
route.use('/newStb', require('./newStb'));
route.use('/region', require('./region'));
route.use('/brand', require('./brand'));
route.use('/history', require('./history'));


module.exports = route;