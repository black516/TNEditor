/////////////////////////////////////////////////////////////////////////////
// 这个文件是 途牛 BOSS 项目的一部分
//
// Copyright (c) 2012 Tuniu
/////////////////////////////////////////////////////////////////////////////

/**
 * 功能说明：途牛项目定制编辑器
 * @author: 周海 harry (zhouhai@tuniu.com)
 * @version $Id: TNEditor.js 28103807 2012年04月28日 10:38:07 zh $
 */



function TNEditor(opt){
	var defaults = {
		width: 600,
		height: 400,
		container: $(document.body)
	};
	var self =this;
	$.extend(true, this, defaults, opt || {});
	
	/*这里放置编辑器的各种配置*/
	this.properties = {
		url:{
			editorCss:"css/base.css",
			previewCss:"css/base.css",
			editableBoxCss:"css/editableIframe.css"
		},
		path:{
			imagePath:"css/images/"
		}
	};

	//$('.baseSection',self.editbody.cw.document).focus();//根据实际情况添加
	this.editMode = "doc";
	this.editorKey = this.container.attr('id');
	// console.debug(this.editorKey);
	this.editbody = new editBody(self);
	this.editfooter = new editFooter(self);
	this.editmenu = new editMenu(self);
	console.debug(this,7777);
	//this.init();
}

TNEditor.prototype.init = function(){
	var self = this;
	this.editbody.initBody();
	this.editfooter.initFooter();
	this.editmenu.initMenu();
	this.loadBody();
	this.loadFooter();
	this.editfooter.bindEvent.call(self);
	this.loadMenu();
	this.editmenu.bindEvent.call(self);
	//this.frame =
	// $('.baseSection',this.editbody.cw.document).focus();//根据实际情况添加
	this.bindPaste($('.' + self.editbody.bodyInfo.section, self.editbody.cw.document));
}

TNEditor.prototype.loadBody = function (){
	//先加载样式表
	$('head').append('<link type="text/css" rel="stylesheet" href="' + this.properties.url.editorCss + '" />');
	var editor = $('<div id="editor_wrap"></div>');
	//editor.css({'width':this.width-2, 'height':this.height-2});
	editor.css('width',this.width-2);
	var bodyDOM = this.editbody.getBody();
	editor.append(bodyDOM);
	this.container.append(editor);
	this.editbody.setbaseSection();
}
TNEditor.prototype.loadFooter = function(){
	var footerDOM = this.editfooter.getFooter();
	this.editbody.getBody().after(footerDOM);
}
TNEditor.prototype.loadMenu = function (){
	var menuDOM = this.editmenu.getMenu();
	this.editbody.getBody().before(menuDOM);
}
TNEditor.prototype.bindPaste = function(dom){
	var self = this;
	dom.unbind('paste').bind('paste',function(e){
		var text = null;
		var div = document.createElement('div');
		div.id = 'divTemp';
		div.innerHTML = '\uFEFF';
		div.style.left="-10000px";
		div.style.height="1px";
		div.style.width="1px";
		div.style.position="absolute";
		div.style.overflow="hidden";
		dom.append(div);
		dom.mousedown(function(e){
			e.preventDefault();
		});
		dom.keydown(function(e){
			e.preventDefault();
		});
		var selection = self.editbody.cw.document.getSelection();
		var range = selection.getRangeAt(0);
		var docBody = div.firstChild;
		var rng = self.editbody.cw.document.createRange();
		rng.setStart(docBody, 0);
		rng.setEnd(docBody, 1);
		selection.removeAllRanges();
		selection.addRange(rng);
		window.setTimeout(function(){
			text = $('#divTemp',self.editbody.cw.document).text();//这里直接去掉了所有标签和样式，如果想保留也可以，设置过滤数据的函数即可。
			$('#divTemp',self.editbody.cw.document).remove();
			if(range){
				selection.removeAllRanges();
				selection.addRange(range);
			}
			self.editbody.cw.document.execCommand('insertHTML',false,text);
			dom.unbind('mousedown');
			dom.unbind('keydown');
		},0);
	});
}

function editMenu(opt){
	var defaults = {
		imagePath : opt.properties.path.imagePath,
		color: ["#ff0000","#0000ff","#000"],
		colorName: ["红色","蓝色","黑色"]
	};
	$.extend(this, defaults, opt || {});
	this.menuContainer = $('<div id="editMenu"></div>');
	this.popWin = $('<div id="popWin"></div>');
	//this.initMenu();
}

