# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('quandl', '0005_auto_20150506_1617'),
    ]

    operations = [
        migrations.RenameField(
            model_name='stockprice',
            old_name='adj_close',
            new_name='close_price',
        ),
        migrations.RenameField(
            model_name='stockprice',
            old_name='adj_high',
            new_name='high_price',
        ),
        migrations.RenameField(
            model_name='stockprice',
            old_name='adj_low',
            new_name='low_price',
        ),
        migrations.RenameField(
            model_name='stockprice',
            old_name='adj_open',
            new_name='open_price',
        ),
        migrations.RenameField(
            model_name='stockprice',
            old_name='adj_volume',
            new_name='volume',
        ),
    ]
