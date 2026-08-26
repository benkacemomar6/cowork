const {getReviewsByUserId,createReview}=require('../services/ReviewsService')
async function getreview(req,res,next) {
    try {
    const userId = req.params.userId;
    const review=await getReviewsByUserId(userId)
    res.status(200).json(review);
        
    } catch (error) {
        next(error)

        
    }

    

    
}
async function create(req,res,next) {
    try {
        const jobId = req.params.jobId;
        const reviewerId = req.user.userId;
        const { rating, comment } = req.body;
        const review = await createReview({ reviewerId, jobId, rating, comment });
        res.status(201).json(review);
    } catch (error) {
        next(error);
    }
}

module.exports = { getreview, create };