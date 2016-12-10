;(function(){
	'use strict';//ES6
	
//切换页面URL
$("ul.nav-menu-list li").on("click",function(e){
	
	e.preventDefault();//阻止冒泡
	
	$("section").eq($(this).index()).addClass("active").siblings("section").removeClass("active");
	
	$(this).find("a").addClass("active").parent().siblings().find("a").removeClass("active");
});

$("#detail").on("click",function(e){
	e.preventDefault();
	$(".task-detail,.task-detail-mask").show();
});

//add todo

init();

var $addFormTask = $(".add-task");
var task_list = [];
var $delete_task;


$addFormTask.on("submit",function(e){
	var new_task = {};
	
	//禁用默认行为
	e.preventDefault();
	//获取新task值
	var $input = $("#addTodo");
	new_task.content = $input.val();
	//Task的值为空不执行
	if (!new_task.content)return;
	
	if(add_task(new_task)){
		render_task_list();
		$input.val('');
	}

	
});

function listener_task_delete(){
	$delete_task.on("click",function(e){
	e.preventDefault();
	
	var $this = $(this);
	var $item = $this.parents(".task-item");
//	console.log($item.data('index'));
	var index = $item.data('index');
	var tmp = confirm("确定删除吗?");
	tmp ? delete_task(index):null;
	
})
}
function add_task(new_task){
	//将task推入task_list
	task_list.push(new_task);
	
	refresh_task_list();

	console.log(task_list);
	return true;

}
//刷新localStorage数据并模板
function refresh_task_list(){
	//更新localStorage
	localStorage.setItem("task_list",task_list);
	
	render_task_list();
}

function delete_task(index){
	//如果没有index 或者index不存在
	if(index == undefined || !task_list[index])return;
	delete task_list[index];
	refresh_task_list();
}
function init(){
	//localStorage.clear();
	task_list = localStorage.getItem("task_list");
	if(task_list.length){
		render_task_list();
	}
	

}
function render_task_list(){
	var $task_list = $("#task_list");
	$task_list.html('');
	for(var i = 0; i< task_list.length;i++){
		var $task = render_task_item(task_list[i],i);
		$task_list.append($task);
	}
	$delete_task = $(".task-item task-item-btnColor.delete");
	listener_task_delete();
	console.log($delete_task);
}
function render_task_item(data,index){
	if(!data || !index) return;
	var list_item_tpl = '<li class="task-item" data-index="'+ index +'">' +
					'<span><input type="checkbox" name="" id="" value="" /></span>' +
					'<span class="item-content">'+ data.content+'</span>' +
					'<div class="pull-right">' +
					'<button class="delete btn btn-danger btn-xs" >' +
					'<a href="" class="task-item-btnColor" id="delete">delete</a>' +
					'</button>' +
					'<button class="detail btn btn-success btn-xs" >' +
					'<a href="" class="task-item-btnColor" id="detail">detail</a>' +
					'</button></div></li>';
	return $(list_item_tpl);
}


})();
