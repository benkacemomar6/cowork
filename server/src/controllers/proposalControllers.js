const { submitProposal, listProposalsForJob, listMyProposals, acceptProposal,withdrawProposal,rejectProposal }=require("../services/proposalService");
async function submit(req,res,next ) {
    try {
        const jobId =req.params.jobId
        const freelancerId=req.user.userId;
        const {coverLetter, bidAmount}=req.body
        const prop= await submitProposal({jobId,freelancerId,coverLetter,bidAmount})
        res.status(201).json(prop);
    } catch (error) {
        next(error)
        
    }
    
}
async function listAll(req,res,next) {
    try {
    const jobId= req.params.jobId;
    const userId=req.user.userId;
    const props=await listProposalsForJob({jobId,userId})
    res.status(200).json(props)
    } catch (error) {
        next(error)
        
    }
}
async function listMy(req,res,next) {
    try {
    const freelancerId=req.user.userId;    
    const props=await listMyProposals({freelancerId})
    res.status(200).json(props)
    } catch (error) {
        next(error)
        
    }

   

    
}
async function accept(req, res, next) {
    try {
        const userId = req.user.userId;
        const proposalId = req.params.id;
        const result = await acceptProposal({proposalId, userId});
        // live notification push (accepted freelancer + rejected siblings)
        // happens inside acceptProposal via createNotification
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}
async function withdraw(req, res, next) {
    try {
        const proposalId = req.params.id;
        const userId = req.user.userId;
        const prop = await withdrawProposal({proposalId, userId});
        res.status(200).json(prop);
    } catch (error) {
        next(error);
    }
}

async function reject(req, res, next) {
    try {
        const proposalId = req.params.id;
        const userId = req.user.userId;
        const result = await rejectProposal({proposalId, userId});
        // live notification push happens inside rejectProposal via createNotification
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}
module.exports = { submit, listAll, listMy, accept, withdraw,reject };