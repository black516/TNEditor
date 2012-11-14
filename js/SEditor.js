function SEditor(opt){
	var defaults = {
		base: ["addBus", "addPlane", "addTrain", "addShip",  "addunniurenTrip",  "addunniurenDetail",  "addunniurenImg", "addunniurenDinning", "addunniurenAccommodation"],
	};
	
	// $.extend(true, opt, defaults);
	$.merge(opt.base,defaults.base);
	TNEditor.call(this, opt);
	/*这里放置编辑器的各种配置*/
	this.properties = {
		url:{
			editorCss:"css/sbase.css",
			editableBoxCss:"css/unniurenforedit.css",
			imgListUrl:"/myProject/TNEditor/imglist.js"
		},
		path:{
			imagePath:"css/images/"
		}
	};

	//读配置文件，获得必要的信息
	this.root = SEditorConfig.root;
	//存储文档模板
	this.docTemplate = undefined;
	// $.extend(this.editmenu, this.unMenu);
	// $.extend(true, this.editmenu.menuInfo, this.unniurenMenuInfo);
	this.editbody.bodyInfo.section = this.root;
	// $.extend(this.editbody.bodyEvent, this.unBodyEvent);

	this.init();
	this.readConfig(SEditorConfig.content);
}
SEditor.prototype = new TNEditor();
SEditor.prototype.constructor = SEditor;

//非牛人专线行程编辑器的初始化，先初始化基本编辑器，然后做一些非牛人编辑器的初始化工作
SEditor.prototype.init = function(){
	var self = this;
	TNEditor.prototype.init.call(this);
	$('head', self.editbody.cw.document).append('<link rel="stylesheet" href="'+this.properties.url.editableBoxCss+'" />');//给编辑状态下的非牛人专线
	// $('.'+self.unBodyInfo.section+'', self.editbody.cw.document).removeAttr('contenteditable').css('cursor','default');
	// $('.'+self.unBodyInfo.section+'', self.editbody.cw.document).unbind('paste');
	// $('.'+self.unBodyInfo.section+'', self.editbody.cw.document).after(self.unMenu.tripDelNode).after(self.unMenu.commonDelNode);
	$('head', self.editbody.cw.document).append('<style rel="stylesheet" type="text/css">.redHint{border:1px solid rgba(255, 0, 0, 0.3); background:rgba(255, 0, 0, 0.1);}.greenHint{border:1px solid rgba(0, 101, 165, 0.3); background:rgba(0, 101, 165, 0.1);}</style>');

	//test快速定位面板初始化
	self.rapidPositioning.call(self);
	//快速定位面板加宽
	self.editbody.leftContainer.width(self.editbody.leftContainer.width() - 81);
	self.editbody.rightToolPanel.width(self.editbody.rightToolPanel.width() + 80);

}

//读json配置
SEditor.prototype.readConfig = function(config){
	var editContainer = this.editContainer = $(this.editbody.cw.document).find('[class="'+this.root+'"]');
	editContainer.removeAttr('contenteditable').removeAttr('spellcheck').css('cursor','auto');
	var treeList = this.treeContainer = this.editbody.rightToolPanel.children('.rapidList').parent().empty();
	this.addTreeToolbar(treeList);
	readObject(config, editContainer, undefined);
	this.docTemplate = editContainer.html();
	this.createTree(editContainer.parent(), treeList);

	//json生成html
	function readObject(obj, childContainer, fatherContainer){
		if($.isArray(obj)){
			$.each(obj, function(i,n){
				readObject(n, childContainer, fatherContainer);
			});
		}else if(typeof obj == 'object'){
			for(var k in obj){
				console.debug(k.split('.')[0], k.split('.')[1]);
				//文档相关变量
				var editable = false;
				var addable = false;//用来标识是否可新增，UI的体现就是会有个加号
				var dom, className;
				
				//如果当前key的值是字符串，那么这个值就是最终的节点
				if(typeof obj[k] == 'string'){
					switch(k){
						case 'src':
							if(childContainer && fatherContainer){
								fatherContainer.find(childContainer).attr('src',obj[k]);
							}
							break;
						case 'title':
							if(childContainer && fatherContainer){
								fatherContainer.find(childContainer).attr('title',obj[k]);
							}
							break;
						default:
							if(childContainer && fatherContainer){
								fatherContainer.find(childContainer).append(obj[k]);
							}
					}
				}else{
					//以当前key组成dom
					if(k.indexOf('#') != -1){
						//这里打算扩展其他操作
						$.each(k.split('#')[1].split(','), function(i,n){
							switch(n){
								case 'edit':
									editable = true;
									break;
								default:;
							}
						})						
					}
					temp = k.split('#')[0];
					dom = temp.split('.')[0];
					className = temp.split('.')[1];
					var element = $(document.createElement(dom)).addClass(className);
					if(editable) element.attr('contenteditable','true');
					console.debug(childContainer,9999);
					if(childContainer && fatherContainer){
						fatherContainer.find(childContainer).append(element);
					}else if(childContainer){
						childContainer.append(element);
					}
				}

				readObject(obj[k], element, childContainer);
			}
		}
	}	
}

