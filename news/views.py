from django.http import HttpResponse
from django.core import serializers
from django.shortcuts import render

from news.models import Template, Event, Slide

# Pages used by the client.
def index(request):
    context = {}
    return render(request, 'news/index.html', context)

def add_event(request):
    context = {}
    return render(request, 'news/add_event.html', context)

def add_content(request):
    context = {'templates' : Template.objects.all()}
    return render(request, 'news/add_content.html', context)

def search_content(request):
    context = {}
    return render(request, 'news/search_content.html', context)

def news_display(request):
    context = {}
    return render(request, 'news/news_display.html', context)

# Methods used via AJAX
def all_slide_templates(request):
    return HttpResponse(serializers.serialize("json", Template.objects.all()), content_type="application/json")

def current_events(request):
    return HttpResponse("Current Events")

