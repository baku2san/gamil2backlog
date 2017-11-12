// readProperty PropertiesServiceのこと。DefaultをScriptとして、Userを利用する為の関数でWrapしてる

function addCommentFromSentFileToRohm() {  
  var baseUrl = readProperty("baseUrl");
  var apiKey = "?apiKey=" + readProperty("apiKey");
  var postAttachementFile = "/api/v2/space/attachment" ;
  var postUrl = baseUrl + postAttachementFile + apiKey;
  // OK : postUrl = baseUrl + "/api/v2/space" + apiKey;
    // After日生成
  var labelOfToBacklog = "addedToBacklogFile";
  var conditionLabel = " -label:" + labelOfToBacklog
  
  var targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - 7);
  var formattedDate = Utilities.formatDate(targetDate, "GMT", "yyyy/MM/dd");
  var query = "to:(*@lsi.rohm.co.jp)" + conditionLabel + " after:" + formattedDate;

  var mails = GmailApp.search( query );
  var addedLabel = GmailApp.createLabel( labelOfToBacklog );
  for (var count = 0; count < mails.length; count++){
    var mail = mails[count];    
    var subject = mail.getFirstMessageSubject();
    var firstMessage = mail.getMessages()[0];// Threadの最初のメッセージに付加したファイルだけを処理する
    var attachements = firstMessage.getAttachments();
    for (var attachIndex = 0; attachIndex < attachements.length; attachIndex++){
      var attachment = attachements[attachIndex]; // as GmailAttachment
//      var resumeBlob = Utilities.newBlob(attachment, "application/excel", attachment.getName());
      // Blob でも、ContentType指定してやれば動いたんだけど、結局Unzip出来ないんで諦めかなぁ・・
      
      var formData = {
        'file': attachment,
      };
      var options = {        
        'method' : 'post',
        'payload' : formData
      };
      var result = JSON.parse(UrlFetchApp.fetch(postUrl, options));
      Logger.log(addComment(baseUrl, apiKey, result.id));
    }
    
    // 処理完了Label付加
    mail.addLabel(addedLabel);
  }
 // Browser.msgBox(mails[0].getLabels()[0].getName());
}

function addComment(baseUrl, apiKey, attachmentFileId){  
  var postAttachementFile = "/api/v2/issues/9065148/comments" ;
  var postUrl = baseUrl + postAttachementFile + apiKey  ;
    
  var headers= {
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  var params = {
    'content' : 'added by GAS.',
    'attachmentId[0]' : attachmentFileId,
  }
  var options =
      {
        'method' : 'post',
        'contentType': 'application/x-www-form-urlencoded',
        'payload' : params,
      };
  
  return UrlFetchApp.fetch(postUrl, options);
//  var result = JSON.parse(UrlFetchApp.fetch('http://httpbin.org/post', options).getContentText());
//  Logger.log(result);
}

function getProjectsList(){  
  var baseUrl = readProperty("baseUrl");
  var apiKey = "?apiKey=" + readProperty("apiKey");
  var postAttachementFile = "/api/v2/projects" ;
  var postUrl = baseUrl + postAttachementFile + apiKey;
    
  Browser.msgBox(UrlFetchApp.fetch(postUrl));

}
// 質問の課題ID取得してみた
function getIssue(){  
  var baseUrl = readProperty("baseUrl");
  var apiKey = "?apiKey=" + readProperty("apiKey");
  var postAttachementFile = "/api/v2/issues/9065148" ;
  var postUrl = baseUrl + postAttachementFile + apiKey ;
    
  Browser.msgBox(UrlFetchApp.fetch(postUrl));
//  var result = JSON.parse(UrlFetchApp.fetch('http://httpbin.org/post', options).getContentText());
//  Logger.log(result);
}
function getIssueList(){  
  var baseUrl = readProperty("baseUrl");
  var apiKey = "?apiKey=" + readProperty("apiKey");
  var params = "&projectId[]=89738";
  var postAttachementFile = "/api/v2/issues" ;
  var postUrl = baseUrl + postAttachementFile + apiKey + params;
  
  
  Browser.msgBox(UrlFetchApp.fetch(postUrl));
//  var result = JSON.parse(UrlFetchApp.fetch('http://httpbin.org/post', options).getContentText());
//  Logger.log(result);
}
function getSharedFileList(){  
  var baseUrl = readProperty("baseUrl");
  var apiKey = "?apiKey=" + readProperty("apiKey");
  var postAttachementFile = "/api/v2/projects/89738/files" ;
  var postUrl = baseUrl + postAttachementFile + apiKey;
  
  
  Browser.msgBox(UrlFetchApp.fetch(postUrl));
//  var result = JSON.parse(UrlFetchApp.fetch('http://httpbin.org/post', options).getContentText());
//  Logger.log(result);
}

function getWikiList(){  
  var baseUrl = readProperty("baseUrl");
  var apiKey = "?apiKey=" + readProperty("apiKey");
  var params = "&projectIdOrKey=89738";
  var postAttachementFile = "/api/v2/wikis" ;
  var postUrl = baseUrl + postAttachementFile + apiKey + params;
  
  
  Browser.msgBox(UrlFetchApp.fetch(postUrl));
//  var result = JSON.parse(UrlFetchApp.fetch('http://httpbin.org/post', options).getContentText());
//  Logger.log(result);
}
function getMail(){
    var sheet = SpreadsheetApp.getActiveSheet();
    var thds = GmailApp.getInboxThreads();
    var row = 1;
    for(var n in thds){
        var thd = thds[n];
        sheet.getRange(row++,1).setValue(thd.getMessageCount());
        var msgs = thd.getMessages();
        for(m in msgs){
            var msg = msgs[m];
            var from = msg.getFrom();
            var to = msg.getTo();
            var date = msg.getDate();
            var subject = msg.getSubject();
            var body = msg.getBody();
            sheet.getRange(row,1).setValue(date);
            sheet.getRange(row,2).setValue(from);
            sheet.getRange(row,3).setValue(to);
            sheet.getRange(row,4).setValue(subject);
            //sheet.getRange(row,5).setValue(body); // カット!
            row++;
        }
    }
}
