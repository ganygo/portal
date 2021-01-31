module.exports = function(req,res,callback){
	var data={
		locationList:[],
		form:{
			location:'',
			name:'',
			passive:false
		},
		list:[],
		filter:{}
	}


	switch(req.params.func || ''){
		case 'addnew':
		
		addnew(req,res,data,callback);
		break;
		case 'edit':
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
		data.locationList.unshift({_id:'',locationName:'-- Tümü --'});
		api.get(`/{db}/sub-locations`,req,data.filter,(err,resp)=>{
			if(!err){
				data=mrutil.setGridData(data,resp);
			}
			callback(null,data);
		});
	})
}


function initLookUpLists(req,res,data,cb){
	data.locationList=[];
	
	api.get(`/{db}/locations`,req,{passive:false,hasSubLocations:true},(err,resp)=>{
		if(!err){
			data.locationList=resp.data.docs;
		}
		cb(null,data);
	});
}

function addnew(req,res,data,callback){
	initLookUpLists(req,res,data,(err,data)=>{
		if(req.method=='POST'){
			data.form=Object.assign(data.form,req.body);
			api.post(`/{db}/sub-locations`,req,data.form,(err,resp)=>{
				if(!err){
					res.redirect(`/settings/sub-locations?sid=${req.query.sid}&mid=${req.query.mid}`)
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
	var _id=req.params.id || '';
	if(_id.trim()==''){
		data['message']='ID bos olamaz';
		callback(null,data);
		return;
	}
	initLookUpLists(req,res,data,(err,data)=>{
		
		if(req.method=='POST' || req.method=='PUT'){
			data.form=Object.assign(data.form,req.body);
			
			api.put(`/{db}/sub-locations/${_id}`,req,data.form,(err,resp)=>{
				if(!err){
					res.redirect(`/settings/sub-locations?sid=${req.query.sid}&mid=${req.query.mid}`)

				}else{
					data['message']=err.message;
					callback(null,data);
				}
			});
		}else{
			api.get(`/{db}/sub-locations/${_id}`,req,null,(err,resp)=>{
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
	api.delete(`/{db}/sub-locations/${_id}`,req,(err,resp)=>{
		if(!err){
			res.redirect(`/settings/sub-locations?sid=${req.query.sid}&mid=${req.query.mid}`)
			
		}else{
			
			//data['message']=err.message;
			callback(err,data);
		}
	});
}