//生成大纲:两种方案，根据标签来生成;根据json配置（需要有标记）生成【实验失败】
//这里创建树和事件添加都加在一块了，需要拆解？
SEditor.prototype.createTree = function(dom, leaf, tree){
		var self = this;
		var nodes = ("DIV,P,TABLE,UL,LI,DL,OL,FIELDSET,FORM,H1,H2,H3,H4,H5,H6,HR,PRE").split(',');//所有的块级元素
		var wrapper;
		
		if(leaf && tree){
			wrapper = tree.find(leaf);
		}else if(leaf){
			wrapper = leaf;
			wrapper.children(':not(:first)').remove();
		}
		var count = 0;
		$.each(dom.children(), function(i,n){
			var ul = $('<ul />');
			var li = $('<li />');
			
			var hasInline = false;
			$.each($(n).children(),function(j,m){
				if($.inArray(m.nodeName.toUpperCase(), nodes) == -1){
					hasInline = true;
				}
			});
			if(hasInline || ($(n).children().size() == 0 && $(n).text())){
				//添加v-label标识
				var label = new Date().getTime();
				li.attr('v-label', label);
				$(n).attr('v-label', label);
				var active = '';
				if($(n).attr('s-active')){
					active = 'active';
				}
				li.addClass(active);	
				//资源节点处理
				var path = self.properties.path.imagePath;
				var icon = self.resManager.icon;
				if($(n).find('img').size() > 0){
					var span = $('<span />').text($(n).find('img').attr('title').slice(0,5) + '..').css('cursor','default');
					li.append(span).css({'padding-left':'28px','background-image':'url('+path+'/'+icon.img+')','background-repeat':'no-repeat','background-position':'10px 2px'});
				}else{
					var span = $('<span />').text($(n).text().slice(0,8) + '..').css('cursor','default');
					li.append(span).css({'padding-left':'28px','background-image':'url('+path+'/'+icon.text+')','background-repeat':'no-repeat','background-position':'10px 2px'});
				}
				wrapper.append(li);

				//节点事件处理
				li.unbind('click').click(function(e){
					var name = self.treeContainer.get(0).className.split(' ')[0];
					//清除其他active
					//清除文档的选中标记
					$(this).parents('.'+name).find('.active').removeClass('active');
					self.editContainer.find('[s-active="active"]').removeAttr('s-active');
					self.removeActivedBox();
					$(this).toggleClass('active');
					//让文档相应部分也显示选中状态
					var selected = $(this).parents('.' + name).find('[class="active"]');
					var label = selected.attr('v-label');
					var index = $(this).parents('.'+name).find('[v-label="'+label+'"]').index(selected);
					var docSelected = self.editContainer.find('[v-label="'+label+'"]').eq(index);
					//让文档记录树的active状态
					docSelected.attr('s-active','active');

					var margin = {
						top: parseInt(docSelected.css('marginTop')),
						right: parseInt(docSelected.css('marginRight')),
						bottom: parseInt(docSelected.css('marginBottom')),
						left: parseInt(docSelected.css('marginLeft'))
					}
					var padding = {
						top: parseInt(docSelected.css('paddingTop')),
						right: parseInt(docSelected.css('paddingRight')),
						bottom: parseInt(docSelected.css('paddingBottom')),
						left: parseInt(docSelected.css('paddingLeft'))
					}
					self.displayActivedBox(docSelected.offset().left, docSelected.offset().top, docSelected.width(), docSelected.height(), margin, padding);
				})
			}else{
				// console.debug(n.className, wrapper, 8888);
				ul.attr('v-label', n.className);
				if(wrapper[0].nodeName.toUpperCase() == 'DIV'){
					wrapper.append(ul);
				}else{
					var name = self.treeContainer.get(0).className.split(' ')[0];
					var deep = wrapper.parentsUntil('.'+name).children('ul').size();//tree的深度用于节点收缩与伸展
					var status = 'spread';
					var active = '';
					var statusX = $(n).attr('s-collapse-status');
					if(statusX == 'collapse'){
						status = 'collapse';
						ul.hide();
					}else if(statusX == 'spread'){
						status = 'spread';
						ul.show();
					}
					if($(n).attr('s-active')){
						active = 'active';
					}
					var div = $('<div class="'+active+'"><a class="toggleIcon '+status+'"></a><a class="nodeLabel" href="javascript:void(0);">level' + deep + '</a></div>');
					var lix = $('<li></li>').append(div);
					lix.append(ul);
					wrapper.append(lix);

					//collapse 按钮
					div.children('.toggleIcon').unbind('click').click(function(e){
						div.children('.nodeLabel').trigger('click');
						$(this).parent().next('ul').toggle();
						$(this).toggleClass('spread collapse');
						//让文档记录树的collapse状态
						var selected = $(this).parents('.' + name).find('[class="active"]').next();
						var label = selected.attr('v-label');
						var index = $(this).parents('.'+name).find('[v-label="'+label+'"]').index(selected);
						var docSelected = self.editContainer.find('[class="'+label+'"]').eq(index);
						var status = $.inArray('collapse',$(this).attr('class').split(' ')) == -1 ? 'spread' : 'collapse';
						docSelected.attr('s-collapse-status',status);
					});

					//激活按钮
					div.children('.nodeLabel').unbind('click').click(function(e){
						var name = self.treeContainer.get(0).className.split(' ')[0];
						//清除其他active
						//清除文档的选中标记
						$(this).parents('.'+name).find('div').removeClass('active');
						self.editContainer.find('[s-active="active"]').removeAttr('s-active');
						self.removeActivedBox();
						$(this).parent().toggleClass('active');
						//让文档相应部分也显示选中状态
						var selected = $(this).parents('.' + name).find('[class="active"]').next();
						var label = selected.attr('v-label');
						var index = $(this).parents('.'+name).find('[v-label="'+label+'"]').index(selected);
						var docSelected = self.editContainer.find('[class="'+label+'"]').eq(index);
						//让文档记录树的active状态
						docSelected.attr('s-active','active');

						var margin = {
							top: parseInt(docSelected.css('marginTop')),
							right: parseInt(docSelected.css('marginRight')),
							bottom: parseInt(docSelected.css('marginBottom')),
							left: parseInt(docSelected.css('marginLeft'))
						}
						var padding = {
							top: parseInt(docSelected.css('paddingTop')),
							right: parseInt(docSelected.css('paddingRight')),
							bottom: parseInt(docSelected.css('paddingBottom')),
							left: parseInt(docSelected.css('paddingLeft'))
						}
						self.displayActivedBox(docSelected.offset().left, docSelected.offset().top, docSelected.width(), docSelected.height(), margin, padding);
					});
				}
				self.createTree($(n), ul, leaf);
			}
		})
}

