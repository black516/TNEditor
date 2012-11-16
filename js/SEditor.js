/**
 * 名词解释：资源节点-就是显示文字、图片等文档资源的节点
 * editor: 周海 zhouhai(zhouhai737@gmail.com)
 * time: 2012-11-16 19:12
 */

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
	this.editbody.bodyInfo.section = this.root;

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
	$('head', self.editbody.cw.document).append('<style rel="stylesheet" type="text/css">.redHint{border:1px solid rgba(255, 0, 0, 0.3); background:rgba(255, 0, 0, 0.1);}.greenHint{border:1px solid rgba(0, 101, 165, 0.3); background:rgba(0, 101, 165, 0.1);}</style>');

	//test快速定位面板初始化
	self.rapidPositioning.call(self);
	//快速定位面板加宽
	self.editbody.leftContainer.width(self.editbody.leftContainer.width() - 81);
	self.editbody.rightToolPanel.width(self.editbody.rightToolPanel.width() + 80);

}

//读json配置
SEditor.prototype.readConfig = function(config){
	var self = this;
	//保存可编辑区域DOM
	var editContainer = this.editContainer = $(this.editbody.cw.document).find('[class="'+this.root+'"]');
	editContainer.removeAttr('contenteditable').removeAttr('spellcheck').css('cursor','auto');
	//保存左侧操作数区域DOM
	var treeList = this.treeContainer = this.editbody.rightToolPanel.children('.rapidList').parent().empty();
	this.addTreeToolbar(treeList);
	self.readObject(config, editContainer, undefined);
	this.docTemplate = editContainer.html();
	this.createTree(editContainer.parent(), treeList);
}

//json生成html
SEditor.prototype.readObject = function(obj, childContainer, fatherContainer){
	var self = this;
	if($.isArray(obj)){
		$.each(obj, function(i,n){
			self.readObject(n, childContainer, fatherContainer);
		});
	}else if(typeof obj == 'object'){
		for(var k in obj){
			console.debug(k.split('.')[0], k.split('.')[1]);
			//文档相关变量
			var editable = false;
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
				//文本可编辑
				if(editable) element.attr('contenteditable','true');
				console.debug(childContainer,9999);
				if(childContainer && fatherContainer){
					fatherContainer.find(childContainer).append(element);
				}else if(childContainer){
					childContainer.append(element);
				}

				//如果可编辑的是图片，那么添加如下事件，让用户可以给图片加url
				if(element[0].nodeName.toUpperCase() == 'IMG'){
					element.css('cursor','pointer');
					element.click(function(e){
						self.editImage(e);
					});
				}
			}

			self.readObject(obj[k], element, childContainer);
		}
	}
}

