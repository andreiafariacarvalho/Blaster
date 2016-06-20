// This FileCollection holds all files we want to keep in our database.
// This includes the zip files uploaded by users,
// but also files that are generated on the server and that users might want to download.
//
// Note: In theory it could even include files that contain BLAST traces,
// but we probably don't want to do that.
// We probably want to store BLAST traces either in a structured way in other collections,
// or we want to keep them in memory (keep the Java application running).
Files = new FileCollection('files', {
  resumable: true,    // Enable built-in resumable.js chunked upload support
  // explicitly define the index name (chose a short name to avoid trouble):
  // see: https://github.com/vsivsi/meteor-file-collection/issues/55
  // originally, the automatically generated index name was:
  // meteor.applicationArchiveFiles.files.$metadata._Resumable.resumableIdentifier_1_metadata._Resumable.resumableChunkNumber_1_length_1
  resumableIndexName: 'filesResumableIndex',
  http: [             // Define HTTP route
    {
      method: 'get',  // Enable a GET endpoint
      path: '/md5/:md5',  // this will be at route "/gridfs/files/md5/:md5"
      lookup: function (params, query) {  // uses express style url params
        return { md5: params.md5 };       // a query mapping url to Files
      }
    }
  ]
});
