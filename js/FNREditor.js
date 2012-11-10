function FNREditor(opt){
	var defaults = {
		base: ["addBus", "addPlane", "addTrain", "addShip",  "addunniurenTrip",  "addunniurenDetail",  "addunniurenImg", "addunniurenDinning", "addunniurenAccommodation"],
	};
	
	// $.extend(true, opt, defaults);
	$.merge(opt.base,defaults.base);
	TNEditor.call(this, opt);
	/*这里放置编辑器的各种配置*/
	this.properties = {
		url:{
			editorCss:"css/base.css",
			editableBoxCss:"css/unniurenforedit.css",
			imgListUrl:"/myProject/TNEditor/imglist.js"
		},
		path:{
			imagePath:"css/images/"
		}
	};
	
	$.extend(this.editmenu, this.unMenu);
	$.extend(true, this.editmenu.menuInfo, this.unniurenMenuInfo);
	$.extend(this.editbody.bodyInfo, this.unBodyInfo);
	$.extend(this.editbody.bodyEvent, this.unBodyEvent);

	this.init();
	//arguments.callee.prototype.init();
}
FNREditor.prototype = new TNEditor();
//delete FNREditor.prototype.init;
FNREditor.prototype.constructor = FNREditor;

//非牛人专线行程编辑器的初始化，先初始化基本编辑器，然后做一些非牛人编辑器的初始化工作
FNREditor.prototype.init = function(){
	var self = this;
	TNEditor.prototype.init.call(this);
	$('head', self.editbody.cw.document).append('<link rel="stylesheet" href="'+this.properties.url.editableBoxCss+'" />');//给编辑状态下的非牛人专线
	$('.'+self.unBodyInfo.section+'', self.editbody.cw.document).removeAttr('contenteditable').css('cursor','default');
	$('.'+self.unBodyInfo.section+'', self.editbody.cw.document).unbind('paste');
	$('.'+self.unBodyInfo.section+'', self.editbody.cw.document).after(self.unMenu.tripDelNode).after(self.unMenu.commonDelNode);
	$('head', self.editbody.cw.document).append('<style rel="stylesheet" type="text/css">.redHint{border:1px solid rgba(255, 0, 0, 0.3); background:rgba(255, 0, 0, 0.1);}.greenHint{border:1px solid rgba(0, 101, 165, 0.3); background:rgba(0, 101, 165, 0.1);}</style>');

	//test快速定位面板初始化
	self.rapidPositioning.call(self);
}

//把删除节点放到这里公用,也许这也可以用var变量来保存，作为私有属性(待重构)
FNREditor.prototype.unMenu = {
	tripDelNode: $('<div id="DelNode"><span class="upBlockSpan"><a class="upBlock" href="javascript:void(0);"></a></span><span class="downBlockSpan"><a class="downBlock" href="javascript:void(0);"></a></span><span class="deleteBlockSpan"><a class="deleteBlock" href="javascript:void(0);"></a></span></div>'),
	commonDelNode:  $('<div id="DelNode"><span class="upBlockSpan"><a class="deleteBlock" href="javascript:void(0);"></a></span></div>')

}

