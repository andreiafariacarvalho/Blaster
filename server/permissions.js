Files.allow({
  // The creator of a file owns it. UserId may be null.
  insert: function (userId, file) {
    console.log("Files.allow.insert("+userId+",file) where file=", file);
    // Assign the proper owner when a file is created
    file.metadata = file.metadata || {};
    file.metadata.ownerId = userId;
    return true;
  },
  // Only owners can remove a file
  remove: function (userId, file) {
    console.log("Files.allow.remove("+userId+",file) where file=", file);
    // Only owners can delete
    var permitted = (userId === file.metadata.ownerId);
    console.log("-> "+permitted);
    return permitted;
  },
  // Only owners can retrieve a file via HTTP GET
  read: function (userId, file) {
    console.log("Files.allow.read("+userId+",file) where file=", file);
    var permitted = (userId === file.metadata.ownerId);
    console.log("-> "+permitted);
    return permitted;
  },
  // This rule secures the HTTP REST interfaces' PUT/POST
  // Necessary to support Resumable.js
  write: function (userId, file, fields) {
    console.log("Files.allow.write("+userId+",file) where file=", file);
    // Only owners can upload file data
    var permitted = (userId === file.metadata.ownerId);
    console.log("-> "+permitted);
    return permitted;
  }
});

Jobs.allow({
  // Grant full permission to any authenticated user
  admin: function (userId, method, params) {
    console.log("Jobs.allow.admin("+userId+", "+method+", params) where params=", params);
    var permitted = (userId ? true : false);
    console.log("-> "+permitted);
    return permitted;
  },
});
