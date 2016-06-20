Template.registerHelper("truncateId", function(id, length) {
  //console.log("truncateId("+id+", "+length+")");
  if (!length) {
    length = 6;
  }
  if (id) {
    if (typeof id === 'object') {
      id = ""+id.valueOf();
    }
    return id.substr(0, 6);
  } else {
    return "";
  }
});