//也许这也可以用var变量来保存，作为私有属性(待重构)
FNREditor.prototype.unniurenMenuInfo = {
	baseInfo:{
		preview:{
			name: "预览",
			imgPath: "preview.png",
			action: "preview"
		},
		addBus:{
			name: "巴士",
			imgPath: "bus.gif",
			action: "addBusAction"
		},
		addPlane:{
			name: "飞机",
			imgPath: "plain.gif",
			action: "addPlaneAction"
		},
		addTrain:{
			name: "火车",
			imgPath: "train.gif",
			action: "addTrainAction"
		},
		addShip:{
			name: "轮船",
			imgPath: "ship.gif",
			action: "addShipAction"
		},
		addunniurenTrip:{
			name: "添加行程",
			imgPath: "",
			action: "addunniurenTripAction"
		},
		addunniurenDetail:{
			name: "行程描述",
			imgPath: "",
			action: "addunniurenDetailAction"
		},
		addunniurenImg: {
			name: "行程图片",
			imgPath: "",
			action: "addunniurenImgAction"
		},
		addunniurenDinning: {
			name: "用餐",
			imgPath: "",
			action: "addunniurenDiningAction"
		},
		addunniurenAccommodation: {
			name: "住宿",
			imgPath: "",
			action: "addunniurenAccommodationAction"
		},
		addunniurenShoppingStore: {
			name: "购物店",
			imgPath: "",
			action:"addunniurenShoppingStoreAction"
		}
	},
	action:{
		preview: function(){
			var self = this;
			var win = window.open("about:blank");
			win.document.write('<html><head><link type="text/css" rel="stylesheet" href="css/unniuren.css" /></head><body>'+self.editmenu.editbody.bodyEvent.getHtmlContent.call(self.editmenu, true)+'</body></html>');
			win.document.close();
		},
		addBusAction: function(){
			var self = this;
			var imgURL = self.editmenu.imagePath + self.editmenu.menuInfo.baseInfo.addBus.imgPath;
			self.editmenu.menuInfo.action.addIconAction(imgURL, self);
		},
		addPlaneAction: function(){
			var self = this;
			var imgURL = self.editmenu.imagePath + self.editmenu.menuInfo.baseInfo.addPlane.imgPath;
			self.editmenu.menuInfo.action.addIconAction(imgURL, self);
		},
		addTrainAction: function(){
			var self = this;
			var imgURL = self.editmenu.imagePath + self.editmenu.menuInfo.baseInfo.addTrain.imgPath;
			self.editmenu.menuInfo.action.addIconAction(imgURL, self);
		},
		addShipAction: function(){
			var self = this;
			var imgURL = self.editmenu.imagePath + self.editmenu.menuInfo.baseInfo.addShip.imgPath;
			self.editmenu.menuInfo.action.addIconAction(imgURL, self);
		},
		addIconAction: function(imgURL, self){
			//加入交通工具的插入点的判断，如果不是在行程里不让插入
			// var self = this;
			var sel = self.editbody.cw.document.getSelection();
			var range = sel.getRangeAt(0);
			self.editbody.cw.document.execCommand("insertImage",false,imgURL);
			//插入图片的另一种方式
			// var img = document.createElement('img');
			// img.src = imgURL;
			// range.surroundContents(img);
			$(self.editbody.cw.document.activeElement).focus();
			range.collapse(false);
			range.setEndAfter(img);
			range.setStartAfter(img);
			//光标强制刷新
			sel.removeAllRanges();
			sel.addRange(range);
		},
		addunniurenTripAction: function(e, cnt){
			var self = this;
			var trip = self.unniurentpl.trip();
			trip = $(trip);
			if(arguments.length == 2 && cnt){
				$('.day_title_new h3 div', trip).html(cnt);
			}
			//console.debug(self.editbody.cw.document.activeElement);
			//在编辑器未有光标的情况下，直接把行程块插到当前最后一个行程后面；有光标的情况下就在光标所在行程块的后面插入
			if($('.tourContent_new', self.editbody.cw.document).length <= 0 || self.editbody.cw.document.activeElement.nodeName == 'BODY'){
				$('.'+self.unBodyInfo.section, self.editbody.cw.document).append(trip);
				var sel = self.editbody.cw.document.getSelection();
				var range = sel.getRangeAt(0);
			}else{
				var sel = self.editbody.cw.document.getSelection();
				var range = sel.getRangeAt(0);
				$(self.editbody.cw.document.activeElement).parentsUntil('.tourContent_new').last().parent().after(trip);
			}
			self.refreshDay();

			$(".day_title_new div",trip).focus();
			range.selectNodeContents($(".day_title_new div",trip)[0]);
			//光标强制刷新
			sel.removeAllRanges();
			sel.addRange(range);
			trip.css('cursor','text');
			var em = $('.day_title_new em', trip);
			var trips = em.parentsUntil('.tourContent_new').last().parent();
			self.bindDelEvent.delEvent.call(self, em, trips, self.unMenu.tripDelNode, 70, 0);
			self.bindPaste($(".day_title_new div",trip));
		},
		addunniurenDetailAction: function(e, cnt, index){
			var self = this;
			var detail = self.unniurentpl.detail();
			detail = $(detail);

			if(arguments.length == 3 && cnt){
				detail.html(cnt);
				$(".day_title_new h3",$(".tourContent_new",self.editbody.cw.document).eq(index)).after(detail);
			}else{
				if($('.tourContent_new', self.editbody.cw.document).length <= 0){
					self.editfooter.setStatusMsg("请先添加行程");
				}else if(self.editbody.cw.document.activeElement.nodeName == 'BODY'){
					console.debug(self);
					self.editfooter.setStatusMsg("请先定位光标，选择要插入的位置");
				}else{
					if($(self.editbody.cw.document.activeElement).hasClass('tour_line_f')){
						$(self.editbody.cw.document.activeElement).after(detail);
					}else{
						$(self.editbody.cw.document.activeElement).parentsUntil('.day_title_new').last().parent().append(detail);
					}
					var sel = self.editbody.cw.document.getSelection();
					var range = sel.getRangeAt(0);
					detail.focus();
					range.selectNodeContents(detail[0]);
					//光标强制刷新
					sel.removeAllRanges();
					sel.addRange(range);
					detail.css('cursor','text');
				}
			}

			self.bindDelEvent.delEvent.call(self, detail, detail, self.unMenu.commonDelNode, 32, 0);
			self.bindPaste(detail);
		},
		addunniurenImgAction: function(e, cnt, index){
			var self = this;
			if ($(".tourContent_new",self.editbody.cw.document).size() == 0){
				self.editfooter.setStatusMsg("请先添加行程");
				return;
			}
			if (arguments.length == 3 && cnt && typeof index !== "string"){
				createImgList(cnt,index);
				self.unniurenMenuInfo.action["showunniurenImgHint"].call(self, null);
			}else if(arguments.length == 3 && cnt == '' && typeof index !== "string"){
				return;
			}else{
				self.editfooter.setStatusMsg("正在读取图片资源....");
				$.ajax({
					type: "POST",
					dataType: "json",
					url: self.properties.url.imgListUrl + "?r="+Math.random(),
					data: this.getHtmlContentByDay(),
					//url: "/main.php?r="+Math.random(),
					//data: {
					//	'do':'route_ajax_new',
					//	'method':'matchSchedulePlacePhoto',
					//	'schedule_info':this.getPOHtmlByDay()
					//	},
					success: function(data){
						if (!$.isEmptyObject(data)){
							createImgList(data);
							self.unniurenMenuInfo.action["showunniurenImgHint"].call(self, null);//重新搞，搞得专业些
							self.editfooter.setStatusMsg("图片已添加");
						}
					}
				});
			}

			function createImgList(data,index){
				if (typeof data === "string"){
					var ul = $(self.unniurentpl.img());
					ul.html(data);
					$(".day_title_new h3",$(".tourContent_new",self.editbody.cw.document).eq(index)).after(ul);
					$("li",$(".day_title_new",$(".tourContent_new",self.editbody.cw.document).eq(index))).each(function (i,n){
						self.bindDelEvent.delEvent.call(self, $(n), $(n), self.unMenu.commonDelNode, 23, -2);
					});
				}else{
					$(".tourContent_new",self.editbody.cw.document).each(function (i,n){
						if ($(".day_title_new ul.time_s_photo",n).size() != 0){
							$(".day_title_new ul.time_s_photo",n).remove();
						}
						if ($(".day_title_new ul.time_s_photo",n).size() == 0){
							var ul = $(self.unniurentpl.img());
							if (typeof(data[i+1]) != 'undefined' && data[i+1].length>0){
								$.each(data[i+1],function(i,m){
									var li = $(self.unniurentpl.imgList());
									// var img = $("<img id='"+m.id+"' src='"+m.imgUrl+"' alt='" + m.address + "' onmouseout='hidePreview(event);' onmouseover='showPreview(event, " + m.id + ", 0);' />");
									var img = $("<img id='"+m.id+"' src='"+m.imgUrl+"' alt='" + m.address + "' />");
									$("a",li).append(img);
									var imglink = $('<a class="cgrey" target="_blank" href="' + self.imageHref + m.id + '">' + m.name + '</a>');
									$("div",li).append(imglink);
									ul.append(li);
								});
							}
							$(".day_title_new h3",n).after(ul);
							//self.msgHide();
							$("li",$(".day_title_new",n)).each(function (i,n){
								self.bindDelEvent.delEvent.call(self, $(n), $(n), self.unMenu.commonDelNode, 23, -2);
							});
						}
					})
				}
			}
		},
		addunniurenDiningAction: function(e, cnt, index){
			var self = this;
			var foodAndSleep = $(self.unniurentpl.poe_Tourfood());
			var food = $('');

			if(arguments.length == 3 && cnt){
				foodAndSleep.html(cnt);
				$(".day_title_new",$(".tourContent_new",self.editbody.cw.document).eq(index)).after(foodAndSleep);
				food = $("div.tour_item",foodAndSleep);
				if(food.size() > 0){
					$.each(food,function(i,n){
						$('div', $(n)).attr('contenteditable','true');
						self.bindDelEvent.delEvent.call(self, $(n), $(n), self.unMenu.commonDelNode, 32, 0);
						self.bindPaste($('div',$(n)));
					})
				}
			self.bindDelEvent.delEvent.call(self, foodAndSleep, foodAndSleep, self.unMenu.commonDelNode, 32, 2);
			}else{
				food = $(self.unniurentpl.poe_Dining());
				var activeElement = self.editbody.cw.document.activeElement;

				if($('.tourContent_new', self.editbody.cw.document).length <= 0){
					self.editfooter.setStatusMsg("请先添加行程");
				}else if(activeElement.nodeName == 'BODY'){
					console.debug(self);
					self.editfooter.setStatusMsg("请先定位光标，选择要插入的位置");
				}else{
					var activeDayContent = $(activeElement).parents('.tourContent_new');
					var foodAndSleepWrapper = activeDayContent.children('.tour_food_f');
					if(foodAndSleepWrapper.length > 0){
						foodAndSleepWrapper.append(food);
					}else{
						activeDayContent.append(foodAndSleep);
						activeDayContent.children('.tour_food_f').append(food);
					}
					
					var sel = self.editbody.cw.document.getSelection();
					var range = sel.getRangeAt(0);
					//这里相当坑爹，要注意这里的focus是必要的，这关系到下面selectNodeContents的高亮是否是蓝色。规则应该是设置了contenteditable为true的最近父节点
					$('div',food).focus();
					range.selectNodeContents($('.po_dining_diy', food)[0]);
					//光标强制刷新
					sel.removeAllRanges();
					sel.addRange(range);
					food.css('cursor','text');
					self.bindDelEvent.delEvent.call(self, food, food, self.unMenu.commonDelNode, 32, 0);
					self.bindDelEvent.delEvent.call(self, foodAndSleep, foodAndSleep, self.unMenu.commonDelNode, 32, 2);
					self.bindPaste($('div',food));
				}
			}
		},
		addunniurenAccommodationAction: function(){
			var self = this;
			var foodAndSleep = $(self.unniurentpl.poe_Tourfood());
			var sleep = $(self.unniurentpl.poe_Accommodation());
			var activeElement = self.editbody.cw.document.activeElement;

			// if(arguments.length == 2 && cnt){
			// 	$('.tour_line_f', food).html(cnt);
			// }

			if($('.tourContent_new', self.editbody.cw.document).length <= 0){
				self.editfooter.setStatusMsg("请先添加行程");
			}else if(activeElement.nodeName == 'BODY'){
				console.debug(self);
				self.editfooter.setStatusMsg("请先定位光标，选择要插入的位置");
			}else{
				var activeDayContent = $(activeElement).parents('.tourContent_new');
				var foodAndSleepWrapper = activeDayContent.children('.tour_food_f');
				if(foodAndSleepWrapper.length > 0){
					foodAndSleepWrapper.append(sleep);
				}else{
					activeDayContent.append(foodAndSleep);
					activeDayContent.children('.tour_food_f').append(sleep);
				}
				
				var sel = self.editbody.cw.document.getSelection();
				var range = sel.getRangeAt(0);
				//这里相当坑爹，要注意这里的focus是必要的，这关系到下面selectNodeContents的高亮是否是蓝色。规则应该是设置了contenteditable为true的最近父节点
				$('div',sleep).focus();
				range.selectNodeContents($('div',sleep)[0]);
				//光标强制刷新
				sel.removeAllRanges();
				sel.addRange(range);
				sleep.css('cursor','text');
				self.bindDelEvent.delEvent.call(self, sleep, sleep, self.unMenu.commonDelNode, 32, 0);
				self.bindDelEvent.delEvent.call(self, foodAndSleep, foodAndSleep, self.unMenu.commonDelNode, 32, 2);
				self.bindPaste($('div',sleep));
			}
		},
		addunniurenShoppingStoreAction: function(){

		},
		showunniurenImgHint: function(){
			var self = this;
			var img_m = $("<div style='position:absolute;z-index:99999;border:1px solid #ccc;background:#efefef;display:none;'><img src='' style='border:2px solid #fff' /><span style='display:block;text-align:right;font-weight:bold;color:#333;padding-right:10px;'></span></div>");
			$('.day_title_new', self.editbody.cw.document).append(img_m);
			$(".day_title_new ul.time_s_photo img", self.editbody.cw.document).each(function(i, n){
			$(n).unbind('mouseover').bind('mouseover', function(e){
				var x = $(this).position().left + 80;
				var y = $(this).position().top;
				img_m.css({'top' : y, 'left' : x});
				img_m.css('display', 'block');
				var srcString = $(this).attr('src');
				var index = srcString.lastIndexOf('.');
				var srcString_x = srcString.slice(0, index-1) + srcString.slice(index-1, index).replace('s','m') + srcString.slice(index);
				$('img', img_m).attr('src',srcString_x);
				$('span', img_m).text($(n).attr('alt'));
			}).unbind('mouseout').bind('mouseout',function(e){
				img_m.css('display','none');
			});
			});
		}
	}
}