editMenu.prototype.menuInfo = {
	baseInfo:{
		undo:{
			name: "撤销",
			imgPath: "undo.png",//这里要使用css雪碧
			action: ""
		},
		redo:{
			name: "重做",
			imgPath: "redo.png",
			action: ""
		},
		bold:{
			name: "加粗",
			imgPath: "bold.png",
			action: "letSelectionBold"
		},
		color:{
			name: "文字颜色",
			imgPath:"color.png",
			action: "setFontColor"
		},
		addLink:{
			name: "添加链接",
			imgPath:"addLink.png",
			action: "addLink"
		},
		cancelLink:{
			name: "取消链接",
			imgPath:"cancelLink.png",
			action: "cancelLink"
		},
		addStar:{
			name: "加星",
			imgPath: "addStar.png",
			action: "addStar"
		},
		addStar2:{
			name: "★",
			imgPath: "",
			action: "addStar2"
		},
		editMode:{
			name: "编辑HTML",
			imgPath: "editMode.gif",
			action: "editModeTrans"
		},
		preview:{
			name: "预览",
			imgPath: "preview.png",
			action: "preview"
		}
	},
	action:{
		letSelectionBold:function(){
			this.editbody.cw.document.execCommand("bold", false, null);
		},
		setFontColor:function(e){
			var self = this;
			var t;
			var popBox = $('<div id="colorPopBox" style="width:100px;"></div>');
			for(var i = 0;i < self.editmenu.color.length; i++){
				var colorInput = $('<input type="button" class="colorSetBtn" />');
				colorInput.css('background',self.editmenu.color[i]).data('color',self.editmenu.color[i]);
				colorInput.attr('title',self.editmenu.colorName[i]);
				popBox.append(colorInput);
			}
			var pos = $(e.target).position();
			self.editmenu.displayPopWin(pos,popBox);
			$(e.target).parent().append(self.editmenu.popWin);
			self.editmenu.popWin.show();

			$('.colorSetBtn').each(function(i,n){
				$(n).bind('mousedown',function(){
					self.editmenu.editbody.cw.document.execCommand("foreColor",false,$(this).data('color'));
					self.editmenu.hidePopWin();
				});
			});

			self.editmenu.popWin.unbind('mouseleave').mouseleave(function(){
				t = setTimeout(function(){
					self.editmenu.hidePopWin();
				}, 500);
			});
			self.editmenu.popWin.unbind('mouseenter').mouseenter(function(){
				if(typeof(t) !== 'undefined'){
					clearTimeout(t);
				}
			});
		},
		addLink: function(e){
			var self = this;
			var popBox = $('<div id="linkPopBox"></div>');
			var popHeader = $('<div class="popHeader"><a href="javascript:void(0);" id="closePopBoxBtn"></a></div>');
			var popBody = $('<div class="popBody"></div>');
			var linkUrlBox = $('<div><span style="font-size:12px;">请输入链接地址：</span></div><div><input id="linkInput" type="text" size="40" /></div>');
			popBody.append(linkUrlBox);
			var popFooter = $('<div class="popFooter"><input type="button" id="addLinkBtn" value="添加链接" /></div>')
			popBox.append(popHeader).append(popBody).append(popFooter);
			var pos = $(e.target).position();
			self.editmenu.displayPopWin(pos,popBox);
			$(e.target).parent().append(self.editmenu.popWin);
			self.editmenu.popWin.show();
			$('#closePopBoxBtn').click(function(){
				self.editmenu.hidePopWin();
			});
			$('#addLinkBtn').click(function(){
				var linkValue = $('#linkInput').val();
				self.editmenu.editbody.cw.document.execCommand("createLink",false,linkValue);
				self.editmenu.hidePopWin();
				//self.editmenu.editbody.cw.focus();
			});
			$('#linkInput').mousedown(function(e){
				e.stopPropagation();
			});
			self.editmenu.popWin.unbind('mouseleave').unbind('mouseenter');
		},
		cancelLink: function(){
			var self = this;
			self.editmenu.editbody.cw.document.execCommand("unlink",false,false);
		},
		addStar: function(){
			var self = this;
			var sel = self.editmenu.editbody.cw.document.getSelection();
			var range = sel.getRangeAt(0);
			var imgURL = self.editmenu.imagePath + self.editmenu.menuInfo.baseInfo.addStar.imgPath;
			//self.editmenu.editbody.cw.document.execCommand("insertImage",false,imgURL);
			var img = document.createElement('img');
			img.src = imgURL;
			range.surroundContents(img);
			$('.' + self.editmenu.editbody.bodyInfo.section,self.editmenu.editbody.cw.document).focus();
			range.collapse(false);
			range.setEndAfter(img);
			range.setStartAfter(img);
			//光标强制刷新
			sel.removeAllRanges();
			sel.addRange(range);
		},
		addStar2: function(){
			var self = this;
			try{
				var sel = self.editmenu.editbody.cw.document.getSelection();
				var range = sel.getRangeAt(0);

			}catch(e){
				self.editfooter.setStatusMsg("请先在编辑器中选择插入点。");
			}
			var star = document.createTextNode('★');
			range.insertNode(star);
			$('.' + self.editmenu.editbody.bodyInfo.section,self.editmenu.editbody.cw.document).focus();
			range.collapse(false);
			range.setEndAfter(star);
			range.setStartAfter(star);
			//光标强制刷新
			sel.removeAllRanges();
			sel.addRange(range);
		},
		preview: function(){
			var self = this;
			var win = window.open("about:blank");
			win.document.write('<html><head><link type="text/css" rel="stylesheet" href="'+this.properties.url.previewCss+'" /></head><body>'+self.editmenu.editbody.bodyEvent.getHtmlContent.call(self.editmenu, true)+'</body></html>');
			win.document.close();
		},
		editModeTrans: function(e){
			//todo
			var self = this;
			if($(e.target).parent().hasClass('actived')){
				self.editMode = "doc";
				$(e.target).attr('title','编辑文档');
				$(e.target).parent().siblings().removeClass('disabled').children('a').css({'opacity':1,'cursor':'pointer'});
				self.editmenu.bindEvent.call(self);
				$(e.target).parent().removeClass('actived');
				$('.'+self.editbody.bodyInfo.section,self.editmenu.editbody.cw.document).removeClass('codeHtml');
				var text = $('.'+self.editbody.bodyInfo.section,self.editmenu.editbody.cw.document).text();
				$('.'+self.editbody.bodyInfo.section,self.editmenu.editbody.cw.document).html(text);
			}else{
				self.editMode = "code";
				$(e.target).attr('title','编辑HTML');
				$(e.target).parent().siblings().addClass('disabled').children('a').each(function(i,n){
					$(n).unbind('click').css({'opacity':0.2,'cursor':'default'});
				});
				$(e.target).parent().addClass('actived');
				$('.'+self.editbody.bodyInfo.section,self.editmenu.editbody.cw.document).addClass('codeHtml');
				var html = $('.'+self.editbody.bodyInfo.section,self.editmenu.editbody.cw.document).html();
				$('.'+self.editbody.bodyInfo.section,self.editmenu.editbody.cw.document).text(html);
			}
		}
	}
};
editMenu.prototype.initMenu = function (){
	var self = this;
	var menuItem = $('<ul></ul>');
	//for(var item = 0; item < this.base.length; item++){
		//if(typeof this.menuInfo.baseInfo[this.base[item]] !== 'undefined'){
			//var menuLi = $('<li id="'+this.base[item]+'"></li>');
			//var menuLiA = $('<a href="javascript:void(0);" title="' + this.menuInfo.baseInfo[this.base[item]].name + '"></a>');
			//if(this.menuInfo.baseInfo[this.base[item]].imgPath === ""){
				//menuLiA.append('<span style="margin-left:1px;">' + this.menuInfo.baseInfo[this.base[item]].name + '</span>');
			//}else{
				//menuLiA.css('background','url(' + this.imagePath + this.menuInfo.baseInfo[this.base[item]].imgPath + ')');
			//}
			//menuLi.append(menuLiA);
			//menuItem.append(menuLi);
		//}
	//}
	$.each(this.base, function(i,n){
		if(typeof self.menuInfo.baseInfo[n] !== 'undefined'){
			var menuLi = $('<li id="'+n+'"></li>');
			var menuLiA = $('<a href="javascript:void(0);" title="' + self.menuInfo.baseInfo[n].name + '"></a>');
			if(self.menuInfo.baseInfo[n].imgPath === ""){
				menuLiA.append('<span style="margin-left:1px;">' + self.menuInfo.baseInfo[n].name + '</span>');
				menuLiA.css({'width':'auto', 'font-size':'12px'});
				if(self.menuInfo.baseInfo[n].name == "★"){
					menuLiA.css('font-size','14px');
				}
			}else{
				menuLiA.css('background','url(' + self.imagePath + self.menuInfo.baseInfo[n].imgPath + ')');
			}
			menuLi.append(menuLiA);
			menuItem.append(menuLi);
		}
	});
	this.menuContainer.append(menuItem);

	//提交编辑器内容的时候要记得清空localStorage.lastContent，如果不清空，则保存至下次提示未提交，对用户造成困扰。
	//此功能需要验证，想办法验证一下。localStorage.removeItem("key");
	if(localStorage.getItem(self.editorKey)){
		var remindDiv = $('<div id="remindDiv"><span>您有上次未提交成功的文档</span><span><a href="javascript:void(0);" id="1_recovery">恢复文档</a></span><span><a href="javascript:void(0);" id="remindDivClose"></a></span></div>');
		this.menuContainer.append(remindDiv);
	}
	return this.menuContainer;
}
editMenu.prototype.getMenu = function (){
	return this.menuContainer;
}
editMenu.prototype.bindEvent = function (){
	var self = this;
	if($('#remindDiv',self.container).length > 0){
		$('#1_recovery', self.container).unbind('click').click(function (){
			self.editfooter.recovery.call(self);
			$('#remindDiv',self.container).hide();
		});
		$('#remindDivClose', self.container).unbind('click').click(function(){
			$('#remindDiv',self.container).hide();
		});
	}
	function Middle(n){
		this.clickFunction = function(e){
			self.editmenu.menuInfo.action[self.editmenu.menuInfo.baseInfo[n].action].call(self, e);
		}
		this.mouseleaveFunction = function(e){
			if($(e.target).has('#popWin').length > 0){
				self.editmenu.hidePopWin();
			}

		}
	}
	$.each(self.base, function(i,n){
		if(typeof self.editmenu.menuInfo.baseInfo[n] !== 'undefined'){
			var middler = new Middle(n);
			$('#' + n + " a",self.editmenu.menuContainer).unbind('click').bind('click',middler.clickFunction);
			if(n == "color"){
				$('#' + n,self.editmenu.menuContainer).unbind('mouseleave').mouseleave(middler.mouseleaveFunction);
			}
		}
	});
}
editMenu.prototype.displayPopWin = function(pos, element){
	//加入了拖拽的功能，还可以更好些。
	var self = this;
	this.popWin.empty().append(element);
	this.popWin.css({'position':'absolute','top':pos.top + 18,'left':pos.left - 3, 'cursor':'move'});
	this.popWin.mousedown(function(e){
		var edges = self.container.offset();
		var posStartX = parseInt($(this).css('left'));
		var posStartY = parseInt($(this).css('top'));
		var cursorStartX = e.pageX;
		var cursorStartY = e.pageY;
		$(this).mousemove(function(e){
			$(this).css({'top':e.pageY - cursorStartY + posStartY, 'left':e.pageX - cursorStartX + posStartX});
		});
		$(this).mouseup(function(){
			$(this).unbind('mousemove');
		});
		$(this).mouseout(function(){
			$(this).unbind('mousemove');
		});
	});
}
editMenu.prototype.hidePopWin = function(){
	$('#popWin').hide('fast');
}


