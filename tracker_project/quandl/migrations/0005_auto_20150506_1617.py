# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('quandl', '0004_auto_20150506_1617'),
    ]

    operations = [
        migrations.RenameField(
            model_name='stockprice',
            old_name='volume',
            new_name='adj_volume',
        ),
    ]
