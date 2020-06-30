module.exports = function(req,res,callback){
	var data={
		locationList:[],
		form:{
			location:'',
			name:'',
			description:'',
			passive:false
		},
		filter:{

		},
		list:[]
	}

	if(!req.query.db){
		return callback({code:'ACTIVE DB ERROR',message:'Aktif secili bir veri ambari yok.'});
	}
	switch(req.params.func || ''){
		case 'addnew':
		
		addnew(req,res,data,callback);
		break;
		case 'edit':
			edit(req,res,data,callback);
		break;
		case 'view':
			view(req,res,data,callback);
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
		api.get('/' + req.query.db + '/mrp-stations',req,data.filter,(err,resp)=>{
			if(!err){
				data=mrutil.setGridData(data,resp);
			}else{
				eventLog('hata:',err);
			}
			eventLog('data:',data);
			callback(null,data);
		});
	});
		
	

}



function initLookUpLists(req,res,data,cb){
	data.locationList=[];
	api.get('/' + req.query.db + '/locations',req,{passive:false},(err,resp)=>{
		if(!err){
			data.locationList=resp.data.docs;
			data.locationList.unshift({_id:'',locationName:'-Tümü-'})
		}
		cb(null,data);
	});
}

function addnew(req,res,data,callback){
	//data['title']='Yeni Lokasyon';
	initLookUpLists(req,res,data,(err,data)=>{
		if(req.method=='POST'){
			data.form=Object.assign(data.form,req.body);
			api.post('/' + req.query.db + '/mrp-stations',req,data.form,(err,resp)=>{
				if(!err){
					res.redirect('/mrp/stations?db=' + req.query.db +'&sid=' + req.query.sid);
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
			api.put('/' + req.query.db + '/mrp-stations/' + _id,req,data.form,(err,resp)=>{
				if(!err){
					res.redirect('/mrp/stations?db=' + req.query.db +'&sid=' + req.query.sid);

				}else{
					data['message']=err.message;
					callback(null,data);
				}
			});
		}else{
			api.get('/' + req.query.db + '/mrp-stations/' + _id,req,null,(err,resp)=>{
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

function view(req,res,data,callback){
	initLookUpLists(req,res,data,(err,data)=>{
		var _id=req.params.id || '';
		api.get('/' + req.query.db + '/mrp-stations/' + _id,req,null,(err,resp)=>{
			if(!err){
				data.form=Object.assign(data.form,resp.data);
				callback(null,data);
			}else{
				data['message']=err.message;
				callback(null,data);
			}
		});
	});
}

function deleteItem(req,res,data,callback){
	var _id=req.params.id || '';
	api.delete('/' + req.query.db + '/mrp-stations/' + _id,req,(err,resp)=>{
		if(!err){
			res.redirect('/mrp/stations?db=' + req.query.db +'&sid=' + req.query.sid);
			
		}else{
			data['message']=err.message;
			callback(null,data);
		}
	});
}