SEditor.prototype.addTreeToolbar = function(treeList){
	var self = this;
	var toolbar = $('<ul class="treeToolbar"><li><a class="addBlock"></a></li><li><a class="cloneBlock"></a></li><li><a class="delBlock"></a></li><li><a class="moveUp"></a></li><li><a class="moveDown"></a></li><li style="float:right;"><a class="collapseTree"></a></li><li style="float:right;"><a class="refreshTree"></a></li></ul>');
	//加事件，clone and delete node
	toolbar.unbind('click').click(function(e){
		//用switch case改写并拆解
		if($(e.target)[0].className == 'addBlock'){
			var name = self.treeContainer.get(0).className.split(' ')[0];
			var label = $(self.docTemplate).attr('class');
			var selected;
			if($(this).next().find('[class="active"]').next().attr('v-label') == label){
				selected = $(this).next().find('[class="active"]').next();
			}else{
				selected = $(this).next().find('[class="active"]').parents('[v-label="'+label+'"]');
			} 
			var index = $(this).parents('.'+name).find('[v-label="'+label+'"]').index(selected);
			//如果有的话after，没有的话就append
			if(self.editContainer.find('[class="'+label+'"]').size() > 0){
				var beAdded =  self.editContainer.find('[class="'+label+'"]').eq(index);
				beAdded.after(self.docTemplate);
			}else{
				self.editContainer.append(self.docTemplate);
			}
			self.removeActivedBox();
			self.createTree(self.editContainer.parent(), self.treeContainer);
		}
		if($(e.target)[0].className == 'cloneBlock'){
			var name = self.treeContainer.get(0).className.split(' ')[0];
			var selected = $(this).next().find('[class="active"]').next();
			var label = selected.attr('v-label');
			//这里find函数的选择器没有用'.xxxx'的形式，主要是因为该方法在Chrome中有bug
			var index = $(this).parents('.'+name).find('[v-label="'+label+'"]').index(selected);
			console.debug(label,111111);
			var beCloned =  self.editContainer.find('[class="'+label+'"]').eq(index);
			var clone = beCloned.clone();
			beCloned.after(clone);
			self.removeActivedBox();
			self.createTree(self.editContainer.parent(), self.treeContainer);
		}
		if($(e.target)[0].className == 'delBlock'){
			var name = self.treeContainer.get(0).className.split(' ')[0];
			var selected = $(this).next().find('[class="active"]').next();
			var label = selected.attr('v-label');
			var index = $(this).parents('.'+name).find('[v-label="'+label+'"]').index(selected);
			var beDeleteed =  self.editContainer.find('[class="'+label+'"]').eq(index);
			//在删除前最好先保存下用localStorage(TODO...)
			//这边做撤销远远比做弹框好，弹框相当影响用户操作效率
			beDeleteed.remove();
			self.removeActivedBox();
			self.createTree(self.editContainer.parent(), self.treeContainer);
		}
		if($(e.target)[0].className == 'moveUp'){
			//针对普通节点的移动
			//针对资源节点的移动，资源节点肯定是li标签
			var name = self.treeContainer.get(0).className.split(' ')[0];
			var selected, label, index, beMoved;
			if($(this).next().find('[class="active"]')[0].nodeName.toUpperCase() == 'LI'){
				selected = $(this).next().find('[class="active"]');
				label = selected.attr('v-label');
				index = $(this).parents('.'+name).find('[v-label="'+label+'"]').index(selected);
				beMoved =  self.editContainer.find('[v-label="'+label+'"]').eq(index);
			}else{
				selected = $(this).next().find('[class="active"]').next();
				label = selected.attr('v-label');
				index = $(this).parents('.'+name).find('[v-label="'+label+'"]').index(selected);
				beMoved =  self.editContainer.find('[class="'+label+'"]').eq(index);
			}
			var temp = beMoved.clone();
			if(beMoved.prev().size() > 0){
				beMoved.prev().before(temp);
				beMoved.remove();
				self.removeActivedBox();
				self.createTree(self.editContainer.parent(), self.treeContainer);
			}else{
				self.editfooter.setStatusMsg('只能在相同级别元素间移动！');
			}

		}
		if($(e.target)[0].className == 'moveDown'){
			//针对普通节点的移动
			//针对资源节点的移动，资源节点肯定是li标签
			var name = self.treeContainer.get(0).className.split(' ')[0];
			var selected, label, index, beMoved;
			if($(this).next().find('[class="active"]')[0].nodeName.toUpperCase() == 'LI'){
				selected = $(this).next().find('[class="active"]');
				label = selected.attr('v-label');
				index = $(this).parents('.'+name).find('[v-label="'+label+'"]').index(selected);
				beMoved =  self.editContainer.find('[v-label="'+label+'"]').eq(index);
			}else{
				selected = $(this).next().find('[class="active"]').next();
				label = selected.attr('v-label');
				index = $(this).parents('.'+name).find('[v-label="'+label+'"]').index(selected);
				beMoved =  self.editContainer.find('[class="'+label+'"]').eq(index);
			}
			var temp = beMoved.clone();
			if(beMoved.next().size() > 0){
				beMoved.next().after(temp);
				beMoved.remove();
				self.removeActivedBox();
				self.createTree(self.editContainer.parent(), self.treeContainer);
			}else{
				self.editfooter.setStatusMsg('只能在相同级别元素间移动！');
			}	
		}
		if($(e.target)[0].className == 'collapseTree'){
			var ul = self.treeContainer.children().last().find('ul');
			$.each(ul,function(i,n){
				$(n).hide();
				$(n).prev().children().first().removeClass('spread').addClass('collapse');
			});
		}
		if($(e.target)[0].className == 'refreshTree'){
			self.removeActivedBox();
			self.createTree(self.editContainer.parent(), self.treeContainer);
		}
	});

	treeList.append(toolbar);
}


