# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('quandl', '0003_auto_20150506_1544'),
    ]

    operations = [
        migrations.RenameField(
            model_name='stockprice',
            old_name='close_price',
            new_name='adj_close',
        ),
        migrations.RenameField(
            model_name='stockprice',
            old_name='high_price',
            new_name='adj_high',
        ),
        migrations.RenameField(
            model_name='stockprice',
            old_name='low_price',
            new_name='adj_low',
        ),
        migrations.RenameField(
            model_name='stockprice',
            old_name='open_price',
            new_name='adj_open',
        ),
    ]
