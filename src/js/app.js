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