function editBody(opt){
	var defaults = {

	};
	$.extend(this, defaults, opt || {});
	this.baseSection = $('<iframe class="TN_iframe" frameborder="0" width="100%" height="100%"></iframe>');
	this.bodyContainer = $('<div id="bodyContainer" style="overflow:hidden;"></div>');
	this.leftContainer = $('<div class="leftContainer"></div>');
	this.rightToolPanel = $('<div class="rightToolPanel"></div>')
	this.bodyContainer.append(this.leftContainer).append(this.rightToolPanel);
	this.leftContainer.append(this.baseSection);
	//this.initBody();
}
editBody.prototype.initBody = function (){
	this.bodyContainer.css('height',this.height-60);
	this.leftContainer.css({'height':this.height-60,'width':this.width -2});
	// this.rightToolPanel.css({'height':this.height-60,'width':'98px'});
}
editBody.prototype.getBody = function (){
	return this.bodyContainer;
}

editBody.prototype.bodyInfo = {
	section: 'baseSection'
}
editBody.prototype.bodyEvent = {
	getHtmlContent: function(flag){
		var self = this;
		var section = null;
		if (flag){
			section = $('.' + self.editbody.bodyInfo.section,self.editbody.cw.document).parent().clone();
			$('.' + self.editbody.bodyInfo.section + '',section).removeAttr('contenteditable');
		}else{
			section = $('.' + self.editbody.bodyInfo.section,self.editbody.cw.document).clone();
		}
		return section.html();
	},
	setHtmlContent: function(content){
		var self = this;
		$('.' + self.editbody.bodyInfo.section + '',self.editbody.cw.document).empty().html(content);
	},
	getTextContent: function(){
		var self = this;
		var section = null;
		section = $('.' + self.editbody.bodyInfo.section,self.editbody.cw.document).clone();
		return section.text();
	},
	setTextContent: function(content){
		var self = this;
		$('.' + self.editbody.bodyInfo.section + '',self.editbody.cw.document).empty().text(content);
	}
}

