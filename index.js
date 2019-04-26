var fs = require('fs');
var path = require('path');
// var Parser = require('node-xml-stream-parser');
// var parser = new Parser();
var sax = require('sax');
var parser = sax.parser(false, {
	originalcase: true,
	looseNames: true,
	looseAttributes: true
});

var level = [];
var tag = null;
var errorList = [];
var astRoot = {
	name: null,
	attrs: [],
	children: []
};
var currentNode = astRoot;
var parents = [];

parser.onerror = function(e) {
	// console.error('error', e);
	errorList.push(e);
};
parser.ontext = function(t) {
	t = String(t).trim();
	var tlen = t.length;
	if (tlen) console.log('text '+tlen+' bytes');
};
parser.onopentagstart = function(node) {
	if (currentNode) {
		level.push(tag);
		parents.push(currentNode);
	}
	tag = node.name;
	currentNode = {
		name: tag,
		attrs: [],
		children: []
	};
	console.log(level.join('→')+ ' <'+tag+'>');
};
parser.onclosetag = function(nodeName) {
	console.log(level.join('→')+ ' </'+nodeName+'>');
	if (nodeName !== tag) {
		console.error('closetag error, expected '+tag+' but got '+nodeName);
	}
	level.pop();
	var llen = level.length;
	tag = llen ? level[llen - 1] : null;
};
parser.onattribute = function(attr) {
	console.log('attr '+attr.name+' = '+attr.value);
};
parser.oncomment = function(c) {
	console.log('comment '+c.length+' bytes');
};
parser.onend = function() {
	console.log('parser end');
	console.log(errorList.length+' errors');
	errorList.forEach(e => console.log(e.message));
};

// var fname = '../S2-PIR-FRONT/web/app/comp/pages/login/login.html';
var fname = './test.html';
var fpath = path.resolve(__dirname, fname);

var readable = fs.createReadStream(fpath, { encoding: 'utf8' });

readable.on('data', function(chunk) {
	parser.write(chunk);
});
readable.on('end', function() {
	console.log('finished reading '+fname);
	parser.close();
});