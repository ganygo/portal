module.exports = function(req,res,data,callback){
	
	//
	data.filter=Object.assign({},data.filter,req.query)

	if(!data.jsonPage)
		return callback(null,data)
	
	if(req.method=='POST'){
		if(req.body.btnFilter!=undefined){
			
			data.filter=Object.assign({}, data.filter,req.body)

			data.filter['btnFilter']=undefined
			delete data.filter['btnFilter']
			data.filter['page']=1
			res.redirect(`${data.urlPath}?${mrutil.encodeUrl(data.filter)}`)
			return
		}
		data.form=Object.assign(data.form,req.body)
	}

	createPage(req,res,data,(err,data)=>{
		
		callback(err,data)
	})
}


function createPage(req,res,data,callback){
	var func=req.params.func || 'index'
	var jsonPage
	switch(func){
		case 'edit':
		jsonPage=data.jsonPage.edit || data.jsonPage.form
		break
		case 'view':
		jsonPage=data.jsonPage.view || data.jsonPage.edit || data.jsonPage.form
		break
		case 'addnew':
		jsonPage=data.jsonPage.addnew || data.jsonPage.form
		break
		default:
		jsonPage=data.jsonPage.index
		break
	}
	if(jsonPage==undefined){
		return callback({code:'404',message:'Sayfa bulunamadi'},data)
	}

	if(!Array.isArray(jsonPage)){
		jsonPage=[jsonPage]
	}
	data.page=jsonPage
	
	return callback(null,data)

	
}

function normalForm(req,res,item,data,cb){
	data.headerButtons=''
	
	if(item.options.mode!='view'){
		data.headerButtons+=`<button type="submit" form="${'form-general'}" class="btn btn-primary btn-form-header" title="Kaydet" name="btnFormSave"><i class="fas fa-save"></i></button>`
	}
	data.headerButtons+=`<a href="javascript:goBack();" class="btn btn-dark  btn-form-header ml-2" title="Vazgeç"><i class="fas fa-reply"></i></a>`
	var s=``
	var url=`${item.options.dataSource.url}`
	
	if(item.options.mode!='addnew' && (req.params.id || '')!=''){
		if(url.indexOf('?')>-1){
			url=url.split('?')[0] + `/${req.params.id}?` + url.split('?')[1]
		}else{
			url+=`/${req.params.id}`
		}
		
		
		if(req.method=='POST'){
			
			data.form=Object.assign(data.form,req.body)
			api.put(url,req,data.form,(err,resp)=>{
				if(!err){
					res.redirect(`/${req.params.module}/${req.params.page}?sid=${req.query.sid}&mid=${req.query.mid}`)
				}else{
					
					data.message=`${err.code} - ${err.message}`
					// formBuilder.build(item.fields,item.options,data.uiParams,data.form,(err,html)=>{
						formBuilder.build(item,data,(err,html)=>{
							cb(err,html)
						})
					}
				})
			
		}else{
			api.get(url,req,data.filter,(err,resp)=>{
				if(!err){
					// formBuilder.build(item.fields,item.options,data.uiParams,resp.data,(err,html)=>{
						data=Object.assign({},data,resp.data)
						formBuilder.build(item,data,(err,html)=>{
							cb(err,html)
						})
					}else{
						cb(err)
					}

				})
		}
	}else{
		if(req.method=='POST'){
			data.form=Object.assign(data.form,req.body)
			api.post(url,req,data.form,(err,resp)=>{
				if(!err){
					res.redirect(`/${req.params.module}/${req.params.page}?sid=${req.query.sid}&mid=${req.query.mid}`)
				}else{
					
					data.message=`${err.code} - ${err.message}`
					// formBuilder.build(item.fields,item.options,data.uiParams,data.form,(err,html)=>{
						formBuilder.build(item,data,(err,html)=>{
							cb(err,html)
						})
					}
				})
		}else{
			// formBuilder.build(item.fields,item.options,data.uiParams,data.form,(err,html)=>{
				formBuilder.build(item,data,(err,html)=>{
					cb(err,html)
				})
			}

		}
	}

	function gridForm(req,res,item,data,cb){
		var bRemote=false
		if(item.options.dataSource){

			if(item.options.dataSource.type=='remote' && item.options.dataSource.url)
				bRemote=true
		}
		var s=``

		if(bRemote){

			if(item.options.dataSource.url.indexOf('?')>-1){
				var p=getAllUrlParams(item.options.dataSource.url.split('?')[1])
				data.filter=Object.assign({},data.filter,p)
			}
			api.get(item.options.dataSource.url,req,data.filter,(err,resp)=>{
				if(!err){
					data['docs']=resp.data.docs
					data['page']=resp.data.page || 1
					data['recordCount']=resp.data.recordCount || 0
					data['pageSize']=resp.data.pageSize || 0
					data['pageCount']=resp.data.pageCount || 0

					gridBuilder.build(item,data,(err,html)=>{
						cb(err,html)
					})
				}else{
					cb(err)
				}
			})
		}else{
			gridBuilder.build(item,data,(err,html)=>{
				cb(err,html)
			})

		}


	}

	function filterForm(req,res,item,data,cb){

		filterBuilder.build(item,data,(err,html)=>{
			cb(err,html)
		})
	// filterBuilder.generateFilter(item.fields,data.uiParams,data,(err,html)=>{
	// 	cb(err,html)
	// })
}
