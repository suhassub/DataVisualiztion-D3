# Create your views here.

from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, get_object_or_404
import pdb
import urllib
import json
from django.utils.safestring import SafeString
import csv

def home(request):
	return render(request, 'D3/home.html', {})

def d3_visual(request):
	url = "http://localhost:8983/solr/collection1/select?q=*&rows=500&wt=json&indent=true"
	response = urllib.urlopen(url);
	data = json.loads(response.read())

	#print json.dumps(data['response'], indent=4)
	
	response = data["response"]
	docs = response["docs"]
	
	pie_dict = {}
	d3_data = []
	for each in docs:
		if "title" not in each:
			continue
		d3_data += [{'id':each["id"], 'title':each["title"][0], 'content_type':each["content_type"][0], 'content_length':len(each["content"][0])}]
		if each["content_type"][0] in pie_dict:
			pie_dict[each["content_type"][0]] += 1
		else:
			pie_dict[each["content_type"][0]] = 1

	# creating pie chart file
	f = open("./D3/static/D3/pie.csv","w")
	f.write("age,population\n")
	for each in pie_dict:
		f.write(str(each) + "," + str(pie_dict[each]) + "\n")
	f.close()

	# Creating bar chart file
	f = open("./D3/static/D3/bar.tsv","w")
	f.write("letter,frequency\n")
	i = 0
	for each in docs:
		if i>100:
			break
		i += 1
		f.write( "File" + str(i) + "," + str(len(each["content"][0])) + "\n")
	f.close()

	return HttpResponse(json.dumps({"d3_data":d3_data}), content_type="application/json")

def banana_visual(request):
	return render(request, 'D3/banana_visual.html', {})

def facetview_visual(request):
	return render(request, 'D3/facetview_visual.html', {})
