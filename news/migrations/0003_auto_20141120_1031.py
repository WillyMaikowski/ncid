# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('news', '0002_auto_20141113_2240'),
    ]

    operations = [
        migrations.AlterField(
            model_name='slide',
            name='tag',
            field=models.CharField(max_length=64, null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='slidedraft',
            name='tag',
            field=models.CharField(max_length=64, null=True, blank=True),
        ),
    ]
