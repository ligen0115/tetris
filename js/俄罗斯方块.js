; (function (window, undefined) {
    function Block(optional) {
        optional = optional || {};
        this.width = optional.width || 20;
        this.heigth = optional.heigth || 20;
        this.map = document.getElementById('map');
        this.blockArr = [];//保存控制方块数组
        this.blockForm = [//方块样式
            {   //长条形
                x1: [0, 0, 0, 0, 0],
                y1: [0, -1, -2, 1, 2],
                x2: [0, -1, -2, 1, 2],
                y2: [0, 0, 0, 0, 0],
                color: [255, 0, 0],
                colorTop: [160, 25, 25],
                colorLeft: [120, 25, 25],
                index: 2,
            },
            {   //方形
                x1: [0, 1, 0, 1],
                y1: [0, 0, 1, 1],
                color: [0, 0, 255],
                colorTop: [25, 25, 160],
                colorLeft: [25, 25, 120],
                index: 1,
            },
            {   //左勾形
                x1: [0, 0, 0, 1],
                y1: [0, 1, 2, 0],
                x2: [0, -1, -2, 0],
                y2: [0, 0, 0, 1],
                x3: [0, 0, 0, -1],
                y3: [0, -1, -2, 0],
                x4: [0, 1, 2, 0],
                y4: [0, 0, 0, -1],
                color: [0, 255, 0],
                colorTop: [25, 160, 25],
                colorLeft: [25, 120, 25],
                index: 4,
            },
            {   //右勾形
                x1: [0, 0, 0, -1],
                y1: [0, 1, 2, 0],
                x2: [0, -1, -2, 0],
                y2: [0, 0, 0, -1],
                x3: [0, 0, 0, 1],
                y3: [0, -1, -2, 0],
                x4: [0, 1, 2, 0],
                y4: [0, 0, 0, 1],
                color: [255, 180, 0],
                colorTop: [160, 150, 25],
                colorLeft: [120, 120, 25],
                index: 4,
            },
            {   //左梯形
                x1: [0, 0, -1, -1],
                y1: [0, -1, 0, 1],
                x2: [0, -1, 0, 1],
                y2: [0, 0, 1, 1],
                color: [180, 255, 0],
                colorTop: [150, 160, 25],
                colorLeft: [120, 120, 25],
                index: 2,
            },
            {   //右梯形
                x1: [0, 0, 1, 1],
                y1: [0, -1, 0, 1],
                x2: [0, 1, 0, -1],
                y2: [0, 0, 1, 1],
                color: [0, 255, 180],
                colorTop: [25, 160, 150],
                colorLeft: [25, 120, 120],
                index: 2,
            },
            {   //丁形
                x1: [0, -1, 1, 0],
                y1: [0, 0, 0, 1],
                x2: [0, 0, 0, 1],
                y2: [0, -1, 1, 0],
                x3: [0, -1, 1, 0],
                y3: [0, 0, 0, -1],
                x4: [0, 0, 0, -1],
                y4: [0, -1, 1, 0],
                color: [170, 0, 170],
                colorTop: [110, 0, 110],
                colorLeft: [80, 0, 80],
                index: 4,
            },

        ]
    };

    //渲染方块
    Block.prototype.render = function (index, num, top, left) {
        //index: 判断方块类型
        //num: 判断方块样式序号
        //top : 创建方块的高度位置
        //left : 创建方块的水平位置
        var blockForm = this.blockForm[index];//判断方块类型
        if (this.blockArr.length > 0) {//清空控制方块数组
            this.blockArr.length = 0;
        };
        for (var i = 0; i < blockForm['x' + num].length; i++) {
            var p = document.createElement('p');
            if (i % 2 == 0) {
                p.style.transform = 'rotate(90deg)'//每间隔一个小块旋转90度,提高视觉立体效果
            }
            p.style.backgroundColor = 'rgb(' + blockForm.color.join(',') + ')';//背景和边框颜色
            p.style.borderColor = 'rgb(' + blockForm.colorTop.join(',') + ')';
            p.style.borderLeftColor = 'rgb(' + blockForm.colorLeft.join(',') + ')';
            p.style.borderRightColor = 'rgb(' + blockForm.colorLeft.join(',') + ')';
            p.style.left = blockForm['x' + num][i] * 20 + left + 'px';//设置定位偏移值
            p.style.top = blockForm['y' + num][i] * 20 + top + 'px';
            this.map.appendChild(p);
            this.blockArr.push(p);//给控制方块数组添加元素
        };
        return this.blockArr;//返回控制方块数组
    };

    window.Block = Block;//暴露构造函数Block
})(window, undefined);