//生成大纲:两种方案，根据标签来生成;根据json配置（需要有标记）生成【实验失败】
//这里创建树和事件添加都加在一块了，需要拆解？
SEditor.prototype.createTree = function(dom, leaf, tree){
		var self = this;
		var nodes = ("DIV,P,TABLE,UL,LI,DL,OL,FIELDSET,FORM,H1,H2,H3,H4,H5,H6,HR,PRE").split(',');//所有的块级元素
		var wrapper;
		//用来区分leaf是第一次传进来的节点还是迭代中传的
		if(leaf && tree){
			wrapper = tree.find(leaf);
		}else if(leaf){
			wrapper = leaf;
			//因为激活box（见displayActivedBox中的activedBox）的存在，在遍历的时候不能遍历这个节点
			wrapper.children(':not(:first)').remove();
		}

		$.each(dom.children(), function(i,n){
			var ul = $('<ul />');
			var li = $('<li />');
			//用来判断当前遍历DOM是否包含行内元素，如果包含的话，就直接显示当前DOM内包含的内容了，因为行内元素在布局上没什么作用
			var hasInline = false;
			$.each($(n).children(),function(j,m){
				if($.inArray(m.nodeName.toUpperCase(), nodes) == -1){
					hasInline = true;
				}
			});
			//如果当前DOM元素包含行内元素，或者当前DOM元素没有子节点且有文本节点的话，就把节点当做“资源节点”
			if(hasInline || ($(n).children().size() == 0 && $(n).text())){
				//添加v-label标识
				var label = GUID.guid();
				li.attr('v-label', label);
				$(n).attr('v-label', label);
				//保存激活状态信息，好当读文档转化tree的时候能保持住tree的节点的选中状态
				var active = '';
				if($(n).attr('s-active')){
					active = 'active';
				}
				li.addClass(active);	
				//资源节点处理
				var path = self.properties.path.imagePath;
				var icon = self.resManager.icon;
				if($(n).find('img').size() > 0){
					var span = $('<span />').text($(n).find('img').attr('title').slice(0,5) + '..').css('cursor','pointer');
					li.append(span).css({'padding-left':'28px','background-image':'url('+path+'/'+icon.img+')','background-repeat':'no-repeat','background-position':'10px 2px'});
				}else{
					var span = $('<span />').text($(n).text().slice(0,8) + '..').css('cursor','pointer');
					li.append(span).css({'padding-left':'28px','background-image':'url('+path+'/'+icon.text+')','background-repeat':'no-repeat','background-position':'10px 2px'});
				}
				wrapper.append(li);

				//激活按钮,添加tree的节点的选中状态和文档的相应DOM的选中状态
				li.unbind('click').click(function(e){
					self.treeNodeEvent.selectAndPositioning.call(self, e, $(this), true);
				})
			}else{
				// console.debug(n.className, wrapper, 8888);
				//添加v-label标识
				var label = GUID.guid();//生成唯一标识符
				ul.attr('v-label', label);
				$(n).attr('v-label', label);
				if(wrapper[0].nodeName.toUpperCase() == 'DIV'){
					wrapper.append(ul);
				}else{
					var name = self.treeContainer.get(0).className.split(' ')[0];
					var deep = wrapper.parentsUntil('.'+name).children('ul').size();//tree的深度用于节点收缩与伸展
					//保存激活状态信息和是否折叠信息，好当读文档转化tree的时候能保持住tree的节点的选中状态和折叠状态
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

					//collapse 按钮,给tree节点添加折叠事件，并在文档记录，方便下次从文档生成tree的时候状态保持
					div.children('.toggleIcon').unbind('click').click(function(e){
						self.treeNodeEvent.collapseEvent.call(self, e, $(this));
					});

					//激活按钮,添加tree的节点的选中状态和文档的相应DOM的选中状态
					div.children('.nodeLabel').unbind('click').click(function(e){
						self.treeNodeEvent.selectAndPositioning.call(self, e, $(this), false);
					});
				}
				self.createTree($(n), ul, leaf);
			}
		})
}

