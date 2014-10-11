# -*- coding: utf-8 -*-
from django.db import models
from django.utils import timezone

class Alert(models.Model):
    message = models.CharField(u"Mensaje", max_length=100)
    alert_date = models.DateTimeField(u"Fecha de alerta")
    solved = models.BooleanField(u"Resuelta", default=False)

    @classmethod
    def current_alerts(cls):
        now = timezone.now()
        return cls.objects.filter(alert_date__lte = now, solved = False)

class Event(models.Model):
    title = models.CharField(u"Titulo", max_length=100)
    place = models.CharField(u"Lugar", max_length=32)    
    creation_date = models.DateTimeField(u"Fecha de creación")
    event_date_and_time = models.DateTimeField(u"Fecha y hora del evento")
    circulation_start = models.DateTimeField(u"Comienzo de circulación")
    circulation_end = models.DateTimeField(u"Fin de circulación")

    @classmethod
    def current_events(cls):
        now = timezone.now()
        return cls.objects.filter(circulation_start__lte = now, circulation_end__gte = now)


class Template(models.Model):
    name = models.CharField(max_length=60)
    css_class = models.CharField(max_length=30)

    def __unicode__(self):
        return "'%s' -> '%s'"  % (self.name, self.css_class)

class Slide(models.Model):
    title = models.CharField(max_length=100)
    creation_date = models.DateTimeField()
    circulation_start = models.DateTimeField()
    circulation_end = models.DateTimeField()
    display_duration = models.IntegerField()
    content = models.TextField()
    image = models.ImageField(upload_to='new-images', null=True, blank=True)
    template = models.ForeignKey(Template)
    associated_event = models.ForeignKey(Event, null=True, blank=True)

    @classmethod
    def current_slides(cls):
        now = timezone.now()
        return cls.objects.filter(circulation_start__lte = now, circulation_end__gte = now)

