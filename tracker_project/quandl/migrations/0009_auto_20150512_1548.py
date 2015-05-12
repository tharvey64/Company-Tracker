# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('quandl', '0008_lastprice'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lastprice',
            name='updated_at',
            field=models.DateField(),
        ),
    ]
