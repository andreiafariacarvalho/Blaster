var Future = Npm.require("fibers/future");
var exec = Meteor.npmRequire('child_process').exec;
// used for writing code into file
var fs = Meteor.npmRequire('fs');
// for the path of the files
var path = Meteor.npmRequire('path');
var base = path.resolve('.').split('.meteor')[0];
// for the path of BLAST (build.xml)
var pathBLAST = "/Users/andreiafariacarvalho/Downloads/blast-src/build.xml";
// name of the files where code and its related data is saved
var nameFileTemp = "temp_file.txt";
var nameFileJava;

Meteor.methods({
  'saveFile': function(sourceCode) {
    var dir = path.join(base,"public/");
    // save the new Java source code
    var newSourceCode = sourceCode;
    // save new source code in nameFileTemp
    var pathFileTemp = path.join(dir, nameFileTemp);
    fs.writeFileSync(pathFileTemp, newSourceCode, 'utf8');
    console.log("new version source code saved (temp file)");
    // discover the name of the class written in the new source code
    var nameJavaFile = getNameClassJava(pathFileTemp);
    if(nameJavaFile == "") {
      throw new Meteor.Error(500, "Error in reading the name class of the new source code!");
    } else {
      nameFileJava = "" + nameJavaFile + ".java";
    }
    // write new source code into its correspondent Java file
    var pathNewFileJava = path.join(dir, nameFileJava);
    var isNewFile = false; var oldSourceCode;
    if(!fs.existsSync(pathNewFileJava)) {
      isNewFile = true;
    } else {
      oldSourceCode = fs.readFileSync(pathNewFileJava, 'utf8');
    }
    fs.writeFileSync(pathNewFileJava, newSourceCode, 'utf8');
    // compile the new source code
    var future = new Future();
    exec('javac -g ' + pathNewFileJava, Meteor.bindEnvironment(function(err1, stdout, stderr) {
      if(err1) {
        if(isNewFile) { // in case it is an overwritten of an old code
          fs.writeFileSync(pathNewFileJava, "", 'utf8');
        } else {
          fs.writeFileSync(pathNewFileJava, oldSourceCode, 'utf8');
        }
        console.log("ERROR: problem on compiling the source code");
        console.log("stderr1 - " + stderr);
        //throw new Meteor.Error(500, "failed: " + stderr);
        future.return(stderr);
      } else {
        exec("ant -f " + pathBLAST + " run-external-app -Dapp=" + dir + " -Dcp=" + dir + " -Dmain=" + nameJavaFile + " -Danalyzer=ch.usi.inf.sape.tracer.analyzer.BlasterModelGenerator", Meteor.bindEnvironment(function(err2, stdout, stderr) {
          if(err2) {
            console.log("OOppss! An error occured while trying to launch BLAST!")
            console.log("stderr - " + stderr);
            //throw new Meteor.Error(500, "failed: " + stderr);
            future.return(stderr);
          }
          console.log("DONE!!!");
          //console.log(stdout);
          //return stdout;
          future.return("OK");
        }));
      }
    }));
    return future.wait();
  }
});

function getNameClassJava(pathFile) {
  // read input file
  var data = fs.readFileSync(pathFile, 'utf8');
  // split and get line by line without "\n" and "\t"
  var line = data.split("\n");
  var lines = [];
  for(var i = 0; i < line.length; i++) {
    if(line[i] != '') {
      var l = line[i].split("\t");
      for(var j = 0; j < l.length; j++) {
        if(l[j] != '') {
          lines.push(l[j]);
        }
      }
    }
  }
  // get name of Java class
  for(var index = 0; index < lines.length; index++) {
    var tokens = lines[index].split(" ");
    if(tokens.length >= 3) {
      if(tokens[0] == "public") {
        if(tokens[1] == "class") {
          return tokens[2];
        }
      }
    }
  }
  return "";
}

//Meteor.methods({
//  saveFile: function(sourceCode) {
//    console.log("saveFile() method called");
//    var job = new Job(Jobs, 'saveFileAndExec', {
//      ownerId: Meteor.userId(),
//      code: sourceCode
//    });
//    //console.log("----------------------------------");
//    //console.log(job);
//    if(jobId = job.priority('normal').delay(0).retry({ wait: 20000, retries: 5 }).save()) {
//      //console.log("----------------------------------*");
//      //console.log(job);
//      console.log("created a 'saveFileAndExec' job");
//      console.log(job.result);
//      return job.result;
//    } else {
//      console.log("failed to create a 'saveFileAndExec' job");
//    }
//  }
//});