SEditor.prototype.addTreeToolbar = function(treeList){
	var self = this;
	var name = self.treeContainer.get(0).className.split(' ')[0];
	var toolbar = $('<ul class="treeToolbar"><li><a class="addBlock"></a></li><li><a class="cloneBlock"></a></li><li><a class="delBlock"></a></li><li><a class="moveUp"></a></li><li><a class="moveDown"></a></li><li style="float:right;"><a class="collapseTree"></a></li><li style="float:right;"><a class="refreshTree"></a></li></ul>');
	//加事件，增加模板、复制选中节点、删除选中节点、上移选中节点、下移选中节点、刷新tree、tree节点全部折叠
	toolbar.unbind('click').click(function(e){
		var operator = $(e.target)[0].className;
		//大致思想是从tree中得到选中的节点，然后对应到文档中的相应DOM节点，执行相应操作
		switch(operator){
			case 'addBlock':
				var label = $(self.docTemplate).attr('class');
				var selected;
				if($(this).next().find('[class="active"]').next().attr('v-label') == label){
					selected = $(this).next().find('[class="active"]').next();
				}else{
					selected = $(this).next().find('[class="active"]').parents('[v-label="'+label+'"]');
				} 
				var index = $(this).parents('.'+name).find('[v-label="'+label+'"]').index(selected);
				//如果有的话after，没有的话就append
				if(self.editContainer.find('[v-label="'+label+'"]').size() > 0){
					var beAdded =  self.editContainer.find('[v-label="'+label+'"]').eq(index);
					beAdded.after(self.docTemplate);
				}else{
					self.editContainer.append(self.docTemplate);
				}
				self.removeActivedBox();
				self.createTree(self.editContainer.parent(), self.treeContainer);
				break;
			case 'cloneBlock':
				//这边要考虑资源节点
				var selected;
				if($(this).next().find('[class="active"]')[0].nodeName.toUpperCase() == 'LI'){
					selected = $(this).next().find('[class="active"]');
				}else{
					selected = $(this).next().find('[class="active"]').next();
				}
				var label = selected.attr('v-label');
				//这里find函数的选择器没有用'.xxxx'的形式，主要是因为该方法在Chrome中有bug
				var index = $(this).parents('.'+name).find('[v-label="'+label+'"]').index(selected);
				var beCloned =  self.editContainer.find('[v-label="'+label+'"]').eq(index);
				var clone = beCloned.clone().removeAttr('s-active');
				beCloned.after(clone);
				self.removeActivedBox();
				self.createTree(self.editContainer.parent(), self.treeContainer);
				break;
			case 'delBlock':
				var selected = $(this).next().find('[class="active"]').next();
				var label = selected.attr('v-label');
				var index = $(this).parents('.'+name).find('[v-label="'+label+'"]').index(selected);
				var beDeleteed =  self.editContainer.find('[v-label="'+label+'"]').eq(index);
				//在删除前最好先保存下用localStorage(TODO...)
				//这边做撤销远远比做弹框好，弹框相当影响用户操作效率
				beDeleteed.remove();
				self.removeActivedBox();
				self.createTree(self.editContainer.parent(), self.treeContainer);
				break;
			case 'moveUp':
				moveUp(e, $(this), true);
				break;
			case 'moveDown':
				moveUp(e, $(this));
				break;
			case 'collapseTree':
				var ul = self.treeContainer.children().last().find('ul');
				$.each(ul,function(i,n){
					$(n).hide();
					$(n).prev().children().first().removeClass('spread').addClass('collapse');
				});
				break;
			case 'refreshTree':
				self.removeActivedBox();
				self.createTree(self.editContainer.parent(), self.treeContainer);
				break;
			default:break;
		}
	});

	treeList.append(toolbar);

	function moveUp(e, beTriggeredDom, upFlag){
		//针对普通节点的移动
		//针对资源节点的移动，资源节点肯定是li标签
		var selected;
		if(beTriggeredDom.next().find('[class="active"]')[0].nodeName.toUpperCase() == 'LI'){
			selected = beTriggeredDom.next().find('[class="active"]');
		}else{
			selected = beTriggeredDom.next().find('[class="active"]').next();	
		}
		var label = selected.attr('v-label');
		var index = beTriggeredDom.parents('.'+name).find('[v-label="'+label+'"]').index(selected);
		var beMoved =  self.editContainer.find('[v-label="'+label+'"]').eq(index);
		var temp = beMoved.clone();
		
		if(upFlag){
			//上移
			if(beMoved.prev().size() > 0){
				beMoved.prev().before(temp);
				beMoved.remove();
				self.removeActivedBox();
				self.createTree(self.editContainer.parent(), self.treeContainer);
			}else{
				self.editfooter.setStatusMsg('只能在相同级别元素间移动！');
			}
		}else{
			//下移
			if(beMoved.next().size() > 0){
				beMoved.next().after(temp);
				beMoved.remove();
				self.removeActivedBox();
				self.createTree(self.editContainer.parent(), self.treeContainer);
			}else{
				self.editfooter.setStatusMsg('只能在相同级别元素间移动！');
			}	
		}
		
	}
}

