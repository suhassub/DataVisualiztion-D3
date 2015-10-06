# Create your views here.

from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, get_object_or_404
import pdb
import urllib
import json
from django.utils.safestring import SafeString
import csv
import re

stopwords = ['null', 'a', 'about', 'above', 'across', 'after', 'again', 'against', 'all', 'almost', 'alone', 'along', 'already', 'also', 'although', 'always', 'among', 'an', 'and', 'another', 'any', 'anybody', 'anyone', 'anything', 'anywhere', 'are', 'area', 'areas', 'around', 'as', 'ask', 'asked', 'asking', 'asks', 'at', 'away', 'b', 'back', 'backed', 'backing', 'backs', 'be', 'became', 'because', 'become', 'becomes', 'been', 'before', 'began', 'behind', 'being', 'beings', 'best', 'better', 'between', 'big', 'both', 'but', 'by', 'c', 'came', 'can', 'cannot', 'case', 'cases', 'certain', 'certainly', 'clear', 'clearly', 'come', 'could', 'd', 'did', 'differ', 'different', 'differently', 'do', 'does', 'done', 'down', 'down', 'downed', 'downing', 'downs', 'during', 'e', 'each', 'early', 'either', 'end', 'ended', 'ending', 'ends', 'enough', 'even', 'evenly', 'ever', 'every', 'everybody', 'everyone', 'everything', 'everywhere', 'f', 'face', 'faces', 'fact', 'facts', 'far', 'felt', 'few', 'find', 'finds', 'first', 'for', 'four', 'from', 'full', 'fully', 'further', 'furthered', 'furthering', 'furthers', 'g', 'gave', 'general', 'generally', 'get', 'gets', 'give', 'given', 'gives', 'go', 'going', 'good', 'goods', 'got', 'great', 'greater', 'greatest', 'group', 'grouped', 'grouping', 'groups', 'h', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'herself', 'high', 'high', 'high', 'higher', 'highest', 'him', 'himself', 'his', 'how', 'however', 'i', 'if', 'important', 'in', 'interest', 'interested', 'interesting', 'interests', 'into', 'is', 'it', 'its', 'itself', 'j', 'just', 'k', 'keep', 'keeps', 'kind', 'knew', 'know', 'known', 'knows', 'l', 'large', 'largely', 'last', 'later', 'latest', 'least', 'less', 'let', 'lets', 'like', 'likely', 'long', 'longer', 'longest', 'm', 'made', 'make', 'making', 'man', 'many', 'may', 'me', 'member', 'members', 'men', 'might', 'more', 'most', 'mostly', 'mr', 'mrs', 'much', 'must', 'my', 'myself', 'n', 'necessary', 'need', 'needed', 'needing', 'needs', 'never', 'new', 'new', 'newer', 'newest', 'next', 'no', 'nobody', 'non', 'noone', 'not', 'nothing', 'now', 'nowhere', 'number', 'numbers', 'o', 'of', 'off', 'often', 'old', 'older', 'oldest', 'on', 'once', 'one', 'only', 'open', 'opened', 'opening', 'opens', 'or', 'order', 'ordered', 'ordering', 'orders', 'other', 'others', 'our', 'out', 'over', 'p', 'part', 'parted', 'parting', 'parts', 'per', 'perhaps', 'place', 'places', 'point', 'pointed', 'pointing', 'points', 'possible', 'present', 'presented', 'presenting', 'presents', 'problem', 'problems', 'put', 'puts', 'q', 'quite', 'r', 'rather', 'really', 'right', 'right', 'room', 'rooms', 's', 'said', 'same', 'saw', 'say', 'says', 'second', 'seconds', 'see', 'seem', 'seemed', 'seeming', 'seems', 'sees', 'several', 'shall', 'she', 'should', 'show', 'showed', 'showing', 'shows', 'side', 'sides', 'since', 'small', 'smaller', 'smallest', 'so', 'some', 'somebody', 'someone', 'something', 'somewhere', 'state', 'states', 'still', 'still', 'such', 'sure', 't', 'take', 'taken', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'therefore', 'these', 'they', 'thing', 'things', 'think', 'thinks', 'this', 'those', 'though', 'thought', 'thoughts', 'three', 'through', 'thus', 'to', 'today', 'together', 'too', 'took', 'toward', 'turn', 'turned', 'turning', 'turns', 'two', 'u', 'under', 'until', 'up', 'upon', 'us', 'use', 'used', 'uses', 'v', 'very', 'w', 'want', 'wanted', 'wanting', 'wants', 'was', 'way', 'ways', 'we', 'well', 'wells', 'went', 'were', 'what', 'when', 'where', 'whether', 'which', 'while', 'who', 'whole', 'whose', 'why', 'will', 'with', 'within', 'without', 'work', 'worked', 'working', 'works', 'would', 'x', 'y', 'year', 'years', 'yet', 'you', 'young', 'younger', 'youngest', 'your', 'yours', 'z']

def home(request):
	return render(request, 'D3/home.html', {})

def d3_visual(request):
	
	if "query" not in request.GET:
		query = "*"
	elif request.GET["query"] == "":
		query = "*"
	else:
		query = request.GET["query"]

	url = "http://localhost:8983/solr/collection1/select?q="+query+"&rows=50&wt=json&indent=true"
	response = urllib.urlopen(url);
	data = json.loads(response.read())

	#print json.dumps(data['response'], indent=4)
	
	response = data["response"]
	docs = response["docs"]
	
	wc_data = []
	pie_dict = {}
	d3_data = []
	for each in docs:
		if "title" not in each:
			continue
		d3_data += [{'id':each["id"], 'title':each["title"][0], 'content_type':each["content_type"][0], 'content_length':len(each["content"][0])}]
		
		# Build vocab for word cloud
		each_content = []
		
		if len(wc_data) < 2000:
			for word in re.split(' |\r|\n|\t|/',each["content"][0]):
				if len(word)>1 and (65<=ord(word[0])<=90 or 97<=ord(word[0])<122) and (65<=ord(word[-2])<=90 or 97<=ord(word[-2])<122):
					if word[-1] in ['.',':',',',')']:
						word = word[:-1]
					if "," in word or "." in word or ";" in word or ":" in word or str("\\") in word:
						continue
					try:
						word = str(word.lower())
						if word in stopwords:
							continue
						each_content.append(word)
					except:
						continue

		wc_data += each_content
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

	print wc_data[0:2000]
	return HttpResponse(json.dumps({"d3_data":d3_data, "word_cloud_data":wc_data}), content_type="application/json")

def banana_visual(request):
	return render(request, 'D3/banana_visual.html', {})

def facetview_visual(request):
	return render(request, 'D3/facetview_visual.html', {})
