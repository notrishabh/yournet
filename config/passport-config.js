const LocalStrategy = require('passport-local').Strategy;
const mysql = require('mysql');
var bcrypt = require('bcrypt');

module.exports = function(passport){
    passport.use('admin-local',
        new LocalStrategy({usernameField : 'username'}, (username, password, done) => {
            //Match username
            let sql = `SELECT * FROM admin_login WHERE username = "${username}" LIMIT 1`;   //Matching Criteria
            db.query(sql, (err, result)=>{
                if(result.length == 0){
                    return done(null, false, {message : "Not registered username."});
                }else{
                    const hash = result[0].password.toString();
                    bcrypt.compare(password, hash, function(err,response){
                        if(response == true){
                            return done(null, result[0]);
                        }else{
                            return done(null, false, {message : "Wrong password"});
                        }
                    });
                }
            });
        })
    );


    passport.use('worker-local',
    new LocalStrategy({usernameField : 'username'}, (username, password, done) => {
        //Match username
        let sql = `SELECT * FROM worker WHERE Name = "${username}" LIMIT 1`;   //Matching Criteria
        db.query(sql, (err, result)=>{
            if(result.length == 0){
                return done(null, false, {message : "Not registered worker."});
            }else{
                const hash = result[0].password.toString();
                bcrypt.compare(password, hash, (err,response)=>{
                    if(response == true){
                        return done(null, result[0]);
                    }else{
                        return done(null, false, {message : "Wrong password"});
                    }
                });
            }
        });
    })
);


    passport.use('customer-local',
    new LocalStrategy({usernameField : 'stbNumber', passwordField: 'stbNumber',}, (stbNumber,password, done) => {
        //Match stbnumber
        let sql = `SELECT * FROM infos WHERE Stb = "${stbNumber}" LIMIT 1`;   //Matching Criteria
        db.query(sql, (err, results)=>{
            if(results.length == 0){
                return done(null, false, {message : "No STB found."});
            }else{
                return done(null, results[0]);
            }
        });
    })
);

passport.serializeUser((user,done)=> {
    if(user.id){
        done(null, "worker" + user.id);
    }else if(user.admin_id){
        done(null, 'admin' + user.admin_id);
    }else{
        done(null, user.Stb);
    }
        
});
passport.deserializeUser((id, done)=> {
    if(id.startsWith("admin")){
        var admin_id = id.replace('admin','');
        db.query(`SELECT * FROM admin_login WHERE admin_id = ${admin_id}`, (err, result)=>{
            done(null, result[0]);
        });
    }else if(id.startsWith("worker")){
        var worker_id = id.replace('worker','');
        db.query(`SELECT * FROM worker WHERE id = ${worker_id} LIMIT 1`, (err, result)=>{
            done(null, result[0]);
        });
    }else{
        db.query(`SELECT * FROM infos WHERE Stb = "${id}"`, (err, result)=>{
            done(null, result[0]);
        });
    }

});
}