editBody.prototype.setbaseSection = function() {
	var self = this;
	//this.cw = document.getElementById('TN_iframe').contentWindow;
	this.cw = $('.TN_iframe', self.container)[0].contentWindow;
	this.cw.document.open();
	this.cw.document.write('<div contenteditable="true" spellcheck="false" class="' + self.bodyInfo.section + '" style="word-wrap:break-word;word-break:break-all;font-size:12px;cursor:text;outline:none;"></div>');
	$('.' + self.bodyInfo.section + '',this.cw.document).css('min-height',this.height-76);
	$('head',this.cw.document).append('<link rel="stylesheet" href="'+this.properties.url.editableBoxCss+'" />');
	this.cw.document.close();
}
//editBody.prototype.getHtmlContent = function(flag){
	//var self = this;
	//var section = null;
	//if (flag){
		//section = $('.' + self.bodyInfo.section + '',this.cw.document).parent().clone();
		//$('.' + self.bodyInfo.section + '',section).removeAttr('contenteditable');
	//}else{
		//section = $('.' + self.bodyInfo.section + '',this.cw.document).clone();
	//}
	//return section.html();
//}
//editBody.prototype.setHtmlContent = function(content){
	//var self = this;
	//$('.' + self.bodyInfo.section + '',self.cw.document).empty().append(content);
