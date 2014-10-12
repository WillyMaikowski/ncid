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
        return cls.objects.filter(alert_date__lte = now, solved = False).order_by('alert_date')

class Event(models.Model):
    title = models.CharField(u"Titulo", max_length=100)
    lecturer = models.CharField(u"Charlista", max_length=100)
    place = models.CharField(u"Lugar", max_length=32)  
    date = models.DateField(u"Fecha")
    start_time = models.TimeField(u"Hora de comienzo")
    end_time = models.TimeField(u"Hora de fin")
    creation_timestamp = models.DateTimeField(u"Fecha y hora de Creación", default=timezone.now)

    @classmethod
    def current_events(cls):
        now = timezone.now()
        return cls.objects.filter(date = now.date(), end_time__gte = now.time()).order_by('date', 'start_time')

    def __unicode__(self):
        return "%s %s - %s '%s' - %s" % (str(self.date), str(self.start_time), str(self.end_time), self.title, self.lecturer)

class Template(models.Model):
    name = models.CharField(max_length=100)
    css_class = models.CharField(max_length=100)

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

