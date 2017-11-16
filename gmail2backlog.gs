function setDefaultProperties(){
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty("baseUrl", 'https://jmtech.backlog.jp');
  scriptProperties.setProperty("apiKey", 'Fo23qZF9ZpO0EqriRvn6Y354ZWYBOjEvJpdzjtIHTJJMcd4Hg4VvBgDgP61cUStU');
  scriptProperties.setProperty("test", 'test');
}
function deleteUserKeys(){
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteAllProperties();
}

function test(){
  Logger.log(readProperty("apiKey"));
}
function readProperty(key){
  var userProperties = PropertiesService.getUserProperties();
  var value = userProperties.getProperty(key)
  if (value == null){
    var scriptProperties = PropertiesService.getScriptProperties();
    value = scriptProperties.getProperty(key)
    userProperties.setProperty(key, value);
    value = value + " sc";
  }
  return value;
}
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

function getProjectsList(){  
  var baseUrl = readProperty("baseUrl");
  var apiKey = "?apiKey=" + readProperty("apiKey");
  var postAttachementFile = "/api/v2/projects" ;
  var postUrl = baseUrl + postAttachementFile + apiKey;
  return (UrlFetchApp.fetch(postUrl));
/*
 [{"id":58072,"projectKey":"ENA_Z","name":"学究社（JMT内部管理用）","chartEnabled":true,"subtaskingEnabled":true,"projectLeaderCanEditProjectLeader":false,"useWikiTreeView":true,"textFormattingRule":"backlog","archived":false,"displayOrder":30},
  {"id":86532,"projectKey":"JMTTS000003","name":"TG1（AI&IoT）プロジェクト管理","chartEnabled":true,"subtaskingEnabled":true,"projectLeaderCanEditProjectLeader":false,"useWikiTreeView":true,"textFormattingRule":"backlog","archived":false,"displayOrder":2147483646},
  {"id":89738,"projectKey":"IT24B113000","name":"ローム京都_CMPロガー開発","chartEnabled":true,"subtaskingEnabled":true,"projectLeaderCanEditProjectLeader":true,"useWikiTreeView":true,"textFormattingRule":"backlog","archived":false,"displayOrder":2147483646}]
  */
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
function doGet_OldUiApp() {
  var data = Charts.newDataTable()
      .addColumn(Charts.ColumnType.STRING, "Name")
      .addColumn(Charts.ColumnType.STRING, "Gender")
      .addColumn(Charts.ColumnType.NUMBER, "Age")
      .addColumn(Charts.ColumnType.NUMBER, "Donuts eaten")
      .addRow(["Michael", "Male", 12, 5])
      .addRow(["Elisa", "Female", 20, 7])
      .addRow(["Robert", "Male", 7, 3])
      .addRow(["John", "Male", 54, 2])
      .addRow(["Jessica", "Female", 22, 6])
      .addRow(["Aaron", "Male", 3, 1])
      .addRow(["Margareth", "Female", 42, 8])
      .addRow(["Miranda", "Female", 33, 6])
      .build();
  
   var ageFilter = Charts.newNumberRangeFilter()
      .setFilterColumnLabel("Age")
      .build();

  var genderFilter = Charts.newCategoryFilter()
      .setFilterColumnLabel("Gender")
      .build();

  var pieChart = Charts.newPieChart()
      .setDataViewDefinition(Charts.newDataViewDefinition()
                            .setColumns([0, 3]))
      .build();

  var tableChart = Charts.newTableChart()
      .build();
  
   var dashboard = Charts.newDashboardPanel()
      .setDataTable(data)
      .bind([ageFilter, genderFilter], [pieChart, tableChart])
      .build();

    var uiApp = UiApp.createApplication();

  dashboard.add(uiApp.createVerticalPanel()
                .add(uiApp.createHorizontalPanel()
                    .add(ageFilter).add(genderFilter)
                    .setSpacing(70))
                .add(uiApp.createHorizontalPanel()
                    .add(pieChart).add(tableChart)
                    .setSpacing(10)));

  uiApp.add(dashboard);
  return uiApp;
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
  t.data =(getProjectsList());
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