from django.http import HttpResponse
from django.core import serializers
from django.shortcuts import render
from django.forms import ModelForm

from news.models import Alert, Template, Event, Slide

# Forms
class EventForm(ModelForm):
    class Meta:
        model = Event
        exclude = ('creation_date',)

# Pages used by the client.
def index(request):
    context = {}
    return render(request, 'news/index.html', context)

def add_event(request):
    if request.method == 'POST':
        form = EventForm(request.POST)
        if form.is_valid():
            return HttpResponseRedirect(reverse('index:results'))
    else:
        form = EventForm()

    context = {'form' : form}
    return render(request, 'news/event_form.html', context)

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
    return HttpResponse(serializers.serialize("json", Event.current_events()), content_type="application/json")

def current_alerts(request):
    return HttpResponse(serializers.serialize("json", Alert.current_alerts()), content_type="application/json")

def current_slides(request):
    return HttpResponse(serializers.serialize("json", Slide.current_slides()), content_type="application/json")

