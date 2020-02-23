module.exports = function(req,res,callback){

	var data={
		stationList:[],
		stepList:[],
		recipeList:[],
		form:{
			_id:'',
			itemType:'product',
	        name:{ value:''},
	        additionalItemIdentification:[{ID:{ value:''}}],
	        brandName:{ value:''},
	        buyersItemIdentification:{ID:{ value:''}},
	        commodityClassification:[
	            { 
	                itemClassificationCode:{value:''}
	            }
	        ],
	        description:{ value:''},
	        keyword:{ value:''},
	        manufacturersItemIdentification:{ID:{ value:''}},
	        modelName:{ value:''},
	        sellersItemIdentification:{ID:{ value:''}},
	        originCountry:{},
	        itemInstance:[],
	        account: null,
	        similar:[],
	        vendors:[{
	            sequenceNumeric:{value:0 },
	            vendor:null,
	            supplyDuration:{value:0 }
	        }],
	        supplyDuration:{value:0 },
	        tags:'',
	        localDocumentId:'',
	        passive:false,
	        barkodlar:''
	        
		},
		filter:{},
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
			getList(req,res,data,callback);
		break;
	}
	
}

function getList(req,res,data,callback){
	data.filter=Object.assign(data.filter,req.query);
		
	data.filter.db=undefined;
	delete data.filter.db;
	data.filter.sid=undefined;
	delete data.filter.sid;
	data.filter['itemType']=data.form.itemType;
	initLookUpLists(req,res,data,(err,data)=>{
		api.get('/' + req.query.db + '/items',req,data.filter,(err,resp)=>{
			if(!err){
				data=mrutil.setGridData(data,resp);
			}
			callback(null,data);
		});
	});
}

function initLookUpLists(req,res,data,cb){
	data.stationList=[];
	data.stepList=[];
	api.get('/' + req.query.db + '/mrp-stations',req,{passive:false},(err,resp)=>{
		if(!err){
			data.stationList=resp.data.docs;
			data.stationList.unshift({_id:'',name:'-Tümü-'})
		}
		api.get('/' + req.query.db + '/mrp-process-steps',req,{passive:false},(err,resp)=>{
			if(!err){
				data.stepList=resp.data.docs;
				data.stepList.unshift({_id:'',name:'-Tümü-'})
			}
			cb(null,data);
		});
	});
}

function addnew(req,res,data,callback){
	if(req.method=='POST'){
		data.form=Object.assign(data.form,req.body);
		var barkodList=data.form.barkodlar.split('\n');
		data.form.additionalItemIdentification=[];
		if(barkodList.length>0){
			barkodList.forEach((e)=>{
				data.form.additionalItemIdentification.push({ID:{value:e}});
			});
		}
		api.post('/' + req.query.db + '/items',req,data.form,(err,resp)=>{
			if(!err){
				res.redirect('/inventory/items?itemType=' + data.form.itemType + '&db=' + req.query.db +'&sid=' + req.query.sid);
			}else{
				data['message']=err.message;
				callback(null,data);
			}
		});
	}else{
		initLookUpLists(req,res,data,(err,data)=>{
			callback(null,data);
		});
	}
}

function edit(req,res,data,callback){
	//data['title']='Lokasyon Duzelt';
	var _id=req.params.id || '';
	data.recipeList=[];
	initLookUpLists(req,res,data,(err,data)=>{
		api.get('/' + req.query.db + '/recipes',req,{item:_id},(err,resp)=>{
			if(!err){
				data.recipeList=resp.data.docs;
				//data.recipeList.unshift({_id:'',name:'-Tümü-'})
			}
			
			if(req.method=='POST' || req.method=='PUT'){
				data.form=Object.assign(data.form,req.body);
				if(_id.trim()==''){
					data['message']='ID bos olamaz';
					callback(null,data);
					return;
				}
				var barkodList=data.form.barkodlar.split('\n');
				data.form.additionalItemIdentification=[];
				if(barkodList.length>0){
					barkodList.forEach((e)=>{
						data.form.additionalItemIdentification.push({ID:{value:e}});
					});
				}
				api.put('/' + req.query.db + '/items/' + _id, req,data.form,(err,resp)=>{
					if(!err){
						res.redirect('/inventory/items?itemType=' + data.form.itemType + '&db=' + req.query.db +'&sid=' + req.query.sid);

					}else{
						data['message']=err.message;
						callback(null,data);
					}
				});
			}else{
				
					api.get('/' + req.query.db + '/items/' + _id,req,null,(err,resp)=>{
						if(!err){
							data.form=Object.assign(data.form,resp.data);
							data.form.barkodlar='';
							if(data.form.additionalItemIdentification.length>0){
								data.form.additionalItemIdentification.forEach((e)=>{
									data.form.barkodlar +=e.ID.value + '\n';
								})
							}
							callback(null,data);
						}else{
							data['message']=err.message;
							callback(null,data);
						}
					});
			}
		});
	});
}

function view(req,res,data,callback){
	var _id=req.params.id || '';
	initLookUpLists(req,res,data,(err,data)=>{
		api.get('/' + req.query.db + '/items/' + _id,req,null,(err,resp)=>{
			if(!err){
				data.form=Object.assign(data.form,resp.data);
				data.form.barkodlar='';
				if(data.form.additionalItemIdentification.length>0){
					data.form.additionalItemIdentification.forEach((e)=>{
						data.form.barkodlar +=e.ID.value + '\n';
					})
				}
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
	api.delete('/' + req.query.db + '/items/' + _id,req,(err,resp)=>{
		if(!err){
			res.redirect('/inventory/items?itemType=' + data.form.itemType + '&db=' + req.query.db +'&sid=' + req.query.sid);
			
		}else{
			
			//data['message']=err.message;
			callback(err,data);
		}
	});
}