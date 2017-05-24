/**
 * [简单的富文本编辑器]
 * @param  {[String]} iframeName [iframe的id]
 * @param  {[object]} options  [iframe 编辑区的初始样式]
 * @author linjian
 */
function lmsEditor(iframeName, options) {
    if (window.frames[iframeName] === undefined) { //判断是否是 iframe
        myApp.alert("请使用iframe标签");
        return false;
    } else {
        window.frames[iframeName].document.designMode = "On"; //设置iframe为可编辑模式
    }

    var myEditor = window.frames[iframeName];
    var lp = lmsEditor.prototype;


    lp.init = function(opt) { //初始化
        var opt = (typeof opt === 'object') ? opt : {};
        var height = opt.hasOwnProperty('height') ? opt.height : '100px';
        var width = opt.hasOwnProperty('width') ? opt.width : '200px';
        var fontFamily = opt.hasOwnProperty('fontFamily') ? opt.fontFamily : '微软雅黑';
        var fontSize = opt.hasOwnProperty('fontSize') ? opt.fontSize : '17px';
        var fontColor = opt.hasOwnProperty('fontColor') ? opt.fontColor : 'black';
        document.getElementById(iframeName).style.height = height;
        document.getElementById(iframeName).style.width = width;
        var s = '<body style="font-family:' + fontFamily + ';font-size:' + fontSize + ';color:' + fontColor + ';word-wrap:break-word;"></body>'; //word-wrap:break-word 自动换行
        myEditor.document.open();
        myEditor.document.write(s);
        myEditor.document.close();
    };
    this.init(options);
    //插入图片
    lp.insertImg = function(img, width, height) {
        if (!img || img.tagName !== 'IMG') {
            myApp.alert("传入的不是 IMG 类型的参数");
            return false;
        }
        var reg = new RegExp("^[1-9][0-9]*$");
        var ph = reg.test(height) ? height : 60;
        var pw = reg.test(width) ? width : 60;
        var html = '<img id="iframePic" src="' + img.src + '" height="' + ph + '" width="' + pw + '"><br/>'; //插入的内容(html)
        if (myEditor.document.getElementById('iframePic') != undefined) {
            myApp.alert("只能插入一张图片");
        } else {
            var Editor = document.getElementById(iframeName); //firefox要通过这种方式获取节点才行
            Editor.focus();
            var rng = Editor.contentWindow.getSelection().getRangeAt(0);
            var frg = rng.createContextualFragment(html);
            rng.insertNode(frg);
        }

        //点击图片浏览
        myEditor.document.getElementById('iframePic').onclick = function() {
            var photo = [];
            $(this).each(function() {
                photo.push($(this).attr('src'));
            });
            myPhotoBrowserPopup(photo);
        }
    };
    // 插入视频,目前支持 腾讯，优酷，土豆；但是ios上好像优酷和土豆播放不了
    lp.insertVid = function(url, width, height) {
        if (!getVideoComUrl(url)) {
            return false;
        } else {
            var videoUrl = getVideoComUrl(url);
            var reg = new RegExp("^[1-9][0-9]*$");
            var ph = reg.test(height) ? height : 60;
            var pw = reg.test(width) ? width : 60;
            var html = '<img id="iframeVid" src="img/images/iframeVid.png" videoSrc="' + videoUrl + '" height="' + ph + '" width="' + pw + '">'; //插入的内容(html)
            if (myEditor.document.getElementById('iframeVid') != undefined) {
                myApp.alert("只能插入一个视频");
            } else {
                var Editor = document.getElementById(iframeName); //firefox要通过这种方式获取节点才行
                Editor.focus();
                var rng = Editor.contentWindow.getSelection().getRangeAt(0);
                var frg = rng.createContextualFragment(html);
                rng.insertNode(frg);
            }
        }
        //点击视频播放
        myEditor.document.getElementById('iframeVid').onclick = function() {
            var videoSrc = myEditor.document.getElementById('iframeVid').getAttribute("videoSrc"); //获取视频地址
            var photo = [];
            photo = [{
                    html: '<iframe style="height: 80%;" src="' + videoSrc + '" frameborder="0" allowfullscreen="true"></iframe>'
                }]
                // jsonp('*.youku.com');
            myPhotoBrowserPopup(photo);
        }
    }
    lp.getAllText = function() { //获取富文本框里的文本
        var text = myEditor.document.body.innerText;
        return text;
    }
}
/**
 * [获取腾讯和优酷通用的Video Url]、
 * @param  {[String]} url [该视频的播放地址]
 * @param  {[String]} VideoUrl [通用的播放地址]
 * @author linjian    建议使用后台curl处理
 */
function getVideoComUrl(url) {
    //区分优酷 和 腾讯，优酷的都是一样的，腾讯的有几种情况
    var urlResult = url; //能播放视频的url
    var urlReg = new RegExp(url);
    if (new RegExp("v.qq.com").test(url)) { //腾讯
        if (url.indexOf("?vid=") > -1) { //找不到直接返回输入的url
            //第一次截取
            var videoIdStart = url.indexOf("?vid=");
            //var videoIdEnd = url.indexOf(".html");
            var videoId = url.substr(videoIdStart + 5, 11);
            //第二次截取
            //            if (new RegExp("==").test(videoId)) {//如果ID 中含有“==”
            //                var videoIdEnd = videoId.indexOf("==");
            //                var videoId = videoId.substring(0, videoIdEnd + 2);
            //            }
            urlResult = "http://v.qq.com/iframe/player.html?vid=" + videoId + "&tiny=0&auto=0";
            return urlResult;
        } else {
            var videoIdEnd = url.indexOf(".html");
            if (url.substr(videoIdEnd - 12, 1) === "/") { //url为 xxx.xxx.com/xx/xx/[videoId].html
                var videoId = url.substring(videoIdEnd - 11, videoIdEnd);
                urlResult = "http://v.qq.com/iframe/player.html?vid=" + videoId + "&tiny=0&auto=0";
            }
            return urlResult; //以上条件都不符合，返回输入的url
        }

    } else if (new RegExp("v.youku.com").test(url) || new RegExp("player.youku.com").test(url)) { //优酷
        if (url.indexOf("/id_") > -1) { //找不到直接返回输入的url
            //第一次截取
            var videoIdStart = url.indexOf("/id_");
            var videoIdEnd = url.indexOf(".html");
            var videoId = url.substring(videoIdStart + 4, videoIdEnd);
            //第二次截取
            if (new RegExp("==").test(videoId)) { //如果ID 中含有“==”
                var videoIdEnd = videoId.indexOf("==");
                var videoId = videoId.substring(0, videoIdEnd + 2);
            }
            urlResult = "http://player.youku.com/embed/" + videoId;
            return urlResult;
        }
        return urlResult;
    } else {
        myApp.alert("输入的不是有效的视频地址");
        return false;
    }
}
