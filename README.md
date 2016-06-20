# Blaster #

Blaster is a Meteor-based app based on [BLAST](http://sape.inf.usi.ch/blast).


### How do I get set up? ###

* Install [Meteor](https://www.meteor.com/)
* Clone this [Blaster git repo](https://bitbucket.org/hauswirth/blaster/)
* Change into its top-level directory (blaster)
* Download [Blast](http://sape.inf.usi.ch/blast)
* Change the path of Blast in file [blaster/server/saveFile.js]
* Run `meteor`
* Open [http://localhost:3000](http://localhost:3000) in your browser


### Idea ###

A user uploads a Java application including some test cases through this Blaster web site.
A Blaster worker runs the test cases on some server, on top of BLAST,
producing comprehensive traces of all executed bytecodes.
The user can then use the Blaster web site to query and visualize those traces.


### Packages used ###

* [twbs:bootstrap](https://atmospherejs.com/twbs/bootstrap) - [Twitter Bootstrap](http://getbootstrap.com/) for styling
* [accounts-password](https://atmospherejs.com/meteor/accounts-password) - Password-based account support
* [ian:accounts-ui-bootstrap-3](https://atmospherejs.com/ian/accounts-ui-bootstrap-3) - Accounts user interface using Bootstrap 3
* [vsivsi:file-collection](https://atmospherejs.com/vsivsi/file-collection) - File upload, download, storage
* [vsivsi:job-collection](https://atmospherejs.com/vsivsi/job-collection) - Job queue for running distributed jobs
* [benjaminrh:jquery-cookie](https://atmospherejs.com/benjaminrh/jquery-cookie) - Manipulate cookies needed for HTTP file access
* [numeral:numeral](https://atmospherejs.com/numeral/numeral) - Number formatting
* [meteorhacks:npm](https://atmospherejs.com/meteorhacks/npm) - Providing Meteor.npmRequire(), for using NPM packages (such as 'child_process')
