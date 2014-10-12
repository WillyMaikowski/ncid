# -*- coding: utf-8 -*-

import json
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponse,HttpResponseRedirect
from django.core import serializers
from django.shortcuts import render
from django import forms
from django.core.urlresolvers import reverse
from django.utils import timezone

from datetime import *

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
    title = forms.CharField(label=u"Titulo", max_length=255)
    text = forms.CharField(label=u"Texto")
    image = forms.ImageField(label=u"Imagen", required=False)
    template = forms.IntegerField()

    start_date = forms.DateField(label=u"Comienzo de circulación")
    start_time = forms.TimeField(label=u"Hora del comienzo de circulación")

    end_date = forms.DateField(label=u"Fin de circulación")
    end_time = forms.TimeField(label=u"Hora del fin de circulación")

    display_duration = forms.FloatField(label=u"Tiempo en pantalla")
    published = forms.BooleanField(label=u"Publicado", required=False)
    associated_event = forms.IntegerField(required=False)

    def store_in_slide(self, slide):
        data = self.cleaned_data
        slide.title = data['title']
        slide.content = data['text']
        slide.image = data['image']

        tz = timezone.get_default_timezone()
        slide.circulation_start = timezone.make_aware(datetime.combine(data['start_date'], data['start_time']), tz)
        slide.circulation_end = timezone.make_aware(datetime.combine(data['end_date'], data['end_time']), tz)

        slide.display_duration = data['display_duration']
        slide.published = data['published']

        # Get the associated template.
        slide.template = Template.objects.get(pk=data['template'])

        # Get the associated event.
        event_id = data['associated_event']
        if event_id != None:
            slide.associated_event = Event.objects.get(pk=event_id)

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

@ensure_csrf_cookie
def edit_content(request, content_id):
    content = Slide.objects.get(pk=content_id)
    if request.method == 'POST':
        form = SlideForm(request.POST)
        response = {}

        if form.is_valid():
            response['accepted'] = True

            # Store the slide data.
            form.store_in_slide(content)
            content.save()
        else:
            response['accepted'] = False
            response['errors'] = form.errors
        return HttpResponse(json.dumps(response), content_type="application/json")


    context = {'content' : content}
    return render(request, 'news/edit_content.html', context)

@ensure_csrf_cookie
def add_content(request):
    if request.method == 'POST':
        form = SlideForm(request.POST)
        response = {}

        if form.is_valid():
            response['accepted'] = True

            # Store the slide data.
            slide = Slide();
            form.store_in_slide(slide)
            slide.save()

            # Send back the id
            response['id'] = slide.pk

        else:
            response['accepted'] = False
            response['errors'] = form.errors
        return HttpResponse(json.dumps(response), content_type="application/json")

    context = {}
    return render(request, 'news/add_content.html', context)

def search_content(request):
    context = {}
    return render(request, 'news/search_content.html', context)

def news_display(request):
    context = {}
    return render(request, 'news/news_display.html', context)

# Methods used via AJAX
def get_content(request, content_id):
    content = Slide.objects.get(pk=content_id)
    return HttpResponse(serializers.serialize("json", [content]), content_type="application/json")

def all_slide_templates(request):
    return HttpResponse(serializers.serialize("json", Template.objects.all()), content_type="application/json")

def current_events(request):
    return HttpResponse(serializers.serialize("json", Event.current_events()), content_type="application/json")

def current_alerts(request):
    return HttpResponse(serializers.serialize("json", Alert.current_alerts()), content_type="application/json")

def current_slides(request):
    return HttpResponse(serializers.serialize("json", Slide.current_slides()), content_type="application/json")

