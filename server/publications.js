Meteor.publish('userFiles', function (clientUserId) {
  // This prevents a race condition on the client between Meteor.userId() and subscriptions to this publish
  // See: https://stackoverflow.com/questions/24445404/how-to-prevent-a-client-reactive-race-between-meteor-userid-and-a-subscription/24460877#24460877
  if (clientUserId === this.userId) {
    // Only publish files owned by this userId, and ignore
    // file chunks being used by Resumable.js for current uploads
    var cursor = Files.find({
      'metadata._Resumable': { $exists: false },
      'metadata.ownerId': this.userId,
    });
    console.log("publish userFiles: count()="+cursor.count());
    return cursor;
  } else {
    // This is triggered when publish is rerun with a new
    // userId before client has resubscribed with that userId
    return [];
  }
});


Meteor.publish('userJobs', function (clientUserId) {
  // This prevents a race condition on the client between Meteor.userId() and subscriptions to this publish
  // See: https://stackoverflow.com/questions/24445404/how-to-prevent-a-client-reactive-race-between-meteor-userid-and-a-subscription/24460877#24460877
  if (clientUserId === this.userId) {
    var cursor = Jobs.find({
      'data.ownerId': this.userId,
    });
    console.log("publish userJobs: count()="+cursor.count());
    return cursor;
  } else {
    // This is triggered when publish is rerun with a new
    // userId before client has resubscribed with that userId
    return [];
  }
});
