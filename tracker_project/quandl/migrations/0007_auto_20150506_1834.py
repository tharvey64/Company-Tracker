# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('quandl', '0006_auto_20150506_1635'),
    ]

    operations = [
        migrations.AlterField(
            model_name='stockprice',
            name='created_at',
            field=models.DateField(),
            preserve_default=True,
        ),
    ]
