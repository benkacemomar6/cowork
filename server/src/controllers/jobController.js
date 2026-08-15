const {createJob,listJob,updateJob,deleteJob,getJob}=require('../services/jobService')
async function create(req,res,next) {
    const { title, description, category, budget }=req.body;
    const clientId=req.user.userId;
    
     try {
        const  ok=await createJob({client:clientId, title, description, category, budget });
        res.status(201).json(ok);

        
     } catch (error) {
        next(error)
        
     }
    }
    async function list(req,res,next){
        try{
        const {page,limit}=req.query;
        const jobs=await listJob({page,limit});
         res.status(200).json(jobs);}
        catch(error){
            next(error)
        }


    }
    async function getOne(req,res,next) {
        try {
            const id=req.params.id;
            const job=await getJob({id});
            res.status(200).json(job)
        } catch (error) {
            next(error)
            
        }
        
    }
      async function update(req,res,next) {
        try {
            const jobId=req.params.id;
            const userId=req.user.userId;
            const updates=req.body;
            const job =await updateJob({jobId,userId,updates})
            res.status(200).json(job);

        } catch (error) {
            next(error)
            
        }
        
    }
    async function delate(req,res,next) {
        try {
            const userId=req.user.userId;
            const jobId=req.params.id;
            const job=await deleteJob({jobId,userId})
            res.status(200).json(job)
            
        } catch (error) {
            next(error)
            
        }
        
    }
    module.exports = { create ,list,getOne,update,delate};