; (function (window, undefined) {
    function Game(optional) {
        optional = optional || {};
        this.block = new Block();
        this.map = document.getElementById('map');
        this.fallTime = null;//循环下落定时器
        this.mapBlock = [];//保存地图上除了控制方块的所有方块
        this.state = null;//记录方块的样式
        this.index = 6;//方块类型下标
        this.row = {};//记录所有方块高度对象,用作消除方块
        this.control = null;//左,右控制方向定时器
        this.gameClose = false;//判断游戏是否失败
        this.score = document.getElementById('score');//获得分数元素
        this.scoreNum = 0;//分数数值
        this.difficulty = 250;//循环下落定时器时间间隔
        this.suspend = false;
    };

    Game.prototype.begin = function () {//开始游戏
        this.block.render(this.index, 1, 20, 200);//调用方块渲染
        this.state = 1;//方块的样式为1
        this.autoFall();//调用循环下落定时器函数
        this.keyboard();//调用键盘按键函数
    };

    Game.prototype.autoFall = function () {//循环下落定时器函数
        this.fallTime = setInterval(function () {
            this.fall('bottom');//调用下移函数
        }.bind(this), this.difficulty);//循环下落定时器时间间隔变量
    };

    Game.prototype.stop = function (arr, direction) {//停止方块函数
        if (this.gameClose) {
            return;
        };
        //arr:控制方块数组
        //direction:方向参数
        for (var i = 0; i < arr.length; i++) {//遍历控制方块数组
            var currentTop = arr[i].offsetTop;//获取遍历元素高度
            var currentLeft = arr[i].offsetLeft;//获取遍历元素左偏移
            switch (direction) {//判断方向
                case 'bottom': {
                    arr[i].style.top = currentTop - 20 + 'px';//方块下移20像素
                    this.mapBlock.push(arr[i]);//给地图方块数组添加元素
                    break;
                }
                case 'left': {
                    arr[i].style.left = currentLeft + 20 + 'px';
                    //方块超出地图左边界,右移20像素复位
                    break;
                }
                case 'rigth': {
                    arr[i].style.left = currentLeft - 20 + 'px';
                    //方块超出地图右边界,左移20像素复位
                    break;
                };
            };
        };

        for (var j = 0; j < this.mapBlock.length; j++) {//遍历地图方块数组
            currentTop = this.mapBlock[j].offsetTop;//获取遍历元素高度
            if (currentTop <= 0) {//元素高度大于或等于地图高度则游戏失败
                if (!alert('游戏失败')) {
                    clearInterval(this.fallTime);
                    clearInterval(this.control);
                    this.gameClose = true;
                    return;
                };
            };
            if (!this.row[currentTop]) {//当this.row没有对应的高度属性时,添加对应的高度属性,数值设置为1
                this.row[currentTop] = 1;
            } else {
                this.row[currentTop]++;//当前高度属性数值+1
            };
        };

        for (var key in this.row) {//遍历所有方块的高度对象
            if (this.row[key] == this.map.offsetWidth / 20) {//任意高度行属性值(方块数量),等于一行最多容纳的方块数量
                this.eliminate(key);//调用消除方块函数,传入高度属性
            };
        };
        this.row = {};//清空记录高度对象

        if (direction == 'bottom') {
            arr.length = 0;//清空控制方块数组
            this.index = Math.floor(Math.random() * 7);//随机获取控制方块类型下标
            this.state = 1;//方块样式序号设置为1
            this.block.render(this.index, this.state, -40, 200);//调用方块渲染函数
        };
    };

    Game.prototype.eliminate = function (row) {//消除方块函数,row高度属性
        var arr = this.mapBlock;//arr:地图方块数组
        var remove = [];//创建空数组记录需要移除的方块
        for (var i = 0; i < this.mapBlock.length; i++) {//遍历地图方块数组
            if (this.mapBlock[i].offsetTop == row) {//遍历的元素高度==传入的row高度属性
                this.map.removeChild(this.mapBlock[i]);//移除当前遍历的元素
                remove.push(i);//记录需要移除的方块下标
            };
            var top = this.mapBlock[i].offsetTop;//记录当前遍历元素高度
            if (top < row) {//如果该方块在移除方块行的上面,则下移20像素
                this.mapBlock[i].style.top = top + 20 + 'px';
            };
        };
        for (var i = remove.length - 1; i >= 0; i--) {//倒序遍历移除方块数组
            this.mapBlock.splice(remove[i], 1);//给地图方块数组移除遍历的元素
        };
        this.scoreNum++;//分数+1
        this.score.innerText = this.scoreNum;
        if (this.difficulty >= 150) {//根据分数设置下落时间间隔
            this.difficulty -= 5;
        };

    };

    Game.prototype.fall = function (direction) {//下移函数
        //direction: 方向参数
        var arr = this.block.blockArr;//获取控制方块数组
        var isOverlap = false;//开关变量
        //取地图方块最高度高度
        var mapMaxH = Infinity;
        for (var i = 0; i < this.mapBlock.length; i++) {
            if (this.mapBlock[i].offsetTop < mapMaxH) {
                mapMaxH = this.mapBlock[i].offsetTop;
            };
        };

        for (var i = 0; i < arr.length; i++) {//遍历控制方块数组
            var currentTop = arr[i].offsetTop;//记录当前遍历元素高度
            if (direction == 'bottom') {
                //如果direction的值为bottom,则方块下移20像素
                arr[i].style.top = currentTop + 20 + 'px';
                currentTop = arr[i].offsetTop;//重新设置当前高度
            };
            if (!isOverlap) {
                if (currentTop == this.map.offsetHeight) {
                    //如果当前高度等于地图高度,开关设置为true
                    isOverlap = true;
                };
                //获取控制方块最低高度
                var blockMinH = -Infinity;
                for (var j = 0; j < arr.length; j++) {
                    if (arr[i].offsetTop > blockMinH) {
                        blockMinH = arr[i].offsetTop;
                    };
                };

                if (direction == 'change') {//判断是否为A,D按键调用函数
                    for (var j = 0; j < arr.length; j++) {//遍历控制方块数组
                        if (arr[i].offsetLeft < 0 || arr[i].offsetLeft > this.map.offsetWidth - 20) {
                            //方块如果超过地图左右边界,开关设置为true
                            isOverlap = true;
                            break;
                        };
                    };
                };
                if (blockMinH >= mapMaxH) {//当控制方块和地图方块高度重合时
                    for (var j = 0; j < arr.length; j++) {//遍历控制方块数组
                        for (var k = 0; k < this.mapBlock.length; k++) {//遍历地图方块数组
                            if (this.mapBlock[k].offsetLeft == arr[i].offsetLeft && this.mapBlock[k].offsetTop == arr[i].offsetTop) {
                                //如果遍历的地图元素位置==控制元素的位置,开关设置为true
                                isOverlap = true;
                                break;
                            };
                        };
                    };
                };
            };
        };
        if (isOverlap) {
            this.stop(arr, direction)//调用停止方块函数,arr:控制数组函数,direction:方向函数
            return true;
        };
    };

    Game.prototype.blockMove = function (direction) {//方块水平移动函数
        //direction:移动数值
        var arr = this.block.blockArr;//控制方块数组
        var isOverlap = false;//开关变量
        for (var i = 0; i < arr.length; i++) {//遍历控制方块数组
            var currentLeft = arr[i].offsetLeft;//记录遍历元素的左偏移
            arr[i].style.left = currentLeft + direction + 'px';//移动方块
            currentLeft = arr[i].offsetLeft;//记录遍历元素的左偏移
            if (!isOverlap) {
                if (currentLeft < 0 || currentLeft > this.map.offsetWidth - 20) {
                    //如果移动后的方块位置超出地图左右边界,isOverlap设置为true
                    isOverlap = true;
                };
            };
        };
        if (isOverlap) {
            for (var i = 0; i < arr.length; i++) {//超出边界则复位
                currentLeft = arr[i].offsetLeft;
                arr[i].style.left = currentLeft - direction + 'px';
            };
        };
    };

    Game.prototype.keyboard = function () {//键盘函数
        onkeydown = function (e) {//键盘按下
            if (this.gameClose) {//判断游戏状态
                return;
            };
            var code = e.keyCode || e.which || e.charCode;
            if (code == 32) {//键盘 空格
                if (!this.suspend) {
                    clearInterval(this.fallTime);
                    clearInterval(this.control);
                    this.suspend = true;
                } else {
                    this.suspend = false;
                    this.autoFall();//调用自动下落函数
                };
            };
            if (this.suspend) {
                return
            };
            switch (code) {
                case 65: {//键盘A
                    this.blockMove(-20)//调用水平移动函数
                    this.fall('left');//调用下移函数判断是否需要停止方块

                    clearInterval(this.control);//清除水平移动定时器
                    this.control = setInterval(function () {
                        this.blockMove(-20)//调用水平移动函数
                        this.fall('left');//调用下移函数判断是否需要停止方块
                    }.bind(this), 100);
                    break;
                };
                case 68: {//键盘D
                    this.blockMove(20)
                    this.fall('rigth');
                    clearInterval(this.control);
                    this.control = setInterval(function () {
                        this.blockMove(20)
                        this.fall('rigth');
                    }.bind(this), 100);
                    break;
                };
                case 83: {//键盘S
                    clearInterval(this.fallTime);//清除下落移动定时器
                    this.fallTime = setInterval(function () {
                        this.fall('bottom');
                    }.bind(this), 20);
                    break;
                };
                case 74: {//键盘J
                    this.state++;//当前方块样式序号+1
                    if (this.state > this.block.blockForm[this.index].index) {
                        //如果方块样式序号超过了该方块类型的最大样式数量,则样式设置为1
                        this.state = 1;
                    };

                    var top = this.block.blockArr[0].offsetTop;//获取定位方块的位置
                    var left = this.block.blockArr[0].offsetLeft;

                    for (var i = 0; i < this.block.blockArr.length; i++) {//遍历控制方块数组
                        this.map.removeChild(this.block.blockArr[i]);//移除方块
                    };
                    var arr = this.block.render(this.index, this.state, top, left);//重新渲染方块
                    if (this.fall('change')) {
                        //调用下落函数,如果返回的值为true,则代表没有足够的空间放置修改后的样式方块,重新渲染回上一个样式
                        for (var i = 0; i < this.block.blockArr.length; i++) {
                            this.map.removeChild(this.block.blockArr[i]);
                        };
                        if (this.state != 1) {
                            this.state--;
                        } else {
                            this.state = this.block.blockForm[this.index].index;
                        };
                        var arr = this.block.render(this.index, this.state, top, left);
                    };
                    break;
                };
                case 75: {//键盘K
                    if (this.state > 1) {
                        this.state--;
                    } else {
                        this.state = this.block.blockForm[this.index].index;
                    };
                    var top = this.block.blockArr[0].offsetTop;
                    var left = this.block.blockArr[0].offsetLeft;
                    for (var i = 0; i < this.block.blockArr.length; i++) {
                        this.map.removeChild(this.block.blockArr[i]);
                    };
                    var arr = this.block.render(this.index, this.state, top, left);
                    if (this.fall('change')) {
                        for (var i = 0; i < this.block.blockArr.length; i++) {
                            this.map.removeChild(this.block.blockArr[i]);
                        };
                        if (this.state != this.block.blockForm[this.index].index) {
                            this.state++;
                        } else {
                            this.state = 1;
                        };
                        var arr = this.block.render(this.index, this.state, top, left);
                    };
                    break;
                };
            };
        }.bind(this);

        onkeyup = function (e) {//键盘松开
            if (this.gameClose) {
                return;
            };
            if (this.suspend) {
                return
            };
            var code = e.keyCode || e.which || e.charCode;
            switch (code) {
                case 65: {//A
                    clearInterval(this.control);//清除水平移动定时器
                    break;
                };
                case 68: {//D
                    clearInterval(this.control);//清除水平移动定时器
                    break;
                };
                case 83: {//S
                    clearInterval(this.fallTime);//清除下落移动定时器
                    this.autoFall();//调用自动下落函数
                    break;
                };
            };
        }.bind(this);
    };

    window.Game = Game;//暴露构造函数Game
})(window, undefined);

//--------------------------开始游戏--------------------------
; (function (window, undefined) {
    var s1 = new Game();
    s1.begin();
})(window, undefined);