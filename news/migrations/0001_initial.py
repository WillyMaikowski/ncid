# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.db.models.deletion
import news.models
import django.utils.timezone
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('author', models.CharField(default=news.models.current_author, max_length=64, verbose_name='Author')),
                ('title', models.CharField(max_length=255, verbose_name='Titulo')),
                ('image', models.ImageField(upload_to=b'news-images/%Y/%m/%d', null=True, verbose_name='Imagen', blank=True)),
                ('circulation_start', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Comienzo de circulaci\xf3n')),
                ('circulation_end', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Fin de circulaci\xf3n')),
                ('published', models.BooleanField(default=False, verbose_name='Publicado')),
                ('creation_timestamp', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Fecha y hora de Creaci\xf3n')),
                ('last_modification_timestamp', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Fecha y hora de ultima modificaci\xf3n')),
                ('lecturer', models.CharField(max_length=100, verbose_name='Charlista')),
                ('place', models.CharField(max_length=255, verbose_name='Lugar')),
                ('date_time', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Fecha y Hora')),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Slide',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('author', models.CharField(default=news.models.current_author, max_length=64, verbose_name='Author')),
                ('title', models.CharField(max_length=255, verbose_name='Titulo')),
                ('image', models.ImageField(upload_to=b'news-images/%Y/%m/%d', null=True, verbose_name='Imagen', blank=True)),
                ('circulation_start', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Comienzo de circulaci\xf3n')),
                ('circulation_end', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Fin de circulaci\xf3n')),
                ('published', models.BooleanField(default=False, verbose_name='Publicado')),
                ('creation_timestamp', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Fecha y hora de Creaci\xf3n')),
                ('last_modification_timestamp', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Fecha y hora de ultima modificaci\xf3n')),
                ('content', models.TextField(verbose_name='Contenido', blank=True)),
                ('display_duration', models.FloatField(default=15.0, verbose_name='Tiempo en pantalla', validators=[django.core.validators.MinValueValidator(1.0)])),
                ('saved', models.BooleanField(default=False)),
            ],
            options={
                'permissions': (('content_edition', 'Can perform content edition'),),
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='SlideDraft',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('author', models.CharField(default=news.models.current_author, max_length=64, verbose_name='Author')),
                ('title', models.CharField(max_length=255, verbose_name='Titulo')),
                ('image', models.ImageField(upload_to=b'news-images/%Y/%m/%d', null=True, verbose_name='Imagen', blank=True)),
                ('circulation_start', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Comienzo de circulaci\xf3n')),
                ('circulation_end', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Fin de circulaci\xf3n')),
                ('published', models.BooleanField(default=False, verbose_name='Publicado')),
                ('creation_timestamp', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Fecha y hora de Creaci\xf3n')),
                ('last_modification_timestamp', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Fecha y hora de ultima modificaci\xf3n')),
                ('content', models.TextField(verbose_name='Contenido', blank=True)),
                ('display_duration', models.FloatField(default=15.0, verbose_name='Tiempo en pantalla', validators=[django.core.validators.MinValueValidator(1.0)])),
            ],
            options={
                'abstract': False,
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('name', models.CharField(max_length=64, serialize=False, primary_key=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Template',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=100)),
                ('image_url', models.CharField(max_length=100)),
                ('has_title', models.BooleanField(default=True)),
                ('has_text', models.BooleanField(default=True)),
                ('has_image', models.BooleanField(default=True)),
                ('slide_class', models.CharField(max_length=100)),
                ('title_class', models.CharField(max_length=100)),
                ('text_class', models.CharField(max_length=100)),
                ('image_class', models.CharField(max_length=100)),
                ('container_class', models.CharField(max_length=100)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='slidedraft',
            name='tag',
            field=models.ForeignKey(on_delete=django.db.models.deletion.SET_NULL, to='news.Tag', null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='slidedraft',
            name='template',
            field=models.ForeignKey(to='news.Template'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='slide',
            name='draft_version',
            field=models.ForeignKey(on_delete=django.db.models.deletion.SET_NULL, default=None, blank=True, to='news.SlideDraft', null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='slide',
            name='tag',
            field=models.ForeignKey(on_delete=django.db.models.deletion.SET_NULL, to='news.Tag', null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='slide',
            name='template',
            field=models.ForeignKey(to='news.Template'),
            preserve_default=True,
        ),
    ]
