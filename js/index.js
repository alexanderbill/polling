var io_connect = function (detail, onSuccess, onError) {
  if ('undefined' != typeof XDomainRequest) {
    var requestToken = new XDomainRequest();
    requestToken.onload = requestToken.onerror = function() {
      try {
        var token = $.parseJSON(requestToken.responseText);
        var poll = function(token) {
          var p = new XDomainRequest();
          p.onload = p.onerror = function() {
            poll(token);
            onSuccess(p.responseText);
          }
          p.open('POST', "http://vchat.9961.cn:8000/poll", true);
          p.send("token=" + token); 
        };
        poll(token.token);
      } catch (e) {
        onError("Poll失败");
        io_connect(detail, onSuccess, onError);
      }
    };
    requestToken.open('POST', "http://vchat.9961.cn:8000/create", true);
    requestToken.send("sid=" + detail.uuid); 
    return;
  }
  $.ajax({
    url: "http://vchat.9961.cn:8000/create",
    data: 'sid=' + detail.uuid,
    type: 'post',
    success: function(data) {
      try {
        var token = $.parseJSON(data);
        if (token && token.token) {
          var poll = function(token) {
            $.ajax({
              url: "http://vchat.9961.cn:8000/poll",
              data: 'token=' + token,
              type: 'post',
              success: function(result) {
                onSuccess(result);
                poll(token);
              },
              error: function(result) {
                io_connect(detail, onSuccess, onError);
                onError("Poll失败");
              }
            });
          };
          poll(token.token);
        }
      } catch (e) {
        onError("Poll失败");
      }
    },
    error: function(e) {
      onError("创建token失败");
    }
  });
}
