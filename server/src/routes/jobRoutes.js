const express =require('express')
const router= express.Router();
const{create,list,getOne,update,delate,myConversations}=require("../controllers/jobController");
const {authenticate,requireRole}=require("../middleware/authMiddleware")
router.post("/",authenticate,requireRole('client'),create)
router.get("/", list);
router.get('/my-conversations',authenticate,myConversations);
router.get('/:id',getOne);
router.delete('/:id',authenticate,delate);
router.patch('/:id',authenticate,update);
module.exports=router;