const errorHandler = (err, req, res, next) => {
    if(err.status) {
        res.status(err.status).json({message: err.message});
    } else {
        res.status(500).json({message: err.message || 'Server Error'});
    }
};

export default errorHandler;