SEditor.prototype.displayActivedBox = function(left, top, width, height, margin, padding){
	//怎样让激活表示层不要阻隔事件传递到下层,本来想通过找办法让事件穿过这个层的，但是尝试无果。
	//盒模型很重要哦~
	var bw = 2;//bw = borderWidth
	var bc = '#ccdce7';//borderColor
	var activedBoxLeft = $('<div class="activedBoxLeft" style="position:absolute;left:'+(left-bw)+'px;top:'+(top-bw)+'px;width:'+bw+'px;height:'+(height+2*bw+padding.top+padding.bottom)+'px;background:'+bc+';"></div>');
	var activedBoxTop = $('<div class="activedBoxTop" style="position:absolute;left:'+(left)+'px;top:'+(top-bw)+'px;width:'+(width+bw+padding.left+padding.right)+'px;height:'+bw+'px;background:'+bc+';"></div>');
	var activedBoxRight = $('<div class="activedBoxTop" style="position:absolute;left:'+(left+bw+width+padding.left+padding.right)+'px;top:'+(top-bw)+'px;width:'+bw+'px;height:'+(height+2*bw+padding.top+padding.bottom)+'px;background:'+bc+';"></div>');
	var activedBoxBottom = $('<div class="activedBoxBottom" style="position:absolute;left:'+(left)+'px;top:'+(top+height+padding.top+padding.bottom)+'px;width:'+(width+bw+padding.left+padding.right)+'px;height:'+bw+'px;background:'+bc+';"></div>');
	this.editContainer.append(activedBoxLeft).append(activedBoxTop).append(activedBoxRight).append(activedBoxBottom);
}

SEditor.prototype.removeActivedBox = function(){
	if(this.editContainer.find('[class="activedBoxTop"]').size() > 0){
		this.editContainer.find('[class="activedBoxTop"]').remove();
		this.editContainer.find('[class="activedBoxRight"]').remove();
		this.editContainer.find('[class="activedBoxBottom"]').remove();
		this.editContainer.find('[class="activedBoxLeft"]').remove();
	}
}

SEditor.prototype.resManager = {
	icon: {
		img: 'res_img.png',
		text: 'res_text.png'
	}
}

//把删除节点放到这里公用,也许这也可以用var变量来保存，作为私有属性(待重构)
// SEditor.prototype.unMenu = {
// 	tripDelNode: $('<div id="DelNode"><span class="upBlockSpan"><a class="upBlock" href="javascript:void(0);"></a></span><span class="downBlockSpan"><a class="downBlock" href="javascript:void(0);"></a></span><span class="deleteBlockSpan"><a class="deleteBlock" href="javascript:void(0);"></a></span></div>'),
// 	commonDelNode:  $('<div id="DelNode"><span class="upBlockSpan"><a class="deleteBlock" href="javascript:void(0);"></a></span></div>')
// }

//也许这也可以用var变量来保存，作为私有属性(待重构)
// SEditor.prototype.unniurenMenuInfo = {
// 	baseInfo:{
// 		preview:{
// 			name: "预览",
// 			imgPath: "preview.png",
// 			action: "preview"
// 		},
// 		addBus:{
// 			name: "巴士",
// 			imgPath: "bus.gif",
// 			action: "addBusAction"
// 		},
// 		addPlane:{
// 			name: "飞机",
// 			imgPath: "plain.gif",
// 			action: "addPlaneAction"
// 		},
// 		addTrain:{
// 			name: "火车",
// 			imgPath: "train.gif",
// 			action: "addTrainAction"
// 		},
// 		addShip:{
// 			name: "轮船",
// 			imgPath: "ship.gif",
// 			action: "addShipAction"
// 		},
// 		addunniurenTrip:{
// 			name: "添加行程",
// 			imgPath: "",
// 			action: "addunniurenTripAction"
// 		},
// 		addunniurenDetail:{
// 			name: "行程描述",
// 			imgPath: "",
// 			action: "addunniurenDetailAction"
// 		},
// 		addunniurenImg: {
// 			name: "行程图片",
// 			imgPath: "",
// 			action: "addunniurenImgAction"
// 		},
// 		addunniurenDinning: {
// 			name: "用餐",
// 			imgPath: "",
// 			action: "addunniurenDiningAction"
// 		},
// 		addunniurenAccommodation: {
// 			name: "住宿",
// 			imgPath: "",
// 			action: "addunniurenAccommodationAction"
// 		},
// 		addunniurenShoppingStore: {
// 			name: "购物店",
// 			imgPath: "",
// 			action:"addunniurenShoppingStoreAction"
// 		}
// 	},
// 	action:{
// 		preview: function(){
// 			var self = this;
// 			var win = window.open("about:blank");
// 			win.document.write('<html><head><link type="text/css" rel="stylesheet" href="css/unniuren.css" /></head><body>'+self.editmenu.editbody.bodyEvent.getHtmlContent.call(self.editmenu, true)+'</body></html>');
// 			win.document.close();
// 		},
// 		addBusAction: function(){
// 			var self = this;
// 			var imgURL = self.editmenu.imagePath + self.editmenu.menuInfo.baseInfo.addBus.imgPath;
// 			self.editmenu.menuInfo.action.addIconAction(imgURL, self);
// 		},
// 		addPlaneAction: function(){
// 			var self = this;
// 			var imgURL = self.editmenu.imagePath + self.editmenu.menuInfo.baseInfo.addPlane.imgPath;
// 			self.editmenu.menuInfo.action.addIconAction(imgURL, self);
// 		},
// 		addTrainAction: function(){
// 			var self = this;
// 			var imgURL = self.editmenu.imagePath + self.editmenu.menuInfo.baseInfo.addTrain.imgPath;
// 			self.editmenu.menuInfo.action.addIconAction(imgURL, self);
// 		},
// 		addShipAction: function(){
// 			var self = this;
// 			var imgURL = self.editmenu.imagePath + self.editmenu.menuInfo.baseInfo.addShip.imgPath;
// 			self.editmenu.menuInfo.action.addIconAction(imgURL, self);
// 		},
// 		addIconAction: function(imgURL, self){
// 			//加入交通工具的插入点的判断，如果不是在行程里不让插入
// 			// var self = this;
// 			var sel = self.editbody.cw.document.getSelection();
// 			var range = sel.getRangeAt(0);
// 			self.editbody.cw.document.execCommand("insertImage",false,imgURL);
// 			//插入图片的另一种方式
// 			// var img = document.createElement('img');
// 			// img.src = imgURL;
// 			// range.surroundContents(img);
// 			$(self.editbody.cw.document.activeElement).focus();
// 			range.collapse(false);
// 			range.setEndAfter(img);
// 			range.setStartAfter(img);
// 			//光标强制刷新
// 			sel.removeAllRanges();
// 			sel.addRange(range);
// 		},
// 		addunniurenTripAction: function(e, cnt){
// 			var self = this;
// 			var trip = self.unniurentpl.trip();
// 			trip = $(trip);
// 			if(arguments.length == 2 && cnt){
// 				$('.day_title_new h3 div', trip).html(cnt);
// 			}
// 			//console.debug(self.editbody.cw.document.activeElement);
// 			//在编辑器未有光标的情况下，直接把行程块插到当前最后一个行程后面；有光标的情况下就在光标所在行程块的后面插入
// 			if($('.tourContent_new', self.editbody.cw.document).length <= 0 || self.editbody.cw.document.activeElement.nodeName == 'BODY'){
// 				$('.'+self.unBodyInfo.section, self.editbody.cw.document).append(trip);
// 				var sel = self.editbody.cw.document.getSelection();
// 				var range = sel.getRangeAt(0);
// 			}else{
// 				var sel = self.editbody.cw.document.getSelection();
// 				var range = sel.getRangeAt(0);
// 				$(self.editbody.cw.document.activeElement).parentsUntil('.tourContent_new').last().parent().after(trip);
// 			}
// 			self.refreshDay();

