//切换页面URL
$("ul.nav-menu li").on("click",function(e){
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



$addFormTask.on("submit",function(e){
	var new_task = {};
	
	//禁用默认行为
	e.preventDefault();
	//获取新task值
	var $input = $("#addTodo");
	new_task.content = $input.val();
	//Task的值为空不执行
	if (!new_task.content)return false;
	
	if(add_task(new_task)){
		render_task_list();
		$input.val('');
	}
	
});

function add_task(new_task){
	//将task推入task_list
	task_list.push(new_task);
	//更新localStorage
	localStorage.setItem("task_list",new_task);
	//localStorage.clear();
	console.log(task_list)
	return true;
	console.log(task_list)
}
function init(){
	task_list = localStorage.getItem("task_list") || [];
	if(task_list.length){
		render_task_list();
	}
}
function render_task_list(){
	var $task_list = $("#task_list");
	$task_list.html('');
	for(var i = 0; i< task_list.length;i++){
		var $task = render_task_tpl(task_list[i]);
		$task_list.append($task);
	}
	
}
function render_task_tpl(data){
	var list_item_tpl = '<li class="task-item">' +
					'<span><input type="checkbox" name="" id="" value="" /></span>' +
					'<span class="item-content">'+ data.content+'</span>' +
					'<div class="pull-right">' +
					'<button class="delete btn btn-danger btn-xs" >' +
					'<a href="" class="task-item-btnColor">delete</a>' +
					'</button>' +
					'<button class="detail btn btn-success btn-xs" >' +
					'<a href="" class="task-item-btnColor" id="detail">detail</a>' +
					'</button></div></li>';
	return $(list_item_tpl);
}
