//切换页面URL
$("ul .item").on("click",function(){
	$("section").eq($(this).index()).addClass("active").siblings().removeClass("active");
});