// 			$(".day_title_new div",trip).focus();
// 			range.selectNodeContents($(".day_title_new div",trip)[0]);
// 			//光标强制刷新
// 			sel.removeAllRanges();
// 			sel.addRange(range);
// 			trip.css('cursor','text');
// 			var em = $('.day_title_new em', trip);
// 			var trips = em.parentsUntil('.tourContent_new').last().parent();
// 			self.bindDelEvent.delEvent.call(self, em, trips, self.unMenu.tripDelNode, 70, 0);
// 			self.bindPaste($(".day_title_new div",trip));
// 		},
// 		addunniurenDetailAction: function(e, cnt, index){
// 			var self = this;
// 			var detail = self.unniurentpl.detail();
// 			detail = $(detail);

// 			if(arguments.length == 3 && cnt){
// 				detail.html(cnt);
// 				$(".day_title_new h3",$(".tourContent_new",self.editbody.cw.document).eq(index)).after(detail);
// 			}else{
// 				if($('.tourContent_new', self.editbody.cw.document).length <= 0){
// 					self.editfooter.setStatusMsg("请先添加行程");
// 				}else if(self.editbody.cw.document.activeElement.nodeName == 'BODY'){
// 					console.debug(self);
// 					self.editfooter.setStatusMsg("请先定位光标，选择要插入的位置");
// 				}else{
// 					if($(self.editbody.cw.document.activeElement).hasClass('tour_line_f')){
// 						$(self.editbody.cw.document.activeElement).after(detail);
// 					}else{
// 						$(self.editbody.cw.document.activeElement).parentsUntil('.day_title_new').last().parent().append(detail);
// 					}
// 					var sel = self.editbody.cw.document.getSelection();
// 					var range = sel.getRangeAt(0);
// 					detail.focus();
// 					range.selectNodeContents(detail[0]);
// 					//光标强制刷新
// 					sel.removeAllRanges();
// 					sel.addRange(range);
// 					detail.css('cursor','text');
// 				}
// 			}

// 			self.bindDelEvent.delEvent.call(self, detail, detail, self.unMenu.commonDelNode, 32, 0);
// 			self.bindPaste(detail);
// 		},
// 		addunniurenImgAction: function(e, cnt, index){
// 			var self = this;
// 			if ($(".tourContent_new",self.editbody.cw.document).size() == 0){
// 				self.editfooter.setStatusMsg("请先添加行程");
// 				return;
// 			}
// 			if (arguments.length == 3 && cnt && typeof index !== "string"){
// 				createImgList(cnt,index);
// 				self.unniurenMenuInfo.action["showunniurenImgHint"].call(self, null);
// 			}else if(arguments.length == 3 && cnt == '' && typeof index !== "string"){
// 				return;
// 			}else{
// 				self.editfooter.setStatusMsg("正在读取图片资源....");
// 				$.ajax({
// 					type: "POST",
// 					dataType: "json",
// 					url: self.properties.url.imgListUrl + "?r="+Math.random(),
// 					data: this.getHtmlContentByDay(),
// 					//url: "/main.php?r="+Math.random(),
// 					//data: {
// 					//	'do':'route_ajax_new',
// 					//	'method':'matchSchedulePlacePhoto',
// 					//	'schedule_info':this.getPOHtmlByDay()
// 					//	},
// 					success: function(data){
// 						if (!$.isEmptyObject(data)){
// 							createImgList(data);
// 							self.unniurenMenuInfo.action["showunniurenImgHint"].call(self, null);//重新搞，搞得专业些
// 							self.editfooter.setStatusMsg("图片已添加");
// 						}
// 					}
// 				});
// 			}

