(function(){
var app =  angular.module('myApp',[])
    .controller('indexCtrl',function($scope,$sce,$http) {
    		//onsole.log();
    		var urlData=hrefSplit(window.location.href);
        $http.get('/blogList?type='+urlData.type+'&page='+urlData.page+'')
        .success(function(data){
          var datas=data.articles
          for(var i=0;i<datas.length;i++){
            datas[i].created_time=moment(datas[i].created_time).format("YYYY-MM-DD HH:mm");
          }
          $scope.lists=datas;
          $scope.currentPage=(1*data.currentPage);
          $scope.type = data.type;
          $scope.pageItem=(function(){
            var pageArr=[];
            for(var i=0;i<=Math.floor(data.allPageNum/10);i++){
              pageArr.push(i+1);
            }
            (data.allPageNum%10==0)?pageArr.pop():'';
            return pageArr;
          })();
          $scope.prePage=function(){
            if($scope.currentPage>1){
              window.location.href='/blog?type='+$scope.type+'&page='+($scope.currentPage-1)+'';
            }  
          }
          $scope.nextPage=function(){
            if($scope.currentPage<=$scope.pageItem.length-1){
              window.location.href='/blog?type='+$scope.type+'&page='+($scope.currentPage+1)+'';
            }  
          }
       })
		})
		
 	.controller('articleCtrl',function($scope,$sce,$http){
 		var ue = UE.getEditor('myEditor',{
	    initialFrameWidth :'879'
	  });
	  var urlData=hrefSplit(window.location.href);
	  $http.get('/blogData?id='+urlData.id+'')
	  .success(function(data){
	  	console.log(data);
	  	$scope.data=data.articleInfo;
	  	$scope.data.created_time=moment($scope.data.created_time).format("YYYY-MM-DD HH:mm");
	    $scope.html=$sce.trustAsHtml(data.articleInfo.html);
	    $scope.addComment=function(){
	      console.log(ue.getContentTxt());
	      if(ue.hasContents()){
	        if(islogin){
	          jQuery.ajax({
	            url: 'blog/comment?id='+urlData.id+'',
	            type: 'POST',
	            dataType: 'json',
	            data: {content: ue.getContent()},
	            success: function(data) {
	              switch(data.code){
	                case '00':
	                  window.location.reload()
	                break;
	                case '01':
	                  alert("系统错误")
	                break;
	              }
	            }
	          });
	        }else{
	          alert("请先登录");
	        }
	      }else{
	        alert("不能为空");
	      }
	    };
	    $scope.comments=(function(){
	      var datas=$scope.data.comment;
	      for(var i=0;i<datas.length;i++){
	        datas[i].content=$sce.trustAsHtml(datas[i].content);
	        datas[i].created_time=moment(datas[i].created_time).format("YYYY-MM-DD HH:mm");
	      }
	      return datas
	    }());
	  })
  })


}())