//用于快速定位文档的工具
FNREditor.prototype.rapidPositioning = function (){
	var self = this;
	self.editbody.leftContainer.css({'height':self.height - 60,'width':self.width - 100});
	self.editbody.rightToolPanel.css({'height':self.height - 60,'width':'97px'});
	var list = $('<ul class="rapidList"></ul>');
	self.editbody.rightToolPanel.append(list);
}

//给插入的行程相关的块增加删除、选中、上下移动按钮，这样做的主要原因是，行程块的部分内容无法通过光标backspace或delete删除，也为了保证编辑器行程内容结构的纯净
FNREditor.prototype.bindDelEvent = {
	delEvent: function(trigger, dom, delNode, offsetX, offsetY){
		var self = this;
		var delContent = null;
		trigger.unbind('hover').hover(function(e){
			//console.debug(delNode);
			var pos = $(this).position();
			delNode.css({'left':pos.left - offsetX, 'top':pos.top - offsetY, 'opacity': 0});
			delNode.stop();
			delNode.show();
			delNode.animate({opacity:1},'slow');
			delNode.unbind('hover').hover(function(){
				delNode.stop();
				delNode.show();
				delNode.animate({opacity:1},'slow');
				//trip.css({'border':'1px solid rgba(255, 0, 0, 0.3)', 'background':'rgba(255, 0, 0, 0.1)'});
				delNode.css('cursor','pointer');
			},
			function(){
				delNode.stop();
				delNode.animate({opacity:0},'slow', function(){delNode.hide();});
				//dom.css({'border':'1px solid white', 'background':'none'});
			});
			$('.deleteBlock', delNode).unbind('hover').hover(function(){
				dom.addClass('redHint');
			},function(){
				dom.removeClass('redHint');
			});
			$('.deleteBlock', delNode).unbind('click').click(function(){
				//hack 删除图片的时候，如果图片是最后一张，则把外面的ul也删除掉。
				if(dom.parent().hasClass('time_s_photo') && dom.parent().children().length == 1){
					dom.parent().remove();
				}else{
					dom.remove();
				}
				self.refreshDay();
				delNode.hide();
			});
			$('.upBlock', delNode).unbind('hover').hover(function(){
				dom.addClass('greenHint');
			},function(){
				dom.removeClass('greenHint');
			});
			$('.upBlock', delNode).unbind('click').click(function(){
				dom.prev().before(dom);
				self.refreshDay();
				delNode.hide();
			});
			$('.downBlock', delNode).unbind('hover').hover(function(){
				dom.addClass('greenHint');
			},function(){
				dom.removeClass('greenHint');
			});
			$('.downBlock', delNode).unbind('click').click(function(){
				dom.next().after(dom);
				self.refreshDay();
				delNode.hide();
			});
		},
		function(){
			delNode.stop();
			delNode.animate({opacity:0},'slow', function(){delNode.hide();});
		});
	}
}