// 			function createImgList(data,index){
// 				if (typeof data === "string"){
// 					var ul = $(self.unniurentpl.img());
// 					ul.html(data);
// 					$(".day_title_new h3",$(".tourContent_new",self.editbody.cw.document).eq(index)).after(ul);
// 					$("li",$(".day_title_new",$(".tourContent_new",self.editbody.cw.document).eq(index))).each(function (i,n){
// 						self.bindDelEvent.delEvent.call(self, $(n), $(n), self.unMenu.commonDelNode, 23, -2);
// 					});
// 				}else{
// 					$(".tourContent_new",self.editbody.cw.document).each(function (i,n){
// 						if ($(".day_title_new ul.time_s_photo",n).size() != 0){
// 							$(".day_title_new ul.time_s_photo",n).remove();
// 						}
// 						if ($(".day_title_new ul.time_s_photo",n).size() == 0){
// 							var ul = $(self.unniurentpl.img());
// 							if (typeof(data[i+1]) != 'undefined' && data[i+1].length>0){
// 								$.each(data[i+1],function(i,m){
// 									var li = $(self.unniurentpl.imgList());
// 									// var img = $("<img id='"+m.id+"' src='"+m.imgUrl+"' alt='" + m.address + "' onmouseout='hidePreview(event);' onmouseover='showPreview(event, " + m.id + ", 0);' />");
// 									var img = $("<img id='"+m.id+"' src='"+m.imgUrl+"' alt='" + m.address + "' />");
// 									$("a",li).append(img);
// 									var imglink = $('<a class="cgrey" target="_blank" href="' + self.imageHref + m.id + '">' + m.name + '</a>');
// 									$("div",li).append(imglink);
// 									ul.append(li);
// 								});
// 							}
// 							$(".day_title_new h3",n).after(ul);
// 							//self.msgHide();
// 							$("li",$(".day_title_new",n)).each(function (i,n){
// 								self.bindDelEvent.delEvent.call(self, $(n), $(n), self.unMenu.commonDelNode, 23, -2);
// 							});
// 						}
// 					})
// 				}
// 			}
// 		},
// 		addunniurenDiningAction: function(e, cnt, index){
// 			var self = this;
// 			var foodAndSleep = $(self.unniurentpl.poe_Tourfood());
// 			var food = $('');

// 			if(arguments.length == 3 && cnt){
// 				foodAndSleep.html(cnt);
// 				$(".day_title_new",$(".tourContent_new",self.editbody.cw.document).eq(index)).after(foodAndSleep);
// 				food = $("div.tour_item",foodAndSleep);
// 				if(food.size() > 0){
// 					$.each(food,function(i,n){
// 						$('div', $(n)).attr('contenteditable','true');
// 						self.bindDelEvent.delEvent.call(self, $(n), $(n), self.unMenu.commonDelNode, 32, 0);
// 						self.bindPaste($('div',$(n)));
// 					})
// 				}
// 			self.bindDelEvent.delEvent.call(self, foodAndSleep, foodAndSleep, self.unMenu.commonDelNode, 32, 2);
// 			}else{
// 				food = $(self.unniurentpl.poe_Dining());
// 				var activeElement = self.editbody.cw.document.activeElement;

// 				if($('.tourContent_new', self.editbody.cw.document).length <= 0){
// 					self.editfooter.setStatusMsg("请先添加行程");
// 				}else if(activeElement.nodeName == 'BODY'){
// 					console.debug(self);
// 					self.editfooter.setStatusMsg("请先定位光标，选择要插入的位置");
// 				}else{
// 					var activeDayContent = $(activeElement).parents('.tourContent_new');
// 					var foodAndSleepWrapper = activeDayContent.children('.tour_food_f');
// 					if(foodAndSleepWrapper.length > 0){
// 						foodAndSleepWrapper.append(food);
// 					}else{
// 						activeDayContent.append(foodAndSleep);
// 						activeDayContent.children('.tour_food_f').append(food);
// 					}
					
// 					var sel = self.editbody.cw.document.getSelection();
// 					var range = sel.getRangeAt(0);
// 					//这里相当坑爹，要注意这里的focus是必要的，这关系到下面selectNodeContents的高亮是否是蓝色。规则应该是设置了contenteditable为true的最近父节点
// 					$('div',food).focus();
// 					range.selectNodeContents($('.po_dining_diy', food)[0]);
// 					//光标强制刷新
// 					sel.removeAllRanges();
// 					sel.addRange(range);
// 					food.css('cursor','text');
// 					self.bindDelEvent.delEvent.call(self, food, food, self.unMenu.commonDelNode, 32, 0);
// 					self.bindDelEvent.delEvent.call(self, foodAndSleep, foodAndSleep, self.unMenu.commonDelNode, 32, 2);
// 					self.bindPaste($('div',food));
// 				}
// 			}
// 		},
// 		addunniurenAccommodationAction: function(){
// 			var self = this;
// 			var foodAndSleep = $(self.unniurentpl.poe_Tourfood());
// 			var sleep = $(self.unniurentpl.poe_Accommodation());
// 			var activeElement = self.editbody.cw.document.activeElement;

// 			// if(arguments.length == 2 && cnt){
// 			// 	$('.tour_line_f', food).html(cnt);
// 			// }

