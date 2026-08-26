function errorHandler(err,req,res,next){
    console.error(err);

    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(e => e.message).join(', ');
        return res.status(400).json({ success: false, message });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, message: `Invalid ${err.path}: ${err.value}` });
    }

    const statusCode=err.statusCode || 500;
    const message=err.statusCode? err.message :'somthing went wrong'
    res.status(statusCode).json({
        success:false,
        message:message
    })
}
module.exports= errorHandler;