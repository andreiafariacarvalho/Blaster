Meteor.startup(function () {
  // Setup resumable.js in the UI

  // Prevent default drop behavior (loading a file) outside of the drop zone
  window.addEventListener('dragover', function(e) {e.preventDefault();}, false);
  window.addEventListener('drop', function(e) {e.preventDefault();}, false);

  // Note: We use one Meteor session variable for each file we're uploading.
  // The name of that variable is the unique identifier of the file.
  // The value of that variable is the upload progress percentage (0..100).

  // When a file is added
  Files.resumable.on('fileAdded', function(file) {
    console.log("fileAdded for file ", file);
    // Keep track of its progress reactively in a session variable
    Session.set(file.uniqueIdentifier, 0);
    // Create a new file in the file collection to upload to
    Files.insert({
      _id: file.uniqueIdentifier, // This is the ID resumable will use
      filename: file.fileName,
      contentType: file.file.type,
    }, function(err, _id) {
      if (err) {
        console.warn("File creation failed!", err);
        return;
      }
      // Once the file exists on the server, start uploading
      console.log("starting to upload file ", file);
      Files.resumable.upload();
    });
  });

  // Update the upload progress session variable
  Files.resumable.on('fileProgress', function(file) {
    console.log("fileProgress for file ", file);
    Session.set(file.uniqueIdentifier, Math.floor(100*file.progress()));
  });

  // Finish the upload progress in the session variable
  Files.resumable.on('fileSuccess', function(file) {
    console.log("fileSuccess for file ", file);
    Session.set(file.uniqueIdentifier, undefined);
  });

  // More robust error handling needed!
  Files.resumable.on('fileError', function(file) {
    console.log("fileError for file ", file);
    Session.set(file.uniqueIdentifier, undefined);
  });

});
