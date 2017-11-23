function doGet1(e) {
  var params = JSON.stringify(e);
  return HtmlService.createHtmlOutput(params);
}
function openDialoga() {
  var html = HtmlService.createTemplateFromFile('Index');
  html.data = getProjectsList();
  html.evaluate();
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .showModalDialog(html, 'Dialog title');
}
// Use this code for Google Docs, Forms, or new Sheets.
function onOpena() {
  Browser.msgBox(openDialog());
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .createMenu('Dialog')
      .addItem('Open', 'openDialog')
      .addToUi();
}

function openDialog() {
  var html = HtmlService.createHtmlOutputFromFile('Index');
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .showModalDialog(html, 'Dialog title');
}

// http://libro.tuyano.com/index3?id=655001&page=7
// Rohm 宛に送信したメールの中で、Threadの最初のメッセージに付加されたファイルをコメントとしてBacklogの「質問＆・・」に追加する
// 課題）
// Unzip：GASでunzip がPassword非対応。あと、毎回手動でつけちゃうPasswordを勝手に解除するとなると決められたルールにする必要があって失敗しそうなんで、やめ
// 「未設定」って文字＠Backlog：不明・・
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

// 質問の課題ID取得してみた
function getIssue(){  
  var baseUrl = readProperty("baseUrl");
  var apiKey = "?apiKey=" + readProperty("apiKey");
  var apiName = "/api/v2/issues/9065148" ;
  var postUrl = baseUrl + apiName + apiKey ;
    
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

// Use this code for Google Docs, Forms, or new Sheets.
function onOpen() {
  FormApp.getUi() // Or DocumentApp or FormApp.
      .createMenu('Dialog')
      .addItem('Open', 'openDialog')
      .addToUi();
}

function openDialog() {
  var html = HtmlService.createHtmlOutputFromFile('Index');
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .showModalDialog(html, 'Dialog title');
}

function doGet(e) {
  t = HtmlService.createTemplateFromFile('Index.html');
  t.title = 'Gmail to Backlog settings';
  t.data =getProjectsList();
  return t.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
}
function getEmail(){
  return "hoge";
}
function doSomething() {
  setDefaultProperties();
  Logger.log('I was called!');
}

function testInclude(){
  var inc = include('css');
  return inc;
}
function include(filename) {
  Logger.log(filename);
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


function getWikis(projectId){  
  var baseUrl = readProperty("baseUrl");
  var apiKey = "?apiKey=" + readProperty("apiKey");
  var params = "&projectIdOrKey=" + projectId;
  var apiName = "/api/v2/wikis" ;
  var postUrl = baseUrl + apiName + apiKey + params;
  
  var result = JSON.parse(UrlFetchApp.fetch(postUrl));
  Logger.log(result);
  return result
}
function getIssues(projectId){  
  var count = "&count=" + 10;
  var baseUrl = readProperty("baseUrl");
  var apiKey = "?apiKey=" + readProperty("apiKey");
  var params = "&sort=updated&projectId[]=" + projectId + "&count=" + 10;
  var apiName = "/api/v2/issues" ;
  var postUrl = baseUrl + apiName + apiKey + params;

  return JSON.parse(UrlFetchApp.fetch(postUrl));
//  var result = JSON.parse(UrlFetchApp.fetch(postUrl));
//  Logger.log(result);
//  return result
}

function getProjectsList(){  
  var baseUrl = readProperty("baseUrl");
  var apiKey = "?apiKey=" + readProperty("apiKey");
  var apiName = "/api/v2/projects" ;
  var postUrl = baseUrl + apiName + apiKey;
  return (UrlFetchApp.fetch(postUrl));
}