/**
 * 函数将从localStorage中读取用户名称和配色方案，然后调整导航栏的标题
 * 使其显示用户名称，改变文档元素的class，来选定配色方案
 */

//检测localStorage是否存在
var enableStorage = 'localStorage' in window;

//从localStorage中取回应用设置
var loadSettings = function(){
	if (enableStorage) {
		var name = localStorage.getItem("name");
		var	colorType = localStorage.getItem('colorType');
		var	nameDisplay = document.getElementById("todoTitle");
		var	colorTypeField = document.getElementById("colorType");
		var	nameFiled = document.getElementById("name-filed");
		
		if (name) {
			nameDisplay.innerHTML = name;
			nameFiled.value = name;
		}else {
			nameDisplay.innerHTML = "Todo List";
			nameFiled.value = '';
		}
		if (colorType) {
			$("#todoTitle").css("background",colorType);
		}
	}
}


var color1;

//颜色选择
$(".showColor").bigColorpicker(function(el,icolor){
	color1 = icolor;
});
$("#f333").bigColorpicker("f3","L",6);


//保存数据到localStorage中 只需利用setItem()方法，并将键值作为参数传入
//将用户名称和配色信息保存到localStorage中

var saveSettings = function(e) {
	e.preventDefault();
	if (enableStorage){
		var name = document.getElementById("name-filed").value;
			
		if (name.length > 0) {
			localStorage.setItem('name',name);
			localStorage.setItem('colorType',color1);
			loadSettings();//保存好数据后 更新应用
			alert("您的设置成功保存");
		} else {
			alert('请输入你的清单名字');
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

var resetSettings = function(){
	//if (confirm("你确定删除所有的数据?","Reset Data")) {
		if (enableStorage) {
			localStorage.clear();
		}
		resetSettings();//数据清除后 将数据设置为默认状态
	//}
}


//将UI与localStorage函数连接起来
//将事件监听器添加到设置视图上，当用户按下按钮时，就能保存或重置数据
//还需要调用loadSeetings() 这样每次从localStorage中读取数据时，都重新加载到应用页面

loadSettings();
document.getElementById("save").addEventListener("click",saveSettings,false);
document.getElementById("reset").addEventListener("click",resetSettings,false);


/**
 * 使用indexDB和web SQL数据库服务，构建UI，并实现应用各项功能
 * 1、检测indexDB和web SQL的浏览器支持
 * 2、链接到数据库，创建一个对象存储
 * 3、为任务列表视图创建一个UI界面
 * 4、实现数据库的搜索引擎，显示搜索结果
 * 5、为任务列表视图实现搜索界面
 * 6、从添加任务视图将新任务添加到数据库中
 * 7、从任务列表视图中更新并删除任务
 * 8、删除数据库，清除所有任务
 */

//1、检测浏览器所支持的数据库是IndexDB还是web SQL

//由于indexDB并非标准特性，需要用浏览器前缀访问浏览器上不同的数据库对象
var indexDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB || false;//找不到 将FALSE赋予该变量

//找到并保持数据库键的范围
var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.mozIDBKeyRange || window.msIDBKeyRange || false;

//web SQL对象并未实现window成员 要检测浏览器是否支持，转而检测作为window成员的openDatabase是否存在
var webSQLSupport = 'openDatabase' in window;


/**
 * 要想创建或链接到IndexDB数据库，应用必须调用一个IndexDB的open方法，如果调用open方法时，数据库还不存在，那就新建一个数据库以及一个连接对象。IndexDB.open成功创建了连接，将调用onsuccess和updateNeeded事件处理器。通过传递到事件处理器的事件对象，可以访问链接对象。利用连接对象，应用就能创建一个对象或索引。
 * 只有当应用处理upgradeNeeded事件时，才能创建对象存储。这一事件在两种情况下触发：
 * 1、创建一个新数据库时
 * 2、数据库的版本号增加时
 * 
 * 当应用调用updateNeeded事件处理器时，就会通过createObjectStore方法来创建对象存储。该方法有两个参数：新对象存储的名称和键路径。要想从一个对象存储中取回某个对象，需要知道该对象的键
 * 
 * 创建好对象存储后，就可以为它创建多个索引。索引能让应用使用键来取回对象。创建一个新索引，需要使用对象存储的createIndex方法，并向其传递3个参数：新索引名称、充当键的对象属性名称、option对象。
 * 
 * option有两个属性充当标志参数。第一个标志是unique，充当应用指定键是否共享。第二标志是multiEntry，应用指定如何处理基于数组的键
 */

/**
 * 第二步：链接到数据库，并创建一个对象存储
 * 
 * 创建一个名为task的对象存储，以便存储用户将要记录的所有任务。注意，这里需要建立数据库连接，这样才能创建对象存储和索引。将基于任务描述，使用索引来访问对象存储
 *
 * 介绍一个跟创建对象存储和索引无关的函数：loadTasks 当应用启动时，需要把已有的task对象加载到任务列表视图中。
 * 
 * 下面的代码主要实现：打开一个数据库连接，创建一个对象存储，为不支持IndexDB功能的浏览器提供web SQL回退方案。
 */

var db;//用db来存储数据库连接

var openDB = function (){
	if (indexDB) {
		//open是一个异步方法，当请求开始后，open会立刻返回一个IDBRequest对象。如果数据库不存在，则创建一个
		var request = indexedDB.open('task',1);
		var upgradeNeeded = 'onupgradeneeded' in request;
		request.onsuccess = function (e) {
			db = e.target.result;
			if (!upgradeNeeded && db.version !='1') {//db.version !='1'表明不存在对象创建 需创建;upgradeNeeded事件不存在，表明浏览器支持已不建议使用setVersion方法
				var setVersionRequest = db.setVersionRequest = db.setVersion('1');
				setVersionRequest.onsuccess = function(e){
					var objectStore = db.createObjectStore('task',{keyPath:'id'});
					//创建索引
					objectStore.createIndex('desc','descUpper',{
						unique: false 
					});
					loadTasks();
				}
			}else {
				loadTasks();
			}
		}
		if (upgradeNeeded) {
			request.onupgradeneeded = function(e) {//当数据库首次创建时，调用该事件处理器
				db = e.target.result;
				var objectStore = db.createObjectStore('tasks',{
					keyPath:'id'
				});
				objectStore.createIndex('desc','descUpper',{
					unique: false
				});
			}
		}
	}else if (webSQLSupport) {
		db = openDatabase('tasks','1.0','Tasks database',(5*1024*1024));//为task数据库分配5M的存储空间
		db.transaction(function(tx){
			var sql = 'CREATE TABLE IF NOT EXISTS tasks (' + 'id INTEGRE PRIMARY KEY ASC,' + 'desc TEXT,' + 'due DATETIME,' + 'complete BOOLEAN' + ')';
			//使用事物对象tx的executeSql方法创建一个tasks表（如果不存在的话），[]没有传入可选的参数数组 loadTasks回调函数
			tx.executeSql(sql,[],loadTasks);
		});
		
	}
	openDB();
}

//3、为任务列表视图创建UI

 var createEmptyItem = function(query, taskList) {
      var emptyItem = document.createElement('li');
      if(query.length > 0) {
        emptyItem.innerHTML = '<div class="item-title">'+
          'No tasks match your query <strong>'+query+'</strong>.'+
          '</div>';
      } else {
        emptyItem.innerHTML = '<div class="item-title">'+
          'No tasks to display. <a href="#add">Add one</a>?'+
          '</div>';
      }
      taskList.appendChild(emptyItem);
    }
    var showTask = function(task, list) {
      var newItem = document.createElement('li'),
          checked = (task.complete == 1) ? ' checked="checked"' : '';
      newItem.innerHTML =
        '<div class="item_complete">'+
        '<input type="checkbox" name="item_complete" '+
        'id="chk_'+task.id+'"'+checked+'>'+
        '</div>'+
        '<div class="item_delete">'+
        '<a href="#" id="del_'+task.id+'">Delete</a>'+
        '</div>'+
        '<div class="item-title">'+task.desc+'</div>'+
        '<div class="item_due">'+task.due+'</div>';
      list.appendChild(newItem);
      var markAsComplete = function(e) {
        e.preventDefault();
        var updatedTask = {
          id: task.id,
          desc: task.desc,
          descUpper: task.desc.toUpperCase(),
          due: task.due,
          complete: e.target.checked
        };
        updateTask(updatedTask);
      }
      var remove = function(e) {
        e.preventDefault();
        if(confirm('Deleting task. Are you sure?', 'Delete')) {
          deleteTask(task.id);
        }
      }
      document.getElementById('chk_'+task.id).onchange =
        markAsComplete;
      document.getElementById('del_'+task.id).onclick = remove;
    }
    

//4、搜索IndexDB数据库，从中取出一个task对象的列表，并将其实现在任务列表视图上

var loadTasks = function(q) {
      var taskList = document.getElementById('task_list'),
          query = q || '';
      taskList.innerHTML = '';
      if(indexedDB) {
        var tx = db.transaction(['tasks'], 'readonly'),
            objectStore = tx.objectStore('tasks'), cursor, i = 0;
        if(query.length > 0) {
          var index = objectStore.index('desc'),
              upperQ = query.toUpperCase(),
              keyRange = IDBKeyRange.bound(upperQ, upperQ+'z');
          cursor = index.openCursor(keyRange);
        } else {
          cursor = objectStore.openCursor();
        }
        cursor.onsuccess = function(e) {
          var result = e.target.result;
          if(result == null) return;
          i++;
          showTask(result.value, taskList);
          result['continue']();
        }
        tx.oncomplete = function(e) {
          if(i == 0) { createEmptyItem(query, taskList); }
        }
      } else if(webSQLSupport) {
        db.transaction(function(tx) {
          var sql, args = [];
          if(query.length > 0) {
            sql = 'SELECT * FROM tasks WHERE desc LIKE ?';
            args[0] = query+'%';
          } else {
            sql = 'SELECT * FROM tasks';
          }
          var iterateRows = function(tx, results) {
            var i = 0, len = results.rows.length;
            for(;i<len;i++) {
              showTask(results.rows.item(i), taskList);
            }
            if(len === 0) { createEmptyItem(query, taskList); }
          }
          tx.executeSql(sql, args, iterateRows);
        });
      }
    }

//5、为任务视图实现搜索界面
    var searchTasks = function(e) {
      e.preventDefault();
      var query = document.forms.search.query.value;
      if(query.length > 0) {
        loadTasks(query);
      } else {
        loadTasks();
      }
    }
    document.getElementById("search").addEventListener('submit', searchTasks, false);
    
//6、从添加任务视图将新任务添加到数据库中
 var insertTask = function(e) {
      e.preventDefault();
      var desc = document.getElementById("txt").value,
          dueDate = document.getElementById("dueDate").value;
      if(desc.length > 0 && dueDate.length > 0) {
        var task = {
          id: new Date().getTime(),
          desc: desc,
          descUpper: desc.toUpperCase(),
          due: dueDate,
          complete: false
        }
        if(indexedDB) {
          var tx = db.transaction(['tasks'], 'readwrite');
          var objectStore = tx.objectStore('tasks');
          var request = objectStore.add(task);
          tx.oncomplete = updateView;

        } else if(webSQLSupport) {
          db.transaction(function(tx) {
            var sql = 'INSERT INTO tasks(desc, due, complete) '+
                'VALUES(?, ?, ?)',
                args = [task.desc, task.due, task.complete];
            tx.executeSql(sql, args, updateView);
          });
        }
      } else {
        alert('Please fill out all fields', 'Add task error');
      }
    }
    function updateView(){
      loadTasks();
      alert('Task added successfully', 'Task added');
      document.getElementById("txt") = '';
      document.getElementById("dueDate").value = '';
      location.hash = '#list';
    }
    document.getElementById("addForm").addEventListener('submit', insertTask, false);
    
 var updateTask = function(task) {
      if(indexedDB) {
        var tx = db.transaction(['tasks'], 'readwrite');
        var objectStore = tx.objectStore('tasks');
        var request = objectStore.put(task);
      } else if(webSQLSupport) {
        var complete = (task.complete) ? 1 : 0;
        db.transaction(function(tx) {
          var sql = 'UPDATE tasks SET complete = ? WHERE id = ?',
              args = [complete, task.id];
          tx.executeSql(sql, args);
        });
      }
    }
    var deleteTask = function(id) {
      if(indexedDB) {
        var tx = db.transaction(['tasks'], 'readwrite');
        var objectStore = tx.objectStore('tasks');
        var request = objectStore['delete'](id);
        tx.oncomplete = loadTasks;
      } else if(webSQLSupport) {
        db.transaction(function(tx) {
          var sql = 'DELETE FROM tasks WHERE id = ?',
              args = [id];
          tx.executeSql(sql, args, loadTasks);
        });
      }
    }
    // 5.16
    var dropDatabase = function() {
      if(indexedDB) {
        var delDBRequest = indexedDB.deleteDatabase('tasks');
        delDBRequest.onsuccess = window.location.reload();
      } else if(webSQLSupport) {
        db.transaction(function(tx) {
          var sql = 'DELETE FROM tasks';
          tx.executeSql(sql, [], loadTasks);
        });
      }
    }