// 			if($('.tourContent_new', self.editbody.cw.document).length <= 0){
// 				self.editfooter.setStatusMsg("请先添加行程");
// 			}else if(activeElement.nodeName == 'BODY'){
// 				console.debug(self);
// 				self.editfooter.setStatusMsg("请先定位光标，选择要插入的位置");
// 			}else{
// 				var activeDayContent = $(activeElement).parents('.tourContent_new');
// 				var foodAndSleepWrapper = activeDayContent.children('.tour_food_f');
// 				if(foodAndSleepWrapper.length > 0){
// 					foodAndSleepWrapper.append(sleep);
// 				}else{
// 					activeDayContent.append(foodAndSleep);
// 					activeDayContent.children('.tour_food_f').append(sleep);
// 				}
				
// 				var sel = self.editbody.cw.document.getSelection();
// 				var range = sel.getRangeAt(0);
// 				//这里相当坑爹，要注意这里的focus是必要的，这关系到下面selectNodeContents的高亮是否是蓝色。规则应该是设置了contenteditable为true的最近父节点
// 				$('div',sleep).focus();
// 				range.selectNodeContents($('div',sleep)[0]);
// 				//光标强制刷新
// 				sel.removeAllRanges();
// 				sel.addRange(range);
// 				sleep.css('cursor','text');
// 				self.bindDelEvent.delEvent.call(self, sleep, sleep, self.unMenu.commonDelNode, 32, 0);
// 				self.bindDelEvent.delEvent.call(self, foodAndSleep, foodAndSleep, self.unMenu.commonDelNode, 32, 2);
// 				self.bindPaste($('div',sleep));
// 			}
// 		},
// 		addunniurenShoppingStoreAction: function(){

// 		},
// 		showunniurenImgHint: function(){
// 			var self = this;
// 			var img_m = $("<div style='position:absolute;z-index:99999;border:1px solid #ccc;background:#efefef;display:none;'><img src='' style='border:2px solid #fff' /><span style='display:block;text-align:right;font-weight:bold;color:#333;padding-right:10px;'></span></div>");
// 			$('.day_title_new', self.editbody.cw.document).append(img_m);
// 			$(".day_title_new ul.time_s_photo img", self.editbody.cw.document).each(function(i, n){
// 			$(n).unbind('mouseover').bind('mouseover', function(e){
// 				var x = $(this).position().left + 80;
// 				var y = $(this).position().top;
// 				img_m.css({'top' : y, 'left' : x});
// 				img_m.css('display', 'block');
// 				var srcString = $(this).attr('src');
// 				var index = srcString.lastIndexOf('.');
// 				var srcString_x = srcString.slice(0, index-1) + srcString.slice(index-1, index).replace('s','m') + srcString.slice(index);
// 				$('img', img_m).attr('src',srcString_x);
// 				$('span', img_m).text($(n).attr('alt'));
// 			}).unbind('mouseout').bind('mouseout',function(e){
// 				img_m.css('display','none');
// 			});
// 			});
// 		}
// 	}
// }

//用于快速定位文档的工具
SEditor.prototype.rapidPositioning = function (){
	var self = this;
	self.editbody.leftContainer.css({'height':self.height - 60,'width':self.width - 100});
	self.editbody.rightToolPanel.css({'height':self.height - 60,'width':'97px'});
	var list = $('<ul class="rapidList"></ul>');
	self.editbody.rightToolPanel.append(list);
}

//给插入的行程相关的块增加删除、选中、上下移动按钮，这样做的主要原因是，行程块的部分内容无法通过光标backspace或delete删除，也为了保证编辑器行程内容结构的纯净
// SEditor.prototype.bindDelEvent = {
// 	delEvent: function(trigger, dom, delNode, offsetX, offsetY){
// 		var self = this;
// 		var delContent = null;
// 		trigger.unbind('hover').hover(function(e){
// 			//console.debug(delNode);
// 			var pos = $(this).position();
// 			delNode.css({'left':pos.left - offsetX, 'top':pos.top - offsetY, 'opacity': 0});
// 			delNode.stop();
// 			delNode.show();
// 			delNode.animate({opacity:1},'slow');
// 			delNode.unbind('hover').hover(function(){
// 				delNode.stop();
// 				delNode.show();
// 				delNode.animate({opacity:1},'slow');
// 				//trip.css({'border':'1px solid rgba(255, 0, 0, 0.3)', 'background':'rgba(255, 0, 0, 0.1)'});
// 				delNode.css('cursor','pointer');
// 			},
// 			function(){
// 				delNode.stop();
// 				delNode.animate({opacity:0},'slow', function(){delNode.hide();});
// 				//dom.css({'border':'1px solid white', 'background':'none'});
// 			});
// 			$('.deleteBlock', delNode).unbind('hover').hover(function(){
// 				dom.addClass('redHint');
// 			},function(){
// 				dom.removeClass('redHint');
// 			});
// 			$('.deleteBlock', delNode).unbind('click').click(function(){
// 				//hack 删除图片的时候，如果图片是最后一张，则把外面的ul也删除掉。
// 				if(dom.parent().hasClass('time_s_photo') && dom.parent().children().length == 1){
// 					dom.parent().remove();
// 				}else{
// 					dom.remove();
// 				}
// 				self.refreshDay();
// 				delNode.hide();
// 			});
// 			$('.upBlock', delNode).unbind('hover').hover(function(){
// 				dom.addClass('greenHint');
// 			},function(){
// 				dom.removeClass('greenHint');
// 			});
// 			$('.upBlock', delNode).unbind('click').click(function(){
// 				dom.prev().before(dom);
// 				self.refreshDay();
// 				delNode.hide();
// 			});
// 			$('.downBlock', delNode).unbind('hover').hover(function(){
// 				dom.addClass('greenHint');
// 			},function(){
// 				dom.removeClass('greenHint');
// 			});
// 			$('.downBlock', delNode).unbind('click').click(function(){
// 				dom.next().after(dom);
// 				self.refreshDay();
// 				delNode.hide();
// 			});
// 		},
// 		function(){
// 			delNode.stop();
// 			delNode.animate({opacity:0},'slow', function(){delNode.hide();});
// 		});
// 	}
// }

