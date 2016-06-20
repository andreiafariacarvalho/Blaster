// Set up an autorun to keep the X-Auth-Token cookie up-to-date and
// to update the subscriptions when the userId changes.
Tracker.autorun(function() {
  console.log("subscription autorun executing");
  var userId = Meteor.userId();
  Meteor.subscribe('userFiles', userId);
  Meteor.subscribe('userJobs', userId);
  // $.cookie() assumes use of the "jquery-cookie" Atmosphere package.
  $.cookie('X-Auth-Token', Accounts._storedLoginToken());
});
