
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?4aab8ab102aac01a5b7d313522907f12";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();

$.ajax({
	url:'/integralwall/index/login/check',
	type: 'get',
	dataType: 'json',
	data: {},
	success:function(r){
		console.log(r);
		if (r.code==0 && r.data.code==1) {
			$(".login_hide").hide();
			$("#user_email").text(r.data.user.email);
			$("#pc_navr").show();
		}
	}
})

