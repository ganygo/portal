function getAllUrlParams(){
  var q={}
  var queryString=window.location.search;
  var dizi=queryString.split('&');
  for(var i=0;i<dizi.length;i++){
    var key=dizi[i].split('=')[0];
    var value=getUrlParameter(key);
    if(value!=''){
      q[key]=value;
    }
  }
  return q;
}
    
                

  
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
    // var target = this;
    // return target.replace(new RegExp(search, 'g'), replacement);
}

function fnCsvReport(tableId,fileName)
{
    var tab_text="";
    var textRange; 
    tab = document.getElementById(tableId); // id of table

    for(var i = 0 ; i < tab.rows.length ; i++) 
    {   
        var filterRow=false;
        if(i==1){
          if(tab.rows[i].innerHTML.indexOf('<th')>-1 && tab.rows[i].innerHTML.indexOf('</th')>-1) filterRow=true;
        }
        if(!filterRow){
          
          for(var j=0;j<tab.rows[i].cells.length;j++){
            if(j<tab.rows[0].cells.length-1){
              if(isNumeric(tab.rows[i].cells[j].innerHTML)){
                var sayi=tab.rows[i].cells[j].innerHTML;
                // decimal pointer turkiye gibi virgul olanlar haricindekiler icin yapildi
                if(whatDecimalPointer()=='.'){
                  sayi=sayi.replaceAll('.','##');
                  sayi=sayi.replaceAll(',','.');
                  sayi=sayi.replaceAll('##',',');
                }
                tab_text=tab_text + (i>0?'"':'') + sayi + (i>0?'"':'') + ';';
              }else{
                tab_text=tab_text + (i>0?'"':'') + tab.rows[i].cells[j].innerHTML + (i>0?'"':'') + ';';
              }
            }
          }
          tab_text=tab_text + "\n";
        }
    }

    tab_text= tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
    tab_text= tab_text.replace(/<a[^>]*>|<\/a>/g, "");//remove if u want links in your table
    tab_text= tab_text.replace(/<img[^>]*>/gi,""); // remove if u want images in your table
    tab_text= tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params
    tab_text= tab_text.replace(/<button[^>]*>|<\/button>/gi, "");
    tab_text= tab_text.replace(/<select[^>]*>|<\/select>/gi, "");
    tab_text= tab_text.replace(/<option[^>]*>|<\/option>/gi, "");

    exportToCsv(tab_text,fileName);
    
}

function exportToCsv(table,fileName){
var htmls = "";
            var uri = 'data:application/text;base64,';
            var template = '{table}'; 
            var base64 = function(s) {
                // return window.btoa(unescape(encodeURIComponent(s)))
                return b64EncodeUnicode(s);
            };

            var format = function(s, c) {
                return s.replace(/{(\w+)}/g, function(m, p) {
                    return c[p];
                })
            };

            htmls = table;

            var ctx = {
                worksheet : 'Sayfa 1',
                table : htmls
            }


            var link = document.createElement("a");
            if(fileName==undefined){
              link.download = "export.csv";
            }else{
              link.download = fileName + ".csv";
            }
            
            link.href = uri + base64(format(template, ctx));
            link.click();
}

function fnExcelReport(tableId,fileName)
{
    var tab_text="<table border='1px'>";
    var textRange; 
    tab = document.getElementById(tableId); // id of table

    for(var i = 0 ; i < tab.rows.length ; i++) 
    {   
        var filterRow=false;
        if(i==1){
          if(tab.rows[i].innerHTML.indexOf('<th')>-1 && tab.rows[i].innerHTML.indexOf('</th')>-1) filterRow=true;
        }
        if(!filterRow){
          if(i==0){
            
            tab_text=tab_text+ '<tr bgcolor="#87AFC6">';
          }else{
            tab_text=tab_text+"<tr>";
          }
          
          for(var j=0;j<tab.rows[i].cells.length;j++){

            if(isNumeric(tab.rows[i].cells[j].innerHTML)){
              var sayi=tab.rows[i].cells[j].innerHTML;
              // decimal pointer turkiye gibi virgul olanlar haricindekiler icin yapildi
              if(whatDecimalPointer()=='.'){
                sayi=sayi.replaceAll('.','##');
                sayi=sayi.replaceAll(',','.');
                sayi=sayi.replaceAll('##',',');
              }
              tab_text=tab_text + "<td>" + sayi + "</td>";
            }else{
              tab_text=tab_text + "<td>" + tab.rows[i].cells[j].innerHTML + "</td>";
            }
          }
          //+ tab.rows[i].innerHTML
          tab_text=tab_text + "</tr>";
        }
        //tab_text=tab_text+"</tr>";
    }

    tab_text=tab_text+"</table>";
    tab_text= tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
    tab_text= tab_text.replace(/<img[^>]*>/gi,""); // remove if u want images in your table
    tab_text= tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params
    tab_text= tab_text.replace(/<button[^>]*>|<\/button>/gi, "");
    tab_text= tab_text.replace(/<select[^>]*>|<\/select>/gi, "");
    tab_text= tab_text.replace(/<option[^>]*>|<\/option>/gi, "");

    exportToExcel(tab_text,fileName);
    
}

function exportToExcel(table,fileName){
var htmls = "";
            var uri = 'data:application/vnd.ms-excel;base64,';
            var template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>{table}</body></html>'; 
            var base64 = function(s) {
                // return window.btoa(unescape(encodeURIComponent(s)))
                return b64EncodeUnicode(s);
            };

            var format = function(s, c) {
                return s.replace(/{(\w+)}/g, function(m, p) {
                    return c[p];
                })
            };

            htmls = table;

            var ctx = {
                worksheet : 'Sayfa 1',
                table : htmls
            }


            var link = document.createElement("a");
            if(fileName==undefined){
              link.download = "export.xls";
            }else{
              link.download = fileName + ".xls";
            }
            
            link.href = uri + base64(format(template, ctx));
            link.click();
}

function isNumeric(str){
  if(str.toString().trim()=='') return false;
  for(var i=0;i<str.length;i++){ 
    if(!(str[i]>='0' && str[i]<='9' || str[i]=='.' || str[i]==',')){
      return false;
    }
  }
  return true;
}
function whatDecimalPointer() {
    var n = 1.1;
    n = n.toLocaleString().substring(1, 2);
    return n;
}

function b64EncodeUnicode(str) {
    return btoa(unescape(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    })));
}