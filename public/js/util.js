function hrefSplit(str){
	var detailsHref=str;
	var arrStr=detailsHref.split("?")[1];
	arrStr=arrStr.split("&");
	var strJson={};
	for(var i=0;i<arrStr.length;i++){
		strJson[arrStr[i].split("=")[0]]=arrStr[i].split("=")[1];
	}
	return strJson;
}