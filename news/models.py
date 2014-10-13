# -*- coding: utf-8 -*-
from django.db import models
from django.utils import timezone

def current_author():
    return 'unknown'

class Alert(models.Model):
    message = models.CharField(u"Mensaje", max_length=100)
    alert_date = models.DateTimeField(u"Fecha de alerta")
    solved = models.BooleanField(u"Resuelta", default=False)

    @classmethod
    def current_alerts(cls):
        now = timezone.now()
        return cls.objects.filter(alert_date__lte = now, solved = False).order_by('alert_date')

class Event(models.Model):
    author = models.CharField(u"Author", max_length=64, default=current_author)
    title = models.CharField(u"Titulo", max_length=255)
    lecturer = models.CharField(u"Charlista", max_length=100)
    place = models.CharField(u"Lugar", max_length=255)
    date = models.DateField(u"Fecha")
    start_time = models.TimeField(u"Hora de comienzo")
    end_time = models.TimeField(u"Hora de fin")
    published = models.BooleanField(u"Publicado", default=False)
    creation_timestamp = models.DateTimeField(u"Fecha y hora de Creación", default=timezone.now)

    @classmethod
    def current_events(cls):
        now = timezone.now()
        return cls.objects.filter(published=True, date = now.date(), end_time__gte = now.time()).order_by('date', 'start_time')

    def __unicode__(self):
        return "%s %s - %s '%s' - %s" % (str(self.date), str(self.start_time), str(self.end_time), self.title, self.lecturer)

class Template(models.Model):
    name = models.CharField(max_length=100)
    css_class = models.CharField(max_length=100)
    image_url = models.CharField(max_length=100)

    def __unicode__(self):
        return "'%s' -> '%s'"  % (self.name, self.css_class)

class Slide(models.Model):
    author = models.CharField(u"Titulo", max_length=64, default=current_author)
    title = models.CharField(u"Titulo", max_length=255)
    content = models.TextField(u"Contenido")
    image = models.ImageField(u"Imagen", upload_to='news-images', null=True, blank=True)
    template = models.ForeignKey(Template)

    circulation_start = models.DateTimeField(u"Comienzo de circulación", default=timezone.now)
    circulation_end = models.DateTimeField(u"Fin de circulación", default=timezone.now)

    display_duration = models.FloatField(u"Tiempo en pantalla", default=15.0)
    published = models.BooleanField(u"Publicado", default=False)
    draft = models.BooleanField(u"Borrador", default=True)
    associated_event = models.ForeignKey(Event, null=True, blank=True)

    creation_date = models.DateTimeField(u"Fecha y hora de creación", default=timezone.now)
    last_modification_date = models.DateTimeField(u"Fecha y hora de ultima modificación", default=timezone.now)

    @classmethod
    def current_slides(cls):
        now = timezone.now()
        return cls.objects.filter(published=True, circulation_start__lte = now, circulation_end__gte = now).order_by('-circulation_start')

    @classmethod
    def current_drafts(cls):
        now = timezone.now()
        return cls.objects.filter(draft = True).order_by('-creation_date')

