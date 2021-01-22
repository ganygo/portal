module.exports = function(req,res,callback){
	var data={
		machineGroupList:[],
		moldGroupList:[],
		form:{
			moldGroup:'',
			machineGroup:'',
			name:'',
			description:'',
			moldParameters:[],
			passive:false
		},
		filter:{

		},
		list:[]
	}


	switch(req.params.func || ''){
		case 'addnew':
		
		addnew(req,res,data,callback);
		break;
		case 'edit':
			edit(req,res,data,callback);
		break;
		case 'view':
			edit(req,res,data,callback);
		break;
		case 'delete':
		
		deleteItem(req,res,data,callback);
		break;
		default:
			data.filter=getFilter(data.filter,req,res)
			if(req.method!='POST') 
				getList(req,res,data,callback)
		break;
	}
	
}

function getList(req,res,data,callback){
	initLookUpLists(req,res,data,(err,data)=>{
		data.machineGroupList.unshift({_id:'',name:'-Tümü-'});
		data.moldGroupList.unshift({_id:'',name:'-Tümü-'});
		api.get(`/{db}/mrp-molds`,req,data.filter,(err,resp)=>{
			if(!err){
				data=mrutil.setGridData(data,resp);
			}else{
				errorLog('hata:',err);
			}
			callback(null,data);
		});
	});
}



function initLookUpLists(req,res,data,cb){
	data.machineGroupList=[];
	data.moldGroupList=[];
	
	api.get(`/{db}/mrp-machine-groups`,req,{},(err,resp)=>{
		if(!err){
			data.machineGroupList=resp.data.docs;
		}
		api.get(`/{db}/mrp-mold-groups`,req,{},(err,resp)=>{
			if(!err){
				data.moldGroupList=resp.data.docs;
			}
			cb(null,data);
		});
	});
}

function addnew(req,res,data,callback){

	initLookUpLists(req,res,data,(err,data)=>{
		if(req.method=='POST'){
			data.form=Object.assign(data.form,req.body);
			api.post(`/{db}/mrp-molds`,req,data.form,(err,resp)=>{
				if(!err){
					res.redirect(`/mrp/molds?sid=${req.query.sid}&mid=${req.query.mid}`)
					return;
 				}else{
 					data['message']=err.message;
 					callback(null,data);
 				}
 			});
		}else{
			callback(null,data);
		}
	});
}


function edit(req,res,data,callback){
	initLookUpLists(req,res,data,(err,data)=>{
		var _id=req.params.id || '';
		if(req.method=='POST' || req.method=='PUT'){
			data.form=Object.assign(data.form,req.body);
			api.put(`/{db}/mrp-molds/${_id}`,req,data.form,(err,resp)=>{
				if(!err){
					res.redirect(`/mrp/molds?sid=${req.query.sid}&mid=${req.query.mid}`)

				}else{
					data['message']=err.message;
					callback(null,data);
				}
			});
		}else{
			api.get(`/{db}/mrp-molds/${_id}`,req,null,(err,resp)=>{
				if(!err){
					data.form=Object.assign(data.form,resp.data);
					callback(null,data);
				}else{
					data['message']=err.message;
					callback(null,data);
				}
			});
		}
	});
}


function deleteItem(req,res,data,callback){
	var _id=req.params.id || '';
	api.delete(`/{db}/mrp-molds/${_id}`,req,(err,resp)=>{
		if(!err){
			res.redirect(`/mrp/molds?sid=${req.query.sid}&mid=${req.query.mid}`)
			
		}else{
			data['message']=err.message;
			callback(null,data);
		}
	});
}