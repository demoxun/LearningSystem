﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WeiSha.Common;
using Song.ServiceInterfaces;

namespace Song.Site
{
    /// <summary>
    /// 在微信中使用时的直接登录页
    /// </summary>
    public class Weixin : BasePage
    {
        protected override void InitPageTemplate(HttpContext context)
        {
            if (!WeiSha.Common.Server.IsLocalIP) this.Document.Variables.SetValue("domain", WeiSha.Common.Request.Domain.MainName);
            //微信登录
            this.Document.SetValue("WeixinLoginIsUse", Business.Do<ISystemPara>()["WeixinLoginIsUse"].Boolean ?? false);
            this.Document.SetValue("WeixinAPPID", Business.Do<ISystemPara>()["WeixinAPPID"].String);
            this.Document.SetValue("WeixinReturl", Business.Do<ISystemPara>()["WeixinReturl"].Value ?? WeiSha.Common.Request.Domain.MainName);
        }
    }
}