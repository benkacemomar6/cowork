function errorHandler(err,req,res,next){
    const statusCode=err.statusCode || 500;
    const message=err.statusCode? err.message :'somthing went wrong'
    res.status(statusCode).json({
        success:false,
        message:message
    })
}
module.exports= errorHandler;