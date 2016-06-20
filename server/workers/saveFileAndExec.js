//var exec = Meteor.npmRequire('child_process').exec;
//// used for writing code into file
//var fs = Meteor.npmRequire('fs');
//// for the path of the files
//var path = Meteor.npmRequire('path');
//var base = path.resolve('.').split('.meteor')[0];
//// for the path of BLAST (build.xml)
//var pathBLAST = "/Users/andreiafariacarvalho/Downloads/blast-src/build.xml";
//// name of the files where code and its related data is saved
//var nameFileTemp = "temp_file.txt";
//var nameFileJava;
//
//function saveFileAndExec(job, cb) {
//    var dir = path.join(base,"public/");
//    // save the new Java source code
//    var newSourceCode = job.data.code;
//    // save new source code in nameFileTemp
//    var pathFileTemp = path.join(dir, nameFileTemp);
//    fs.writeFileSync(pathFileTemp, newSourceCode, 'utf8');
//    console.log("new version source code saved (temp file)");
//    // discover the name of the class written in the new source code
//    var nameJavaFile = getNameClassJava(pathFileTemp);
//    if(nameJavaFile == "") {
//        //job.done();
//        //cb();
//        return;
//    } else {
//        nameFileJava = "" + nameJavaFile + ".java";
//    }
//    // write new source code into its correspondent Java file
//    var pathNewFileJava = path.join(dir, nameFileJava);
//    var oldSourceCode = fs.readFileSync(pathNewFileJava, 'utf8');
//    fs.writeFileSync(pathNewFileJava, newSourceCode, 'utf8');
//    // compile the new source code
//    exec('javac -g ' + pathNewFileJava, Meteor.bindEnvironment(function(err, stdout, stderr) {
//        if(err) {
//            fs.writeFileSync(pathNewFileJava, oldSourceCode, 'utf8'); // in case it is an overwritten of an old code
//            console.log("ERROR: problem on compiling the source code");
//            console.log("stderr - " + stderr);
//            job.fail("Error creating Java file: " + stderr, { fatal: true });
//            //job.done();
//            //cb();
//            //return;
//        }
//        exec("ant -f " + pathBLAST + " run-external-app -Dapp=" + dir + " -Dcp=" + dir + " -Dmain=" + nameJavaFile + " -Danalyzer=ch.usi.inf.sape.tracer.analyzer.BlasterModelGenerator", Meteor.bindEnvironment(function(err, stdout, stderr) {
//            if(err) {
//                console.log("stderr - " + stderr);
//                return;
//            }
//            console.log("DONE!!!");
//            job.done("Done!");
//            cb();
//            //return;
//        }));
//    }));
//}
//
//function getNameClassJava(pathFile) {
//    // read input file
//    var data = fs.readFileSync(pathFile, 'utf8');
//    // split and get line by line without "\n" and "\t"
//    var line = data.split("\n");
//    var lines = [];
//    for(var i = 0; i < line.length; i++) {
//        if(line[i] != '') {
//            var l = line[i].split("\t");
//            for(var j = 0; j < l.length; j++) {
//                if(l[j] != '') {
//                    lines.push(l[j]);
//                }
//            }
//        }
//    }
//    // get name of Java class
//    for(var index = 0; index < lines.length; index++) {
//        var tokens = lines[index].split(" ");
//        if(tokens.length >= 3) {
//            if(tokens[0] == "public") {
//                if(tokens[1] == "class") {
//                    return tokens[2];
//                }
//            }
//        }
//    }
//    return "";
//}
//
//var queue = Jobs.processJobs('saveFileAndExec', { concurrency: 2, prefetch: 2, pollInterval: 1000000000 }, saveFileAndExec);
//
//Jobs.find({ type: 'saveFileAndExec', status: 'ready' }).observe({
//  added: function(doc) {
//    console.log("detected the addition of a new 'saveFileAndExec' job");
//    queue.trigger();
//  }
//});