//}

function editFooter(opt){
	var defaults = {

	};
	$.extend(this, defaults, opt || {});
	this.footerContainer = $('<div id="editFooter"></div>');
	//   this.initFooter();
}
editFooter.prototype.initFooter = function (){
	var statusdiv = $('<div id="statusDiv"></div>');
	var otherFunctiondiv = $('<div id="otherFunctionDiv"><span id="remindTime"></span><span><a href="javascript:void(0);" id="manualSave">保存文档</a></span><span>|</span><span><a href="javascript:void(0);" id="2_recovery">恢复文档</a></span><span style="margin-left:20px;"><a href="javascript:void(0);" id="emptyDoc">清空文档</a></span></div>');
	this.footerContainer.append(statusdiv).append(otherFunctiondiv);
	this.footerContainer.css('width',this.width-6);
}
editFooter.prototype.bindEvent = function(){
	var self = this;
	$('#manualSave',self.container).click(function(){
		self.editfooter.justSave.call(self);
	});
	$('#2_recovery',self.container).click(function(){
		self.editfooter.recovery.call(self);
	});
	$('#emptyDoc',self.container).click(function(){
		self.editfooter.emptyDocument();
	});
	self.editfooter.autoSave.call(self);
}
editFooter.prototype.justSave = function(){
	var self = this;
	var d = new Date();
	if(self.editMode == 'doc'){
		localStorage.setItem(self.editorKey, self.editbody.bodyEvent.getHtmlContent.call(self, false));//try...catch
	}else if(self.editMode == 'code'){
		localStorage.setItem(self.editorKey, self.editbody.bodyEvent.getTextContent.call(self, false));//try...catch
	}
	
	self.editfooter.setStatusMsg("文档已于" + d.getHours() + ":" + d.getMinutes() + "保存");
}
editFooter.prototype.autoSave = function(){
	var self = this;
	var i = 30;
	function remind(){
		$('#remindTime',self.container).text(i + "秒后自动保存");
		i = i - 10;
		if(i == 0){
			i = 30;
		}
		setTimeout(remind, 10000);
	}
	function save(){
		self.editfooter.justSave.call(self);
	}
	remind();
	setInterval(save, 30000);
}
editFooter.prototype.recovery = function(){
	var self = this;
	var flag = confirm("此操作将覆盖当前文档内容，确定要恢复文档吗？");
	if(flag){
		var lastContentHtml = localStorage.getItem(self.editorKey);
		var mode = self.editMode;
		if(mode == 'doc'){
			self.editbody.bodyEvent.setHtmlContent.call(self, lastContentHtml);//try...catch
		}else if(mode == 'code'){
			self.editbody.bodyEvent.setTextContent.call(self, lastContentHtml);//try...catch
		}		
		self.editfooter.setStatusMsg("已恢复");
	}else{
		return;
	}
}
editFooter.prototype.emptyDocument = function(){
	var self = this;
	var flag = confirm("确定要清空文档吗？");
	if(flag){
		$('.' + self.editbody.bodyInfo.section + '', self.editbody.cw.document).empty();
	}else{
		return;
	}
}
editFooter.prototype.getFooter = function (){
	return this.footerContainer;
}

editFooter.prototype.setStatusMsg = function (msg){
	$('#statusDiv', this.footerContainer).text(msg);
}