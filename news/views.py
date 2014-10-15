# -*- coding: utf-8 -*-

import json
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponse,HttpResponseRedirect
from django.core import serializers
from django.shortcuts import render
from django import forms
from django.core.urlresolvers import reverse
from django.utils import timezone
from django.contrib.auth import authenticate, login, logout

from datetime import *
from itertools import chain
from news.models import Alert, Template, Event, Slide
from django.contrib.auth.decorators import user_passes_test

LoginURL = '/news/login'

# Forms
class EventForm(forms.ModelForm):
    class Meta:
        model = Event
        exclude = ('author', 'creation_timestamp',)
        widgets = {
            'date' : forms.DateInput(attrs = {'class': 'dateInput'}),
            'start_time' : forms.TimeInput(attrs = {'class': 'timeInput'}),
            'end_time' : forms.TimeInput(attrs = {'class': 'timeInput'}),
            'circulation_start' : forms.DateTimeInput(attrs = {'class': 'dateTimeInput'}),
            'circulation_end' : forms.DateTimeInput(attrs = {'class': 'dateTimeInput'}),
        }

class UploadImageForm(forms.Form):
    image = forms.ImageField()


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
    draft = forms.BooleanField(label=u"Borrador", required=False)

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
        slide.draft = data['draft']

        # Get the associated template.
        slide.template = Template.objects.get(pk=data['template'])

        # Get the associated event.
        event_id = data['associated_event']
        if event_id != None:
            slide.associated_event = Event.objects.get(pk=event_id)

# Tells if the user has edition permissions.
def user_can_edit(user):
    return user.is_authenticated() and user.has_perm('news.content_edition')

# Login and logout
def login_request(request):
    message = ''
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return HttpResponseRedirect(reverse('index'))
            else:
                message = "Cuenta desactivada."
        else:
            message = "Nombre de usuario o contraseña invalido."

    context = {'error_message': message, 'notify_message': ''}
    return render(request, 'news/login.html', context)

def logout_request(request):
    logout(request)
    context = {'message' : 'Sesion cerrada con exito.'}
    context = {'error_message': '', 'notify_message': 'Sesion cerrada con exito.'}
    return render(request, 'news/login.html', context)

# Pages used by the client.
@user_passes_test(user_can_edit, login_url=LoginURL)
def index(request):
    return HttpResponseRedirect(reverse('search_content'))

@user_passes_test(user_can_edit, login_url=LoginURL)
def add_event(request):
    if request.method == 'POST':
        # Check if cancel.
        if 'cancel' in request.POST:
            return HttpResponseRedirect(reverse('index'))

        form = EventForm(request.POST)
        if form.is_valid():
            event = form.save(commit=False)
            event.author = request.user.username
            event.save()
            return HttpResponseRedirect(reverse('edit_event', kwargs={'event_id': event.pk }))
    else:
        form = EventForm()

    context = {'form' : form}
    return render(request, 'news/add_event_form.html', context)

@user_passes_test(user_can_edit, login_url=LoginURL)
def edit_event(request, event_id):
    event = Event.objects.get(pk=event_id)
    if request.method == 'POST':
        # Check if cancel.
        if 'cancel' in request.POST:
            return HttpResponseRedirect(reverse('index'))

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
@user_passes_test(user_can_edit, login_url=LoginURL)
def edit_content(request, content_id):
    content = Slide.objects.get(pk=content_id)
    if request.method == 'POST':
        # Check if canceling a draft.
        if 'cancel' in request.POST:
            if content.draft:
                content.delete()
            return HttpResponse(json.dumps({'accepted': True}))

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

@user_passes_test(user_can_edit, login_url=LoginURL)
def upload_content_image(request, content_id):
    content = Slide.objects.get(pk=content_id)
    response = {'accepted': False}
    if request.method == 'POST':
        print 'Post image ' , request.POST
        print 'File image ' , request.FILES
        form = UploadImageForm(request.POST, request.FILES)
        if form.is_valid():
            print 'Post valid'
            content.image = request.FILES['image']
            content.save();
            response = {'accepted': True}

    return HttpResponseRedirect(reverse('edit_content', kwargs={'content_id': content.pk }))

@user_passes_test(user_can_edit, login_url=LoginURL)
def add_content(request):
    content = Slide()
    content.title = 'Borrador Sin Titulo'
    content.content = 'Borrador'
    content.template = Template.objects.all()[0]
    content.author = request.user.username
    content.save()

    return HttpResponseRedirect(reverse('edit_content', kwargs={'content_id': content.pk }))

@user_passes_test(user_can_edit, login_url=LoginURL)
def search_content(request):
    context = {}
    return render(request, 'news/search_content.html', context)

@user_passes_test(user_can_edit, login_url=LoginURL)
def news_display(request):
    context = {}
    return render(request, 'news/news_display.html', context)

# Content searches
def search_content_by_title(term):
    events = Event.objects.filter(title__icontains=term).order_by('-date', '-start_time')
    slides = Slide.objects.filter(draft=False, title__icontains=term).order_by('-circulation_start')
    return list(chain(events, slides))

def search_content_by_date(term):
    parsedDate = datetime.strptime(term, '%d/%m/%Y').date()
    events = Event.objects.filter(date=parsedDate).order_by('-date', '-start_time')
    slides = Slide.objects.filter(draft=False, circulation_start__lte=parsedDate, circulation_end__gte=parsedDate).order_by('-circulation_start')
    return list(chain(events, slides))


def dispatch_search_content_query(category, search_term):
    SearchMethods =  {
        'title' : search_content_by_title,
        'date' : search_content_by_date,
    }

    return SearchMethods[category] (search_term)

# Methods used via AJAX
@user_passes_test(user_can_edit, login_url=LoginURL)
def all_events(request):
    return HttpResponse(serializers.serialize("json", Event.objects.all()), content_type="application/json")    

@user_passes_test(user_can_edit, login_url=LoginURL)
def all_contents(request):
    return HttpResponse(serializers.serialize("json", Slide.objects.all()), content_type="application/json")    

@user_passes_test(user_can_edit, login_url=LoginURL)
def get_content(request, content_id):
    content = Slide.objects.get(pk=content_id)
    return HttpResponse(serializers.serialize("json", [content]), content_type="application/json")

@user_passes_test(user_can_edit, login_url=LoginURL)
def search_content_query_json(request):
    category = request.GET['category']
    search_term = request.GET['term']

    try:
        queryResult = dispatch_search_content_query(category, search_term)
        return HttpResponse(serializers.serialize("json", queryResult), content_type="application/json")
    except (KeyError, ValueError):
        return HttpResponse("[]", content_type="application/json")
    
# Public AJAX methods
def all_slide_templates(request):
    return HttpResponse(serializers.serialize("json", Template.objects.all()), content_type="application/json")

def current_events(request):
    return HttpResponse(serializers.serialize("json", Event.current_events()), content_type="application/json")

def current_alerts(request):
    return HttpResponse(serializers.serialize("json", Alert.current_alerts()), content_type="application/json")

def current_slides(request):
    return HttpResponse(serializers.serialize("json", Slide.current_slides()), content_type="application/json")

def current_drafts(request):
    return HttpResponse(serializers.serialize("json", Slide.current_drafts(request.user)), content_type="application/json")

