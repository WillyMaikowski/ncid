# -*- coding: utf-8 -*-
from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone

def current_author():
    return 'unknown'

class Content(models.Model):
    author = models.CharField(u"Author", max_length=64, default=current_author)
    title = models.CharField(u"Titulo", max_length=255)
    image = models.ImageField(u"Imagen", upload_to='news-images/%Y/%m/%d', null=True, blank=True)
    circulation_start = models.DateTimeField(u"Comienzo de circulación", default=timezone.now)
    circulation_end = models.DateTimeField(u"Fin de circulación", default=timezone.now)
    published = models.BooleanField(u"Publicado", default=False)

    creation_timestamp = models.DateTimeField(u"Fecha y hora de Creación", default=timezone.now)
    last_modification_timestamp = models.DateTimeField(u"Fecha y hora de ultima modificación", default=timezone.now)

    class Meta:
        abstract = True

class Event(Content):
    lecturer = models.CharField(u"Charlista", max_length=100)
    place = models.CharField(u"Lugar", max_length=255)
    date_time = models.DateTimeField(u"Fecha y Hora", default=timezone.now)

    @classmethod
    def current_events(cls):
        now = timezone.now()
        return cls.objects.filter(published=True, circulation_start__lte = now, circulation_end__gte = now).order_by('date_time')

    def __unicode__(self):
        return "%s %s - %s '%s' - %s" % (str(self.date), str(self.start_time), str(self.end_time), self.title, self.lecturer)

class Template(models.Model):
    name = models.CharField(max_length=100)
    image_url = models.CharField(max_length=100)

    has_title = models.BooleanField(default=True)
    has_text = models.BooleanField(default=True)
    has_image = models.BooleanField(default=True)

    slide_class = models.CharField(max_length=100)
    title_class = models.CharField(max_length=100)
    text_class = models.CharField(max_length=100)
    image_class = models.CharField(max_length=100)
    container_class = models.CharField(max_length=100)

class Slide(Content):
    content = models.TextField(u"Contenido", blank=True)
    template = models.ForeignKey(Template)
    display_duration = models.FloatField(u"Tiempo en pantalla", default=15.0, validators=[MinValueValidator(1.0)])
    draft = models.BooleanField(u"Borrador", default=True)

    @classmethod
    def current_slides(cls):
        now = timezone.now()
        return cls.objects.filter(published=True, circulation_start__lte = now, circulation_end__gte = now).order_by('-circulation_start')

    @classmethod
    def current_drafts(cls, user):
        now = timezone.now()
        return cls.objects.filter(draft = True, author = user.username).order_by('-creation_timestamp')

    class Meta:
        permissions = (
            ("content_edition", "Can perform content edition"),
        )

