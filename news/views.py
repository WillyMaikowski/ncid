from django.http import HttpResponse,HttpResponseRedirect
from django.core import serializers
from django.shortcuts import render
from django import forms
from django.core.urlresolvers import reverse
from django.utils import timezone

from news.models import Alert, Template, Event, Slide

# Forms
class EventForm(forms.ModelForm):
    class Meta:
        model = Event
        exclude = ('creation_timestamp',)
        widgets = {
            'date' : forms.DateInput(attrs = {'class': 'dateInput'}),
            'start_time' : forms.TimeInput(attrs = {'class': 'timeInput'}),
            'end_time' : forms.TimeInput(attrs = {'class': 'timeInput'}),
        }

class SlideForm(forms.Form):
    class Meta:
        model = Slide
        exclude = ('creation_timestamp',)


# Pages used by the client.
def index(request):
    context = {}
    return render(request, 'news/index.html', context)

def add_event(request):
    if request.method == 'POST':
        form = EventForm(request.POST)
        if form.is_valid():
            event = form.save()
            return HttpResponseRedirect(reverse('edit_event', kwargs={'event_id': event.pk }))
    else:
        form = EventForm()

    context = {'form' : form}
    return render(request, 'news/add_event_form.html', context)

def edit_event(request, event_id):
    event = Event.objects.get(pk=event_id)
    if request.method == 'POST':
        # Check if deleting.
        if 'delete' in request.POST:
            event.delete()
            return HttpResponseRedirect(reverse('index'))

        # Validate the form and change the event.
        form = EventForm(request.POST, instance=event)
        if form.is_valid():
            event = form.save()
            return HttpResponseRedirect(reverse('edit_event', kwargs={'event_id': event.pk }))
    else:
        form = EventForm(instance=event)

    # Render the page.
    context = {'form' : form,
                'event_id' : event_id,
                'creation_timestamp' : event.creation_timestamp}
    return render(request, 'news/edit_event_form.html', context)

def edit_content(request, content_id):
    content = Event.objects.get(pk=content_id)
    if request.method == 'POST':
        pass

    context = {'content' : content}
    return render(request, 'news/edit_content.html', context)

def add_content(request):
    context = {}
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

