var fs = require('fs')
        , pg = require("pg")
        , path = require("path")
//        , conString = "postgres://dunglexuan:@localhost:5432/muabancz"
        , im = require('imagemagick');
;

var conString = process.env.DATABASE_URL;

exports.uploadImage = function(req, res, next) {
    fs.exists(path.join(__dirname, '../public') + "/uploads/fullsize/" + "/" + req.session.goodId,
            function(exists) {
                if (!exists) {
                    fs.mkdir(path.join(__dirname, '../public') + "/uploads/fullsize/" + req.session.goodId, 0777,
                            function(err, data) {
                                if (err)
                                    console.log(err);

                            });
                    fs.mkdir(path.join(__dirname, '../public') + "/uploads/thumbnails/" + req.session.goodId, 0777,
                            function(err, data) {
                                if (err)
                                    console.log(err);

                            });
                }
            });
    fs.readFile(req.files.file.path, function(err, data) {
        var imageName = req.files.file.name;

        /// If there's an error
        if (!imageName) {

            console.log("There was an error")
            res.send('No files');
            res.end();

        } else {

            var newPath = path.join(__dirname, '../public') + "/uploads/fullsize/" + req.session.goodId + "/" + imageName;
            var thumbPath = path.join(__dirname, '../public') + "/uploads/thumbnails/" + req.session.goodId + "/" + imageName;

            pg.connect(conString, function(err, client, done) {
                client.query("INSERT INTO Images (title, state, id_Goods) \n\
                                VALUES ('" + imageName + "',1," + req.session.goodId + ")",
                        function(err, result) {
                            done();
                            if (err)
                                console.log(err);
                        })
            });
            /// write file to uploads/fullsize folder
            fs.writeFile(newPath, data, function(err) {
                if (err)
                    console.log(err);
                /// let's see it
                var answer = {answer: 'File transfer completed'};

                im.resize({
                    srcPath: newPath,
                    dstPath: thumbPath,
                    height: 200
                }, function(err, stdout, stderr) {
                    if (err)
                        console.log("error");
                    console.log('resized image to fit within 200x200px');
                });
                res.send(answer);

            });



        }
    });
}

