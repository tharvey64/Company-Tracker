# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ('quandl', '0009_auto_20150512_1548'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lastprice',
            name='updated_at',
            field=models.DateField(default=datetime.date(2004, 12, 31)),
        ),
    ]
