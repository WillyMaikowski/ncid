# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('news', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='lecturer',
            field=models.CharField(max_length=100, verbose_name='Charlista', blank=True),
        ),
    ]
