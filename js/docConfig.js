/**
 *This is SEditor's config of document structure.
 *Maybe in the future, '.xml' will be supported by js friendly.
 *
 *定义规则：有相同key的必须使用数组root是根，content是根元素里面的内容
 *
 *author: harry zhouhai737@gmail.com
 *eidt time: 2012-11-10 17:16
 */

 var SEditorConfig = {
 	root:'tourSection_unniuren',
 	content:{
 		'div.tourContent_new':[{
 			'div.day_title_new':{
 				'h3':{
 					'em':{
 						'text':'第1天'
 					},
 					'div#edit':{
 						'text':'请在这里输入行程标题'
 					}
 				},
 				'ul.time_s_photo clearfix':{
 					'li':[{
 						'a':{
 							'img':{
 								'src':'http://images.tuniu.com/images/2006-07-30/4/4187UI1l64ymaEW4s.jpg',
 								'title':'秦淮河'
 							}
 						},
 						'div':{
 							'a#edit':{
 								'text':'秦淮河'
 							}
 						}
 					}]
 				},
 				'div.tour_line_f#edit':[{
 					'text':'请在这里输入行程描述，内容可以为“航班信息”、“游览路线”等相关内容'
 				}]
 			},
 			'div.tour_food_f':[
 				{
	 				'div.tour_item':{
	 					'em':{
	 						'text':'用餐'
	 					},
	 					'div':[
	 						{
		 						'text':'早餐：',
		 						'span.po_dining_day#edit':{
		 							'text':'敬请自理'
		 						}
		 					},
		 					{
		 						'text':'&#160;午餐：',
		 						'span.po_dining_day#edit':{
		 							'text':'敬请自理'
		 						}
		 					},
		 					{
		 						'text':'&#160;晚餐：',
		 						'span.po_dining_day#edit':{
		 							'text':'敬请自理'
		 						}
		 					}
	 					]
	 				}
	 			},
 				{
 					'div.tour_item':{
	 					'em':{
	 						'text':'住宿'
	 					},
	 					'div#edit':{
	 						'text':'南京路宝宾馆 2人间或同级（独卫、彩电、热水、空调），以当天入住为准'
	 					}
	 				}
 				}
 			]
 		}]
 	}
 }