//在创建树节点的时候，需要给节点加各种事件，比如tree节点的选中状态和文档的选中状态，比如tree节点的折叠事件
SEditor.prototype.treeNodeEvent = {
	//tree节点的选中状态和文档的选中状态。参数分别为event对象，被触发的DOM节点，资源节点标识
	selectAndPositioning: function(e, beTriggeredDom, resNodeFlag){
		var name = this.treeContainer.get(0).className.split(' ')[0];
		//清除其他tree中的active,清除文档的选中标记
		beTriggeredDom.parents('.'+name).find('.active').removeClass('active');
		this.editContainer.find('[s-active="active"]').removeAttr('s-active');
		this.removeActivedBox();
		var selected;
		if(resNodeFlag){
			beTriggeredDom.toggleClass('active');
			//让文档相应部分也显示选中状态
			selected = beTriggeredDom.parents('.' + name).find('[class="active"]');
		}else{
			beTriggeredDom.parent().toggleClass('active');
			//让文档相应部分也显示选中状态
			var selected = beTriggeredDom.parents('.' + name).find('[class="active"]').next();
		}
		var label = selected.attr('v-label');
		var index = beTriggeredDom.parents('.'+name).find('[v-label="'+label+'"]').index(selected);
		var docSelected = this.editContainer.find('[v-label="'+label+'"]').eq(index);
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
		this.displayActivedBox(docSelected.offset().left, docSelected.offset().top, docSelected.width(), docSelected.height(), margin, padding);

		//快速定位
		var top = docSelected.offset().top;
		//使用一个动画来使页面跳转到相应位置。
		$('body',this.editbody.cw.document).animate({scrollTop:top-2}, 500);
	},

	//tree节点的折叠事件
	collapseEvent:function(e, beTriggeredDom){
		var name = this.treeContainer.get(0).className.split(' ')[0];
		beTriggeredDom.siblings('.nodeLabel').trigger('click');
		beTriggeredDom.parent().next('ul').toggle();
		beTriggeredDom.toggleClass('spread collapse');
		//让文档记录树的collapse状态
		var selected = beTriggeredDom.parents('.' + name).find('[class="active"]').next();
		var label = selected.attr('v-label');
		var index = beTriggeredDom.parents('.'+name).find('[v-label="'+label+'"]').index(selected);
		var docSelected = this.editContainer.find('[v-label="'+label+'"]').eq(index);
		var status = $.inArray('collapse',beTriggeredDom.attr('class').split(' ')) == -1 ? 'spread' : 'collapse';
		docSelected.attr('s-collapse-status',status);
	}
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

SEditor.prototype.editImage = function(e){
	var self = this;
	var popBox = $('<div id="editImage"></div>');
	var popHeader = $('<div class="popHeader"><a href="javascript:void(0);" id="closePopBoxBtn"></a></div>');
	var popBody = $('<div class="popBody"></div>');
	var linkUrlBox = $('<div><span style="font-size:12px;">请输入图片url地址：</span></div><div><input id="linkInput" type="text" size="40" /></div>');
	popBody.append(linkUrlBox);
	var popFooter = $('<div class="popFooter"><input type="button" id="confirm" value="确定" /></div>')
	popBox.append(popHeader).append(popBody).append(popFooter);
	var pos = $(e.target).position();
	var posOffset = self.editbody.baseSection.position();
	pos.left = pos.left + posOffset.left;
	pos.top = pos.top + posOffset.top;
	self.editmenu.displayPopWin(pos,popBox);
	$(document.body).append(self.editmenu.popWin);
	self.editmenu.popWin.show();
	$('#closePopBoxBtn').click(function(){
		self.editmenu.hidePopWin();
	});
	$('#confirm').click(function(){
		var linkValue = $('#linkInput').val();
		$(e.target).attr('src',linkValue);
		self.editmenu.hidePopWin();
		//self.editmenu.editbody.cw.focus();
	});
	$('#linkInput').mousedown(function(e){
		e.stopPropagation();
	});
	self.editmenu.popWin.unbind('mouseleave').unbind('mouseenter');
}

var GUID = {
	S4: function (){
		return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	},
	guid: function (){
		return (GUID.S4()+GUID.S4()+"-"+GUID.S4()+"-"+GUID.S4()+"-"+GUID.S4()+"-"+GUID.S4()+GUID.S4()+GUID.S4());
	}
}

//用于快速定位文档的工具
SEditor.prototype.rapidPositioning = function (){
	var self = this;
	self.editbody.leftContainer.css({'height':self.height - 60,'width':self.width - 100});
	self.editbody.rightToolPanel.css({'height':self.height - 60,'width':'97px'});
	var list = $('<ul class="rapidList"></ul>');
	self.editbody.rightToolPanel.append(list);
}