FNREditor.prototype.refreshDay = function (){
	//重新刷一遍天数，保证天数顺序
	var self = this;
	$('.rapidList',self.editbody.rightToolPanel).empty();
	$('.tourContent_new > .day_title_new em', self.editbody.cw.document).each(function(i,n){
		var day = $(n).text().replace(/{day}|\d+/g, i + 1);
		
		$(n).text(day);
		$(n).attr('name',day);
		$(n).parent().parent().parent().attr('name',day);
		//加入右边栏快速定位栏
		var rapidLi = $('<li></li>');
		var rapidLink = $('<a class="rapidLink" href="javascript:void(0);">'+ day +'</a>');
		rapidLi.append(rapidLink);
		$('.rapidList',self.editbody.rightToolPanel).append(rapidLi);
		rapidLink.unbind('click').click(function(e){
			var top = $("em[name="+$(e.target).text()+"]",self.editbody.cw.document).offset().top;
			//使用一个动画来使页面跳转到相应位置。
			$('body',self.editbody.cw.document).animate({scrollTop:top}, 500);
		});
	});	
}

FNREditor.prototype.getHtmlContentByDay = function(){
	var self = this;
	var obj = {};
	$(".tourContent_new",self.editbody.cw.document).each(function (i,n){
		obj[i+1] = $(n).html();
	})
	return obj;
}

