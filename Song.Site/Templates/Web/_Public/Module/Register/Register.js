﻿$(function () {
    //弹出注册协议
    $("#linkAgreement").click(function () {
        var title = $(this).text();
        var msg = new MsgBox(title, $(".Agreement").html(), 1000, 80, "msg");
        msg.Open();
        return false;
    });
    Event_init();
    //当提交时，按钮进入预载状态
    setInterval(function () {
        var obj = $("*[state=submit]");
        if (obj.size() < 1) return;
        var vtxt = obj.val();
        var ltxt = obj.attr("loading-txt");
        if (vtxt.indexOf(".") < 0) {
            obj.val(ltxt + ".");
        } else {
            var tm = vtxt.substring(vtxt.indexOf("."));
            obj.val(tm.length < 3 ? vtxt + "." : ltxt);
        }
    }, 200);
    //当短信发送后，倒计时数秒
    setInterval(_mobi_smsSendWaiting, 1000);
    //是否同意注册协议
    $("input[name=cbAgree]").click(function () {
        var agree = $(this).get(0).checked;
        if (agree) {
            $("#btnSubmit").removeClass("disabled").removeAttr("disabled");
        }
        else {
            $("#btnSubmit").addClass("disabled").attr("disabled", "disabled");
        }
    });
    if ($("input[name=cbAgree]").get(0).checked) {
        $("#btnSubmit").removeClass("disabled").removeAttr("disabled");
    }
});

/*
*
*  登录相关事件与方法
*
*/
//事件初始始化
function Event_init() {
    //注册事件
    $("form").submit(function () {
        $("input[name=cbAgree]").attr("checked", "checked");		
        try {
            var btn = $(this).find("input[type=submit][name=btnSubmit]");
            btn.attr("loading-txt", "正在注册").attr("disabled", "disabled").addClass("disabled").attr("state", "submit");
            //提交的地址
            var url = window.location.href;
            url = url.indexOf("?") > -1 ? url.substring(0, url.lastIndexOf("?")) : url;
            //异步提交注册信息
            _mobiRegister_veri($(this), url);
        } catch (e) {
            alert("error:" + e.message);
        }
        return false;
    });
    //获取验证短信
    $("#getSms").click(_mobi_smsSend);
}
//短信发送
function _mobi_smsSend() {
    if (Number($(this).attr("num")) > 0) return;
	var group=$(this).attr("group");
    if (!Verify.IsPass($(this).parents("form"), group)) return;
    var vcode = $("form input[type=text][name=tbCode]").val();
    //先验证验证码
    var vname = $("form img.verifyCode").attr("src");
    var rs = new RegExp("(^|)name=([^\&]*)(\&|$)", "gi").exec(vname), tmp;
    vname = tmp = rs ? rs[2] : "";
    var phone = $("form input[name=tbPhone]").val(); //手机号
    $("#getSms").attr("state", "waiting").text("验证中...").css("cursor", "default");
    $.post(window.location.href, { action: "getSms", vcode: vcode, vname: vname, phone: phone }, function (requestdata) {
        var data = eval("(" + requestdata + ")");
        var state = Number(data.state); //状态值
        if (Number(data.success) < 1) {
            //不成功
            if (state == 1) Verify.ShowBox($("form input[type=text][name=tbCode]"), "验证码不正确！");
            if (state == 2) Verify.ShowBox($("form input[type=text][name=tbPhone]"), "该手机号已经注册！");
            if (state == 3) {
                var txt = "短信发送失败，请与管理员联系。<br/><br/>可能原因：<br/>1、短信接口未开放，或设置不正确。<br/>2、短信账户余额不足。";
                txt += "<br/><br/>详情：" + data.desc;
                new MsgBox("发送失败", txt, 400, 250, "alert").Open();
            }
        } else {
            if (state == 0) {
                $("#getSms").attr("state", "waiting").attr("num", 60).css("cursor", "default");
                $("#getSms").attr("send", "true"); //表示已经发送过
            }
        }
    });
}
//短信发送后的等待效果
function _mobi_smsSendWaiting() {
    var obj = $("*[state=waiting]");
    if (obj.size() < 1) return;
    var num = Number(obj.attr("num"));
    var ltxt = obj.attr("waiting");
    if (num > 0) {
        obj.text(ltxt.replace("{num}", num--));
        obj.attr("num", num);
    } else {
        obj.text("获取短信");
    }
}
//注册验证
function _mobiRegister_veri(form, url) {
    //先验证验证码
    var vname = form.find("img.verifyCode").attr("src");
    var rs = new RegExp("(^|)name=([^\&]*)(\&|$)", "gi").exec(vname), tmp;
    vname = tmp = rs ? rs[2] : "";
    var phone = form.find("input[name=tbPhone]").val(); //手机号
    var pw = form.find("input[name=tbPw]").val();  	//密码
    var name = form.find("input[name=tbName]").val();  	//姓名
    var email = form.find("input[name=tbEmail]").val();  	//邮箱
    var rec = form.find("input[name=tbRec]").val();  	//推荐人的电话，由用户填写
    var recid = $().cookie("sharekeyid"); 					//推荐人的账号id，由系统自动获取
    if (recid == "") recid = $.storage("sharekeyid");
    var vcode = form.find("input[name=tbCode]").val();  	//图片验证码
    var sms = form.find("input[name=tbSms]").val(); //用户填写的短信验证码
    //提交到服务器
    $.post(url, { action: "mobiregister",
        vcode: vcode, vname: vname,
        phone: phone, pw: pw, name: name,
        email: email, rec: rec, recid: recid,
        sms: sms
    },
	function (requestdata) {
	    var data = eval("(" + requestdata + ")");
	    var state = Number(data.state); //状态值
	    if (Number(data.success) < 1) {
	        if (state == 1) Verify.ShowBox($("form input[type=text][name=tbCode]"), "验证码不正确！");
	        if (state == 2) Verify.ShowBox($("form input[type=text][name=tbPhone]"), "该手机号已经被注册！");
	        if (state == 3) Verify.ShowBox($("form input[type=text][name=tbSms]"), "短信证码错误！");
	        form.find("img.verifyCode").click();
	        var btn = form.find("input[type=submit][name=btnSubmit]");
	        btn.val("同意协议并注册").removeAttr("disabled", "disabled").removeClass("disabled").attr("state", "");
	    } else {
	        $().cookie("sharekeyid", data.acid);
	        $.storage("sharekeyid", data.acid);
	        var txt = "亲爱的 <b>" + data.name + "</b>，您已经成功注册。";
	        if (state == 0) txt += "请等待审核。";
	        txt += "<br/><br/>将在<second>5</second>秒后将返回来源页。";
	        var msg = new MsgBox("注册成功", txt, 400, 200, "msg");
	        msg.ShowCloseBtn = false;
	        msg.ShowCloseBtn = false;
	        MsgBox.OverEvent = function () {
	            var href = form.find("input[name=from]").val();
	            window.location.href = $().setPara(href, "sharekeyid", data.acid);
	        };
	        msg.Open();
	    }
	});
}