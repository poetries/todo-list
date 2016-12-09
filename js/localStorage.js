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
			nameDisplay.innerHTML = "Todo List";
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
			var colorScheme = document.forms.settings.color_scheme.value;
			
			localStorage.setItem('name',name);
			localStorage.setItem('colorScheme',colorScheme);
			loadSettings();//保存好数据后 更新应用
			alert("Seetings saved successfully");
		} else {
			alert('请输入你的清单名字',"settings error");
		}
	}else {
		alert("浏览器不支持localStorage");
	}
}

/**
 * 从localStorage中清除数据：
 * localStorage有两种清除数据的方法，第一个是removeItem，适用于删除单个数据
 * 第二种是clear，删除所有的数据
 */

/**
 * 清除后需要加载默认用户设置
 *
 */

var resetSettings = function(e){
	e.preventDefault();
	if (confirm("你确定删除所有的数据?","Reset Data")) {
		if (enable) {
			localStorage.clear();
		}
		resetSettings();//数据清除后 将数据设置为默认状态
	}
}


//将UI与localStorage函数连接起来
//将事件监听器添加到设置视图上，当用户按下按钮时，就能保存或重置数据
//还需要调用loadSeetings() 这样每次从localStorage中读取数据时，都重新加载到应用页面

loadSettings();
document.forms.settings.addEventListener("submit",saveSettings,false);
document.forms.settings.addEventListener("reset",resetSettings,false);

