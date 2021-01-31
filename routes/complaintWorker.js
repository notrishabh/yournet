const express = require("express");
const route = express.Router();
const mysql = require("mysql");
const { ensureAuthenticateds } = require("../config/adminAuth"); //Login Authenticator


var success = [];

route.get('/', ensureAuthenticateds, (req,res)=>{
    let sql = `SELECT * FROM complaint WHERE Checkbox = 0`;
    db.query(sql, (err,results)=>{
        res.render('workerPanel/complaint', {
            user : req.user,
            results : results,
            success
        })
    });
});



route.post('/fixed', (req,res)=>{
    var d = new Date();
    let sql = `UPDATE complaint SET ? WHERE id = "${req.body.id}"`;
    var values = {
        Checkbox : 1,
        fixedBy : req.user.Name,
        fixedDateTime : d
    };
    db.query(sql, values, (err,results)=>{
        let sql = `UPDATE worker SET fixedComplaints = fixedComplaints + 1 WHERE Name = "${req.user.Name}"`;
        db.query(sql, (err,results)=>{
            if(!err){
                req.flash('success_msg', 'Complaint Fixed!');
                res.redirect('/workerPanel/complaints');
            }else{
                res.send(err);
            }
        });
    });
});







module.exports = route;