//也许用var变量来管理更合理一些，这样就不会污染对象的原型。
FNREditor.prototype.unBodyInfo = {
	section: 'tourSection_unniuren'
}

//也许用var变量来管理更合理一些，这样就不会污染对象的原型。
FNREditor.prototype.unBodyEvent = {
	getHtmlContent: function(flag){
		var self = this;
		var section = null;
		if (flag){
			section = $('.' + self.editbody.bodyInfo.section,self.editbody.cw.document).parent().clone();
			$('div[contenteditable=true]', section).removeAttr('contenteditable');
		}else{
			section = $('.' + self.editbody.bodyInfo.section,self.editbody.cw.document).clone();
		}
		//hack 去掉保存不慎加入的一些操作提示样式。
		if($('.redHint',section).length > 0){
			$('.redHint',section).removeClass('redHint');
		}
		if($('.greenHint',section).length > 0){
			$('.greenHint',section).removeClass('redHint');
		}
		return section.html();
	},
	setHtmlContent: function(content){
		var self = this;
		$('.'+self.unBodyInfo.section+'', self.editbody.cw.document).empty();
		self.reloadEvent(content);
	}
}

//目前只做了添加行程的导入和恢复的事件再绑定
FNREditor.prototype.reloadEvent = function(content){
	var self = this;
	var div = $('<div />').append(content);
	$('.tourContent_new', div).each(function(i,n){
		var trip = $(".day_title_new h3 div",$(n));
		if(trip.length > 0){
			self.unniurenMenuInfo.action.addunniurenTripAction.call(self, null, trip.html());
		}
		var detail = $('.tour_line_f', $(n));
		if(detail.length > 0){
			self.unniurenMenuInfo.action.addunniurenDetailAction.call(self, null, detail.html(), i);
		}
		var img = $('.time_s_photo', $(n));
		if(img.length > 0){
			self.unniurenMenuInfo.action.addunniurenImgAction.call(self, null, img.html(), i);
		}
		var foodAndSleep = $('.tour_food_f', $(n));
		if(foodAndSleep.length > 0){
			self.unniurenMenuInfo.action.addunniurenDiningAction.call(self, null, foodAndSleep.html(), i);
		}
	});
}

