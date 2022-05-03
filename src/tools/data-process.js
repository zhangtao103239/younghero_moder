var dataProcess = {
  text2Dict: function (str) {
    var lines = str.split(/\n/);
    var head = lines[0].substring(1);
    var resultHeader = [];
    var resultList = [];
    head.split("\t").forEach(function (v) {
      resultHeader.push(v.trim());
    });
    // console.log(resultHeader);
    var i = 1;
    while (i < lines.length) {
      var array = lines[i].split("\t");
      var result = {};
      array.forEach(function (v, index) {
        var key = resultHeader[index];
        result[key] = v.replace(/<br>/g, " ");
      });
      resultList.push(result);
      i++;
    }
    return resultList;
  },
};

export default dataProcess;
