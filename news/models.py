# -*- coding: utf-8 -*-
from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone

def current_author():
    return 'unknown'

# Content abstract base class
class Content(models.Model):
    author = models.CharField(u"Author", max_length=64, default=current_author)
    title = models.CharField(u"Titulo", max_length=255)
    image = models.ImageField(u"Imagen", upload_to='news-images/%Y/%m/%d', null=True, blank=True)
    circulation_start = models.DateTimeField(u"Comienzo de circulación", default=timezone.now)
    circulation_end = models.DateTimeField(u"Fin de circulación", default=timezone.now)
    published = models.BooleanField(u"Publicado", default=False)

    creation_timestamp = models.DateTimeField(u"Fecha y hora de Creación", default=timezone.now)
    last_modification_timestamp = models.DateTimeField(u"Fecha y hora de ultima modificación", default=timezone.now)

    def setContent(self, content):
        self.author = content.author
        self.title = content.title
        self.image = content.image
        self.circulation_start = content.circulation_start
        self.circulation_end = content.circulation_end
        self.published = content.published

        self.creation_timestamp = content.creation_timestamp
        self.last_modification_timestamp = content.last_modification_timestamp

    class Meta:
        abstract = True

# Event class
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

# Content tag
class Tag(models.Model):
    name = models.CharField(max_length=64, primary_key=True)

# Template class
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

# Slide common base class
class SlideCommon(Content):
    content = models.TextField(u"Contenido", blank=True)
    template = models.ForeignKey(Template)
    tag = models.ForeignKey(Tag, null=True, on_delete = models.SET_NULL)
    display_duration = models.FloatField(u"Tiempo en pantalla", default=15.0, validators=[MinValueValidator(1.0)])

    def setContent(self, content):
        Content.setContent(self, content)
        self.content = content.content
        self.template = content.template
        self.tag = content.tag
        self.display_duration = content.display_duration

    class Meta:
        abstract = True

# Slide draft
class SlideDraft(SlideCommon):
    pass

# Slide
class Slide(SlideCommon):
    draft_version = models.ForeignKey(SlideDraft, null=True, blank=True, default=None, on_delete = models.SET_NULL)
    saved = models.BooleanField(blank=True, default=False)

    @classmethod
    def current_slides(cls):
        now = timezone.now()
        return cls.objects.filter(published=True, circulation_start__lte = now, circulation_end__gte = now).order_by('-circulation_start')

    @classmethod
    def current_drafts(cls, user):
        now = timezone.now()
        return cls.objects.filter(draft_version__isnull = False, author = user.username).order_by('-creation_timestamp')

    class Meta:
        permissions = (
            ("content_edition", "Can perform content edition"),
        )

