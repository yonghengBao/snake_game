//index.js
var app = getApp();
//点击位置的位置
var start = {x:0,y:0};
//移动的位置
var startMove = {x:0,y:0};
//移动位置和开始位置的差值
var X,Y;
var direcition = null;
//控制蛇头运动的方向
var direcitionHead = null;
//蛇头的对象
var snakeHead = {
  x:0,
  y:0,
  w:10,
  h:10,
  color:"#ff0000"
}
//身体对象
var snakeBody = [];
//食物对象
var foodLists = [];
//系统宽高
var windowWidth = 0;
var windowHight =0;
//是否要执行删除蛇身体的长度
var collideBol = true;
//是否在点击暂停了
var isMovement = false;
//运动速度
var speed = 30;
Page({
  data: {
    reqtAniTimer: null,
    statu:0,//状态 0：暂停中，1：运动中
    getScore:0 //总得分
  
  },
  //开始点击
  tapStart(e){
    start = e.touches[0];
  },
  //手指移动
  tapMove(e){
    startMove = e.touches[0];
    X =startMove.x-start.x;
    Y = startMove.y-start.y;
    if( Math.abs(X) > Math.abs(Y) && X>0 ){
      direcition = "right";
    }else if( Math.abs(X) > Math.abs(Y) && X<0 ){
      direcition = "left";
    }else if( Math.abs(X) < Math.abs(Y) && Y>0 ){
      direcition = "bottom";
    }else if( Math.abs(X) < Math.abs(Y) && Y<0 ){
      direcition = "top";
    }
  },
  //手指离开
  tapMoveEnd(){
    direcitionHead = direcition;
  },
  //控制
  controls(){
    if(this.data.statu==1){
      this.setData({statu:0});
      isMovement = true;
      app.globalData.cancelAnimationFrame(this.data.reqtAniTimer);
      this.setData({
        reloadStart:null
      })
    }else{
      this.setData({statu:1});
      direcitionHead = "right";
      if(isMovement){
        this.onReady();
        console.log(111)
      }
    }
  },
  //重新开始
  reloadStart(){
    app.globalData.cancelAnimationFrame(this.data.reqtAniTimer);
    snakeHead.x = 0;
    snakeHead.y = 0;
    foodLists = [];
    snakeBody = [];
    start = {x:0,y:0};
    direcitionHead = null;
    this.setData({
      getScore:0,
      statu:0
    });
    speed = 30;
    isMovement = false;
    this.onReady();
  },
  drawFn(obj,context){
    context.setFillStyle(obj.color);
    context.beginPath();
    context.rect(obj.x,obj.y,obj.w,obj.h);
    context.closePath;
    context.fill();
  },
  checkRequestAnimationFrame(){
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length ; ++x) {
      app.globalData.requestAnimationFrame = app.globalData[vendors[x] + 'RequestAnimationFrame'];
      app.globalData.cancelAnimationFrame = app.globalData[vendors[x] + 'CancelAnimationFrame'] ||    // Webkit中此取消方法的名字变了
      app.globalData[vendors[x] + 'CancelRequestAnimationFrame'];
    }
 
    // if (!requestAnimationFrame) {
      app.globalData.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            var timer = setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return timer;
        };
    // }
    // if (!cancelAnimationFrame) {
      app.globalData.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    // }
  },
  showMsg(title){
    var that = this;
    wx.showModal({
      title: title,
      content: '本次游戏结束',
      confirmText:"重新开始",
      showCancel:false,
      success(res) {
        if (res.confirm) {
          that.reloadStart();
        }
        // else if(res.cancel){
        //   that.setData({
        //     isDisabled:true
        //   })
        // }
      }
    });
  },
  onReady(){
    this.onStrat()
  },
  onStrat(){
    this.checkRequestAnimationFrame();
    // let context = wx.createCanvasContext("mycanvas");
    const that = this;
    let context = wx.createContext();
  
    //帧数
    let framenum = 0;
    //碰撞函数
    function collide(obj1,obj2) {
      var left1 = obj1.x,
          right1 = left1+obj1.w,
          top1 = obj1.y,
          bottom1 = top1+obj1.h;
      var left2 = obj2.x,
          right2 = left2+obj2.w,
          top2 = obj2.y,
          bottom2 = top2+obj2.h; 
      if(right1>left2 && left1<right2 && bottom1>top2 && top1<bottom2){
        return true;
      }else {
        return false;
      }
    }
    function animate(){
      framenum++;
      if(framenum%speed == 0){
        //存蛇身的位置（是蛇头的上一个位置）
        snakeBody.push({
          x:snakeHead.x,
          y:snakeHead.y,
          w:snakeHead.w,
          h:snakeHead.h,
          color:"#333"
        });
        //默认蛇身长度只有4节，多余的删除
        if(snakeBody.length>4){ //游戏开始时只蛇身只有4节
          if(collideBol){  //吃到一个食物就加一节
            snakeBody.shift();
          }else{
            collideBol = true;
          }
        }
        switch(direcitionHead){
          case "right":
          that.setData({statu:1});
            snakeHead.x +=snakeHead.w;
            break;
          case "left":
            snakeHead.x -=snakeHead.w;
            break;
          case "bottom":
          that.setData({statu:1});
            snakeHead.y +=snakeHead.h;
            break;
          case "top":
            snakeHead.y -=snakeHead.h;
            break;
        }
        if(snakeHead.x>windowWidth-snakeHead.w || snakeHead.x<0 || snakeHead.y<0 || (snakeHead.y>windowHight-50-snakeHead.h)){
          that.showMsg("出界拉！");
          that.setData({statu:1});
          that.controls();
          return false;
        }
        //判断是否撞上蛇身
        for(var i=0;i<snakeBody.length;i++){
          var snakeBodyItem = snakeBody[i];
          if(!(snakeHead.x==0 && snakeHead.y==0) && collide(snakeHead,snakeBodyItem)){
            that.showMsg("撞到身体了");
            that.setData({statu:1});
            that.controls();
            return false;
          }
        }
      } 
      //绘制蛇头
      that.drawFn(snakeHead,context);
      //绘制蛇身
      for(var i=0;i<snakeBody.length;i++){
        var snakeBodyItem = snakeBody[i];
        that.drawFn(snakeBodyItem,context);
      }
      //绘制食物
      for(var i=0;i<foodLists.length;i++){
        var foodItem = foodLists[i];
        that.drawFn(foodItem,context);
        if(collide(snakeHead,foodItem)){
          console.log("撞上了")
          that.setData({
            getScore: ++that.data.getScore
          });
          collideBol = false;
          foodItem.reset();
        }
      }
      //变速度
      if(that.data.getScore>20){
        speed = 20;
      }else if(that.data.getScore>50){
        speed = 10;
      }else if(that.data.getScore>100){
        speed = 5;
      }else if(that.data.getScore>200){
        speed = 1;
      }
      wx.drawCanvas({
        canvasId: 'mycanvas',
        actions: context.getActions()
      })
      that.setData({
        reqtAniTimer:app.globalData.requestAnimationFrame(animate)
      })
      // app.globalData.requestAnimationFrame(animate)
    }
    //创建随机数
    function rand(min,max){
      return parseInt(Math.random()*(max-min)+min);
    }
    //构造食物对象
    function Food(){
      this.x = rand(0,windowWidth-10);
      this.y = rand(50,windowHight-20);
      this.w =10;
      this.h =10;
      this.color = `rgb(${rand(0,255)},${rand(0,255)},${rand(0,255)})`;
      this.reset  = function () {
        this.x = rand(0,windowWidth-10);
        this.y = rand(50,windowHight-10);
        this.color = `rgb(${rand(0,255)},${rand(0,255)},${rand(0,255)})`;
      }
    }
    wx.getSystemInfo({
      success(res) {
        windowWidth = res.windowWidth;
        windowHight = res.windowHeight;
        if(foodLists<=20){
          for(var i=0;i<20;i++){
            var foodObj = new Food();
            foodLists.push(foodObj);
          }
        }
        animate();
      }
    });
  }
  
  
})
