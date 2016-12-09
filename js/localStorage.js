/**
 * 函数将从localStorage中读取用户名称和配色方案，然后调整导航栏的标题
 * 使其显示用户名称，改变文档元素的class，来选定配色方案
 */

var enable = 'localStorage' in window;//检测localStorage是否存在

var loadSettings = function(){
	if (enable) {
		var name = localStorage.getItem("name"),
			colorScheme = localStorage.getItem('colorScheme'),
			nameDisplay = document.getElementById("user_name"),
			doc = document.documentElement,
			colorSchemeField = document.forms.settings.color_scheme,
			nameFiled = document.forms.settings.name;
		if (name) {
			nameDisplay.innerHTML = name + "s";
			nameFiled.value = name;
		}else {
			nameDisplay.innerHTML = "My";
			nameFiled.value = '';
		}
		if (colorScheme) {
			doc.className = colorScheme.toLocaleString();
			colorSchemeField.value = colorScheme;
		}else {
			doc.className = 'blue';
			colorSchemeField.value = 'Blue';
		}
	}
}


//保存数据到localStorage中 只需利用setItem()方法，并将键值作为参数传入
//将用户名称和配色信息保存到localStorage中

var saveSettings = function(e) {
	e.preventDefault();
	if (enable){
		var name = document.forms.settings.name.value;
		if (name.length > 0) {
			var colorScheme = document.forms.settins.color_scheme.value;
			
			localStorage.setItem('name',name);
			localStorage.setItem('colorScheme',colorScheme);
			alert("Seetings saved successfully");
		} else {
			alert('请输入你的清单名字',"settings error");
		}
	}else {
		alert("浏览器不支持localStorage");
	}
}