FNREditor.prototype.unniurentpl = {
	trip: function (){
		return "<div class='tourContent_new'><div class='day_title_new'><h3><em>第{day}天</em><div contentEditable='true'>请在这里输入行程标题</div></h3></div></div>";
	},
	img: function (){
		return "<ul class='time_s_photo clearfix'></ul>";
	},
	imgList: function (){
		return "<li><a href='javascript:void(0);' onclick='return false;' style='cursor:default;'></a><div></div></li>";
	},
	detail: function (){
		return "<div class='tour_line_f' contentEditable='true'>请在这里输入行程描述，内容可以为“航班信息”、“游览路线”等相关内容</div>";
	},
	poe_Tourfood: function (){
		return "<div class='tour_food_f'></div>";
	},
	poe_Dining: function (){
		return "<div class='tour_item'><em>用餐</em><div contentEditable='true'>早餐：<span class='po_dining_diy'>敬请自理</span>&#160;午餐：<span class='po_dining_diy'>敬请自理</spam>&#160;晚餐：<span class='po_dining_diy'>敬请自理</span></div></div>";
	},
	poe_Accommodation: function (){
		return "<div class='tour_item'><em>住宿</em><div contentEditable='true'>请在这里输入当天住宿情况</div></div>";
	},
	poe_ShoppingStore: function(){
		return "<div class='tour_shop_f' contenteditable='true'><p><b>购物店信息</b>（如因游客购物造成时间延长，延长时间不计入旅行社的客观安排停留时间）</p><table><thead><tr><th width='160'>名称</th><th width='200'>营业产品</th><th width='100'>停留时间 </th><th>说明</th></tr></thead><tbody></tbody></table></div>";
	}
}