global.authenticate = function(err,req,res,next){
    if (req.session.auth) {
        next();
    } else {
       res.redirect("/");
    }
}