from django.db import models

class Event(models.Model):
    creation_date = models.DateTimeField()
    event_date_and_time = models.DateTimeField()
    circulation_start = models.DateTimeField()
    circulation_end = models.DateTimeField()
    title = models.CharField(max_length=100)
    place = models.CharField(max_length=32)    

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