// SEditor.prototype.refreshDay = function (){
// 	//重新刷一遍天数，保证天数顺序
// 	var self = this;
// 	$('.rapidList',self.editbody.rightToolPanel).empty();
// 	$('.tourContent_new > .day_title_new em', self.editbody.cw.document).each(function(i,n){
// 		var day = $(n).text().replace(/{day}|\d+/g, i + 1);
		
// 		$(n).text(day);
// 		$(n).attr('name',day);
// 		$(n).parent().parent().parent().attr('name',day);
// 		//加入右边栏快速定位栏
// 		var rapidLi = $('<li></li>');
// 		var rapidLink = $('<a class="rapidLink" href="javascript:void(0);">'+ day +'</a>');
// 		rapidLi.append(rapidLink);
// 		$('.rapidList',self.editbody.rightToolPanel).append(rapidLi);
// 		rapidLink.unbind('click').click(function(e){
// 			var top = $("em[name="+$(e.target).text()+"]",self.editbody.cw.document).offset().top;
// 			//使用一个动画来使页面跳转到相应位置。
// 			$('body',self.editbody.cw.document).animate({scrollTop:top}, 500);
// 		});
// 	});	
// }

// SEditor.prototype.getHtmlContentByDay = function(){
// 	var self = this;
// 	var obj = {};
// 	$(".tourContent_new",self.editbody.cw.document).each(function (i,n){
// 		obj[i+1] = $(n).html();
// 	})
// 	return obj;
// }

//也许用var变量来管理更合理一些，这样就不会污染对象的原型。
// SEditor.prototype.unBodyInfo = {
// 	section: 'tourSection_unniuren'
// }

//也许用var变量来管理更合理一些，这样就不会污染对象的原型。
// SEditor.prototype.unBodyEvent = {
// 	getHtmlContent: function(flag){
// 		var self = this;
// 		var section = null;
// 		if (flag){
// 			section = $('.' + self.editbody.bodyInfo.section,self.editbody.cw.document).parent().clone();
// 			$('div[contenteditable=true]', section).removeAttr('contenteditable');
// 		}else{
// 			section = $('.' + self.editbody.bodyInfo.section,self.editbody.cw.document).clone();
// 		}
// 		//hack 去掉保存不慎加入的一些操作提示样式。
// 		if($('.redHint',section).length > 0){
// 			$('.redHint',section).removeClass('redHint');
// 		}
// 		if($('.greenHint',section).length > 0){
// 			$('.greenHint',section).removeClass('redHint');
// 		}
// 		return section.html();
// 	},
// 	setHtmlContent: function(content){
// 		var self = this;
// 		$('.'+self.unBodyInfo.section+'', self.editbody.cw.document).empty();
// 		self.reloadEvent(content);
// 	}
// }

//目前只做了添加行程的导入和恢复的事件再绑定
// SEditor.prototype.reloadEvent = function(content){
// 	var self = this;
// 	var div = $('<div />').append(content);
// 	$('.tourContent_new', div).each(function(i,n){
// 		var trip = $(".day_title_new h3 div",$(n));
// 		if(trip.length > 0){
// 			self.unniurenMenuInfo.action.addunniurenTripAction.call(self, null, trip.html());
// 		}
// 		var detail = $('.tour_line_f', $(n));
// 		if(detail.length > 0){
// 			self.unniurenMenuInfo.action.addunniurenDetailAction.call(self, null, detail.html(), i);
// 		}
// 		var img = $('.time_s_photo', $(n));
// 		if(img.length > 0){
// 			self.unniurenMenuInfo.action.addunniurenImgAction.call(self, null, img.html(), i);
// 		}
// 		var foodAndSleep = $('.tour_food_f', $(n));
// 		if(foodAndSleep.length > 0){
// 			self.unniurenMenuInfo.action.addunniurenDiningAction.call(self, null, foodAndSleep.html(), i);
// 		}
// 	});
// }

// SEditor.prototype.unniurentpl = {
// 	trip: function (){
// 		return "<div class='tourContent_new'><div class='day_title_new'><h3><em>第{day}天</em><div contentEditable='true'>请在这里输入行程标题</div></h3></div></div>";
// 	},
// 	img: function (){
// 		return "<ul class='time_s_photo clearfix'></ul>";
// 	},
// 	imgList: function (){
// 		return "<li><a href='javascript:void(0);' onclick='return false;' style='cursor:default;'></a><div></div></li>";
// 	},
// 	detail: function (){
// 		return "<div class='tour_line_f' contentEditable='true'>请在这里输入行程描述，内容可以为“航班信息”、“游览路线”等相关内容</div>";
// 	},
// 	poe_Tourfood: function (){
// 		return "<div class='tour_food_f'></div>";
// 	},
// 	poe_Dining: function (){
// 		return "<div class='tour_item'><em>用餐</em><div contentEditable='true'>早餐：<span class='po_dining_diy'>敬请自理</span>&#160;午餐：<span class='po_dining_diy'>敬请自理</spam>&#160;晚餐：<span class='po_dining_diy'>敬请自理</span></div></div>";
// 	},
// 	poe_Accommodation: function (){
// 		return "<div class='tour_item'><em>住宿</em><div contentEditable='true'>请在这里输入当天住宿情况</div></div>";
// 	},
// 	poe_ShoppingStore: function(){
// 		return "<div class='tour_shop_f' contenteditable='true'><p><b>购物店信息</b>（如因游客购物造成时间延长，延长时间不计入旅行社的客观安排停留时间）</p><table><thead><tr><th width='160'>名称</th><th width='200'>营业产品</th><th width='100'>停留时间 </th><th>说明</th></tr></thead><tbody></tbody></table></div>";
// 	}
// }


