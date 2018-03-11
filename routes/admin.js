var express = require('express');
var bodyParser = require('body-parser');
var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');
var rd = require('rd');
var file = require('./file.js');

var urlencodedParser = bodyParser.urlencoded({
    extended: false
})
var router = express.Router();
var file = require('./file.js')
var path = require('path')


/* 登录验证，登录成功返回true */
router.post('', function (req, res) {
    var name = req.body.username;
    var password = req.body.password;
    var config = file.readPropertiesSync(path.resolve(__dirname, '../public/config/admin.properties'));
    if (name == config["user.name"] && password == config["user.pass"] ) {
        var user = {
            'username': 'love'
        };
        req.session.user = user;
        res.json({
            success: true
        });
    } else {
        res.json({
            success: false
        });
    }
});

/* 管理员页面 */
router.get('/index', function (req, res) {
    res.render(path.resolve(__dirname, '../views/admin/index.jade'));
});


/* Love Record */
/* 上传*/
router.post('/love-record/upload', function (req, res, next) {
    //生成multiparty对象，并配置上传目标路径
    var form = new multiparty.Form({
        uploadDir: './public/images/love-record/'
    });
    //上传完成后处理
    form.parse(req, function (err, fields, files) {
        var filesTmp = JSON.stringify(files, null, 2);
        if (err) {
            console.log('parse error: ' + err);
        } else {
            var inputFile = files.inputFile[0];
            var uploadedPath = inputFile.path;

            //重名为当前最大的一个数字
            var files = rd.readSync('../public/images/love-record');
            var max = 0;
            files.map(function (str) {
                var file = path.basename(str);
                //大于10位位随机文件
                if (file.length < 10) {
                    var s = file.split(".");
                    var rank = parseInt(s[0]);
                    if (!isNaN(rank)) {
                        max = Math.max(rank, max);
                    }
                }
            });
            var dstPath = '../public/images/love-record/' + (max + 1) + '.' + inputFile.originalFilename.split('.')[1];
            fs.rename(uploadedPath, dstPath, function (err) {
                if (err) {
                    console.log('rename error: ' + err);
                } else {
                    console.log('rename ok');
                }
            });
        }

        res.writeHead(200, {
            'content-type': 'text/plain;charset=utf-8'
        });
        res.write('received upload:\n\n');

        //写入says信息
        file.append(path.resolve(__dirname, '../public/config/says.txt'), fields.say[0] + '\n');
        res.end(util.inspect({
            fields: fields,
            files: filesTmp
        }));
    });
});


module.exports = router;