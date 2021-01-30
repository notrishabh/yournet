module.exports = {
    ensureAuthenticated : function(req,res,next) {
        if(req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please Log in to view'); //Lock others pages if not logged in
        res.redirect('/');
    }
}